import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const schema = z.object({
  painPointTitle: z.string().min(1),
  idea: z.string().min(1),
});

const anthropic = new Anthropic();

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

  const { painPointTitle, idea } = parsed.data;

  const prompt = `Given this pain point: "${painPointTitle}"
And this startup idea: "${idea}"

Return a brief analysis in JSON:
{
  "targetAudience": "string — who specifically experiences this pain",
  "suggestedSolution": "string — how the idea could solve this specifically",
  "monetizationAngle": "string — how to charge for solving this"
}`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const raw =
      message.content[0].type === "text" ? message.content[0].text : "";
    const text = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();

    const result = JSON.parse(text) as {
      targetAudience: string;
      suggestedSolution: string;
      monetizationAngle: string;
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("AI analysis error:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
