import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  idea: z.string().min(5, "Idea is too short").max(500, "Idea is too long"),
});

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().split("T")[0];
  const admin = createAdminClient();

  // Check if user is on pro plan — pro users have unlimited scans
  const { data: profile } = await admin
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  const isPro = (profile as { plan: string } | null)?.plan === "pro";

  if (!isPro) {
    const { data: usage } = await admin
      .from("scan_usage")
      .select("count")
      .eq("user_id", user.id)
      .eq("date", today)
      .single();

    const currentCount = (usage as { count: number } | null)?.count ?? 0;

    if (currentCount >= 3) {
      return NextResponse.json({ error: "scan_limit_reached" }, { status: 429 });
    }

    // Increment usage before running (reserves the slot)
    await admin.from("scan_usage").upsert(
      { user_id: user.id, date: today, count: currentCount + 1 },
      { onConflict: "user_id,date" }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { idea } = parsed.data;

  const prompt = `You are a Reddit research assistant helping validate a startup idea by finding real user pain points.

Startup idea: "${idea}"

Your job is to find Reddit posts where people are PERSONALLY EXPERIENCING the problem this product solves — not posts discussing the topic, debating it, or commenting on it from the outside.

Step 1: Identify the core problem this product solves from the CUSTOMER's perspective.
Step 2: Generate 10 search queries that find people expressing that frustration in first-person terms.

Good query examples (for an interview prep tool idea):
- "failed technical interview again"
- "keep freezing up during coding interviews"
- "rejected after leetcode interview"
- "nervous during live coding"

Bad query examples — DO NOT generate these:
- "interview cheat tool"
- "interview AI assistant"
- "technical interview cheating"
- anything describing the product, solution, or the debate around it

The queries must find people venting, struggling, asking for help, or expressing a real frustration — not people discussing the product category.

Also identify the 8 subreddits where people in this target audience would go to vent about or discuss their struggles.

Return only JSON in this exact shape:
{
  "searchQueries": ["string", "string", ...],
  "subreddits": ["string", "string", ...]
}`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const raw =
      message.content[0].type === "text" ? message.content[0].text : "";
    const text = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();

    const result = JSON.parse(text) as {
      searchQueries: string[];
      subreddits: string[];
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("Claude API error:", err);
    return NextResponse.json(
      { error: "Failed to generate search queries" },
      { status: 500 }
    );
  }
}
