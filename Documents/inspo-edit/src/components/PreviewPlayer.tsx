"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface PreviewPlayerProps {
  storagePath: string;
  bucket: "inspo-videos" | "raw-footage" | "output-videos";
}

export default function PreviewPlayer({ storagePath, bucket }: PreviewPlayerProps) {
  const [url, setUrl] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchUrl() {
      const { data } = await supabase.storage
        .from(bucket)
        .createSignedUrl(storagePath, 3600);
      if (data) setUrl(data.signedUrl);
    }
    fetchUrl();
  }, [storagePath, bucket]);

  if (!url) {
    return (
      <div className="w-full aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
        <span className="text-gray-400 text-sm">Loading preview...</span>
      </div>
    );
  }

  return (
    <video
      src={url}
      controls
      className="w-full aspect-video rounded-xl bg-black"
    />
  );
}
