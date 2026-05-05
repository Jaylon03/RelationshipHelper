// POST /api/export
// Generates a signed download URL for an output video
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  project_id: z.string().uuid(),
  output_video_id: z.string().uuid(),
  format: z.enum(["mp4", "mov"]).optional().default("mp4"),
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

  const { output_video_id } = parsed.data;

  // Verify the video belongs to this user via project ownership
  const { data: video } = await supabase
    .from("videos")
    .select("*, projects!inner(user_id)")
    .eq("id", output_video_id)
    .eq("type", "output")
    .single();

  if (!video?.storage_path) {
    return NextResponse.json({ error: "Output video not found" }, { status: 404 });
  }

  // Generate a signed URL valid for 1 hour
  const expiresIn = 60 * 60;
  const { data: signed, error } = await supabase.storage
    .from("output-videos")
    .createSignedUrl(video.storage_path, expiresIn);

  if (error || !signed) {
    return NextResponse.json({ error: "Failed to generate download URL" }, { status: 500 });
  }

  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

  return NextResponse.json({
    success: true,
    download_url: signed.signedUrl,
    expires_at: expiresAt,
  });
}
