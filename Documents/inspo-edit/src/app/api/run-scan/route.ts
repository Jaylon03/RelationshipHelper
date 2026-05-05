import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  idea: z.string(),
  searchQueries: z.array(z.string()),
  subreddits: z.array(z.string()),
});

interface RedditPost {
  title: string;
  selftext: string;
  score: number;
  num_comments: number;
  permalink: string;
  subreddit: string;
}

interface RedditSearchResponse {
  data: {
    children: Array<{ data: RedditPost }>;
  };
}

// Public Reddit JSON API — no credentials needed
const USER_AGENT = "Validly/1.0 (startup idea validator; contact: validly.fyi)";

async function searchSubreddit(
  subreddit: string,
  query: string
): Promise<RedditPost[]> {
  const url = `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/search.json?q=${encodeURIComponent(query)}&sort=relevance&t=year&limit=25&restrict_sr=1`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as RedditSearchResponse;
    return data.data.children
      .map((c) => c.data)
      .filter((p) => p.score > 0 && (p.title.length > 10 || p.selftext.length > 20));
  } catch {
    return [];
  }
}

async function searchAll(query: string): Promise<RedditPost[]> {
  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=relevance&t=year&limit=25`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as RedditSearchResponse;
    return data.data.children
      .map((c) => c.data)
      .filter((p) => p.score > 0 && (p.title.length > 10 || p.selftext.length > 20));
  } catch {
    return [];
  }
}

export async function POST(req: NextRequest) {
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

  const { searchQueries, subreddits } = parsed.data;

  // Top 3 subreddits × top 3 queries + 2 broad searches = 11 calls max
  const topSubreddits = subreddits.slice(0, 3);
  const topQueries = searchQueries.slice(0, 3);
  const broadQueries = searchQueries.slice(0, 2);

  const promises: Promise<RedditPost[]>[] = [
    ...topSubreddits.flatMap((sub) => topQueries.map((q) => searchSubreddit(sub, q))),
    ...broadQueries.map((q) => searchAll(q)),
  ];

  const results = await Promise.allSettled(promises);

  const allPosts: RedditPost[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") allPosts.push(...result.value);
  }

  // Deduplicate by permalink
  const seen = new Set<string>();
  const posts = allPosts.filter((p) => {
    if (seen.has(p.permalink)) return false;
    seen.add(p.permalink);
    return true;
  });

  return NextResponse.json({ posts });
}
