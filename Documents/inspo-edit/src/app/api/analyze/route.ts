// POST /api/analyze
// Downloads the inspo video from Supabase Storage, runs analysis, saves style profile
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { analyzeInspoVideo } from "@/lib/ffmpeg/analyze";
import { z } from "zod";
import fs from "fs";
import path from "path";
import os from "os";

const schema = z.object({
  project_id: z.string().uuid(),
  inspo_video_id: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const supabase = await createServiceClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { project_id, inspo_video_id } = parsed.data;

  // Fetch video record
  const { data: video, error: videoErr } = await supabase
    .from("videos")
    .select("*")
    .eq("id", inspo_video_id)
    .single();

  if (videoErr || !video?.storage_path) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  // Download from Supabase Storage to a temp file
  const { data: fileData, error: dlErr } = await supabase.storage
    .from("inspo-videos")
    .download(video.storage_path);

  if (dlErr || !fileData) {
    return NextResponse.json({ error: "Failed to download video" }, { status: 500 });
  }

  const tmpPath = path.join(os.tmpdir(), `inspo-${inspo_video_id}.mp4`);
  const buffer = Buffer.from(await fileData.arrayBuffer());
  fs.writeFileSync(tmpPath, buffer);

  // Update project status
  await supabase.from("projects").update({ status: "analyzing" }).eq("id", project_id);

  // Run analysis
  const analysisResult = await analyzeInspoVideo(tmpPath);
  fs.unlinkSync(tmpPath);

  // Save style profile
  const { data: profile, error: insertErr } = await supabase
    .from("style_profiles")
    .insert({
      project_id,
      inspo_video_id,
      ...analysisResult,
    })
    .select()
    .single();

  if (insertErr) {
    return NextResponse.json({ error: "Failed to save style profile" }, { status: 500 });
  }

  await supabase.from("projects").update({ status: "pending" }).eq("id", project_id);

  return NextResponse.json({
    success: true,
    style_profile_id: profile.id,
    style_profile: profile,
  });
}
