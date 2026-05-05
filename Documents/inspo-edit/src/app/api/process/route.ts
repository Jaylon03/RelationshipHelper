// POST /api/process
// Applies a style profile to raw footage and saves the output video
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { applyStyleProfile } from "@/lib/ffmpeg/process";
import { z } from "zod";
import fs from "fs";
import path from "path";
import os from "os";

const schema = z.object({
  project_id: z.string().uuid(),
  raw_video_id: z.string().uuid(),
  style_profile_id: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const supabase = await createServiceClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { project_id, raw_video_id, style_profile_id } = parsed.data;

  // Fetch raw video and style profile in parallel
  const [{ data: rawVideo }, { data: styleProfile }] = await Promise.all([
    supabase.from("videos").select("*").eq("id", raw_video_id).single(),
    supabase.from("style_profiles").select("*").eq("id", style_profile_id).single(),
  ]);

  if (!rawVideo?.storage_path || !styleProfile) {
    return NextResponse.json({ error: "Missing video or style profile" }, { status: 404 });
  }

  // Download raw footage
  const { data: fileData } = await supabase.storage
    .from("raw-footage")
    .download(rawVideo.storage_path);

  if (!fileData) {
    return NextResponse.json({ error: "Failed to download raw footage" }, { status: 500 });
  }

  const tmpRaw = path.join(os.tmpdir(), `raw-${raw_video_id}.mp4`);
  const tmpOut = path.join(os.tmpdir(), `output-${project_id}-${Date.now()}.mp4`);
  fs.writeFileSync(tmpRaw, Buffer.from(await fileData.arrayBuffer()));

  await supabase.from("projects").update({ status: "processing" }).eq("id", project_id);

  // Apply style
  await applyStyleProfile({
    rawFilePath: tmpRaw,
    outputPath: tmpOut,
    styleProfile,
  });

  fs.unlinkSync(tmpRaw);

  // Upload output to Supabase Storage
  const storagePath = `${user.id}/${project_id}/output-${Date.now()}.mp4`;
  const outputBuffer = fs.readFileSync(tmpOut);
  fs.unlinkSync(tmpOut);

  const { error: uploadErr } = await supabase.storage
    .from("output-videos")
    .upload(storagePath, outputBuffer, { contentType: "video/mp4" });

  if (uploadErr) {
    return NextResponse.json({ error: "Failed to upload output video" }, { status: 500 });
  }

  // Save output video record
  const { data: outputVideo } = await supabase
    .from("videos")
    .insert({ project_id, type: "output", storage_path: storagePath })
    .select()
    .single();

  await supabase.from("projects").update({ status: "ready" }).eq("id", project_id);

  return NextResponse.json({
    success: true,
    output_video_id: outputVideo?.id,
    storage_path: storagePath,
  });
}
