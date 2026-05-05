import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ReportData } from "@/lib/types";

const schema = z.object({
  skills: z.array(z.string()).min(1, "At least one skill required"),
  hours: z.number().min(1).max(40),
  urgency: z.enum(["this week", "this month", "next 3 months"]),
  target: z.enum(["$500", "$1k", "$2.5k", "$5k+"]),
  restrictions: z.array(z.string()),
  tried: z.string().optional(),
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
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { skills, hours, urgency, target, restrictions, tried } = parsed.data;

  const prompt = `You are an income strategy advisor. Based on the profile below, generate a personalized income roadmap.

Profile:
- Skills: ${skills.join(", ")}
- Hours per week available: ${hours}
- Time to first income needed: ${urgency}
- Target monthly income: ${target}
- Unwilling to do: ${restrictions.length > 0 ? restrictions.join(", ") : "Nothing specified"}
- Previously tried: ${tried || "Nothing specified"}

Return a structured JSON response with this exact shape:
{
  "headline": "string — one bold sentence summarizing their best path",
  "topPath": {
    "name": "string — name of the income path",
    "why": "string — why this fits their profile specifically",
    "timeToFirstDollar": "string — realistic estimate",
    "earningPotential": "string — realistic monthly range",
    "firstWeekPlan": ["string", "string", "string", "string", "string", "string", "string"],
    "whoToTarget": "string — specific description of their ideal first customer",
    "whatToCharge": "string — specific pricing recommendation with rationale",
    "pitchScript": "string — one paragraph they can copy-paste to reach out to their first client or customer"
  },
  "alternativePaths": [
    {
      "name": "string",
      "why": "string",
      "timeToFirstDollar": "string",
      "earningPotential": "string"
    },
    {
      "name": "string",
      "why": "string",
      "timeToFirstDollar": "string",
      "earningPotential": "string"
    }
  ],
  "warningFlags": ["string", "string"],
  "oneThingToDoToday": "string — the single most important action they can take today"
}

Be specific, direct, and ruthlessly practical. No generic advice. Every recommendation must be tailored to the exact profile provided. Do not add any text outside the JSON.`;

  let reportData: ReportData;
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const raw =
      message.content[0].type === "text" ? message.content[0].text : "";
    // Strip markdown code fences if Claude wraps the response
    const text = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
    reportData = JSON.parse(text) as ReportData;
  } catch (err) {
    console.error("Claude API error:", err);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("reports")
    .insert({ form_input: parsed.data, report_data: reportData })
    .select("id")
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    return NextResponse.json(
      { error: "Failed to save report" },
      { status: 500 }
    );
  }

  return NextResponse.json({ id: data.id });
}
