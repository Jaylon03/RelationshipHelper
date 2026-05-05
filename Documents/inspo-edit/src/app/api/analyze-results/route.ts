import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const redditPostSchema = z.object({
  title: z.string(),
  selftext: z.string(),
  score: z.number(),
  num_comments: z.number(),
  permalink: z.string(),
  subreddit: z.string(),
});

const schema = z.object({
  idea: z.string(),
  posts: z.array(redditPostSchema),
  subreddits: z.array(z.string()),
});

interface PainPointResult {
  rank: number;
  title: string;
  score: number;
  subreddit: string;
  evidence: string[];
  signal: "validates" | "challenges";
}

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { idea, posts, subreddits } = parsed.data;

  // Sort by engagement and limit to avoid token overuse
  const topPosts = [...posts]
    .sort((a, b) => b.score + b.num_comments - (a.score + a.num_comments))
    .slice(0, 40);

  const rawPosts = topPosts
    .map(
      (p, i) =>
        `Post ${i + 1} [r/${p.subreddit}] Score:${p.score} Comments:${p.num_comments}\nTitle: ${p.title}\nContent: ${p.selftext.slice(0, 300)}`
    )
    .join("\n\n---\n\n");

  const prompt = `You are a startup market research analyst. Below are Reddit posts collected while researching this idea:

Idea: "${idea}"

Posts:
${rawPosts}

Your job is to extract REAL PAIN POINTS — specific frustrations that real people personally experience, which this product could solve.

A real pain point looks like:
- Someone venting about a recurring struggle ("I keep failing interviews even after months of prep")
- Someone asking for help with a problem they can't solve ("How do I stop freezing up during live coding?")
- Someone expressing an unmet need ("I wish there was a way to practice with real interview pressure")

NOT a pain point:
- People debating ethics or opinions about a topic
- News or commentary about an industry trend
- Third-party observations ("companies are struggling with X")
- Discussions about tools or products that already exist

For each pain point you find:
- Write a title that names the specific struggle the CUSTOMER faces (not what the product does)
- Score it 0-100 based on how frequently and intensely it appears across posts
- Pick the subreddit where it appeared most
- Pull 3-5 direct quotes from people who personally expressed this pain (first-person language preferred)
- Mark as "validates" if this pain is exactly what the idea solves, "challenges" if it suggests the idea won't work or faces a major obstacle

Only return pain points that are clearly expressed by real users in the posts. If the posts don't contain genuine user pain, return fewer results rather than inventing them.

Return only JSON in this exact shape:
{
  "painPoints": [
    {
      "rank": 1,
      "title": "string",
      "score": 90,
      "subreddit": "string",
      "evidence": ["string", "string", "string"],
      "signal": "validates" | "challenges"
    }
  ]
}`;

  let painPointsData: PainPointResult[];

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const raw =
      message.content[0].type === "text" ? message.content[0].text : "";
    const text = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();

    const result = JSON.parse(text) as { painPoints: PainPointResult[] };
    painPointsData = result.painPoints;
  } catch (err) {
    console.error("Claude API error:", err);
    return NextResponse.json(
      { error: "Failed to analyze results" },
      { status: 500 }
    );
  }

  // Save scan and pain points to Supabase
  const admin = createAdminClient();

  const { data: scan, error: scanError } = await admin
    .from("scans")
    .insert({
      user_id: user.id,
      idea,
      subreddits,
      status: "completed",
    })
    .select("id")
    .single();

  if (scanError || !scan) {
    console.error("Scan insert error:", scanError);
    return NextResponse.json(
      { error: "Failed to save scan" },
      { status: 500 }
    );
  }

  const { error: ppError } = await admin.from("pain_points").insert(
    painPointsData.map((pp) => ({
      scan_id: scan.id,
      user_id: user.id,
      rank: pp.rank,
      title: pp.title,
      score: pp.score,
      subreddit: pp.subreddit,
      evidence: pp.evidence,
      signal: pp.signal,
      is_saved: false,
    }))
  );

  if (ppError) {
    console.error("Pain points insert error:", ppError);
  }

  return NextResponse.json({ scanId: scan.id });
}
