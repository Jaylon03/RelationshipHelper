"use client";
import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface VideoUploaderProps {
  bucket: "inspo-videos" | "raw-footage";
  projectId: string;
  label: string;
  onUploaded: (videoId: string, storagePath: string) => void;
}

export default function VideoUploader({
  bucket,
  projectId,
  label,
  onUploaded,
}: VideoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const storagePath = `${user.id}/${projectId}/${Date.now()}-${file.name}`;

      const { error: uploadErr } = await supabase.storage
        .from(bucket)
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadErr) throw uploadErr;

      // Save video record to DB
      const videoType = bucket === "inspo-videos" ? "inspo" : "raw";
      const { data: video, error: dbErr } = await supabase
        .from("videos")
        .insert({
          project_id: projectId,
          type: videoType,
          storage_path: storagePath,
          file_size_bytes: file.size,
        })
        .select()
        .single();

      if (dbErr || !video) throw dbErr ?? new Error("Failed to save video record");

      setProgress(100);
      onUploaded(video.id, storagePath);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-3">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="px-4 py-2 bg-[#7c5cfc] text-white text-sm rounded-lg hover:bg-[#5a3ecc] transition disabled:opacity-50"
      >
        {uploading ? `Uploading... ${progress}%` : "Choose file"}
      </button>
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
