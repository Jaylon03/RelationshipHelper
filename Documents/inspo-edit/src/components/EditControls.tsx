"use client";

interface EditControlsProps {
  projectId: string;
  rawVideoId: string | null;
  styleProfileId: string | null;
  outputVideoId: string | null;
  onProcessed: (outputVideoId: string) => void;
  onExport: (downloadUrl: string) => void;
}

export default function EditControls({
  projectId,
  rawVideoId,
  styleProfileId,
  outputVideoId,
  onProcessed,
  onExport,
}: EditControlsProps) {
  async function handleProcess() {
    if (!rawVideoId || !styleProfileId) return;

    const res = await fetch("/api/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: projectId, raw_video_id: rawVideoId, style_profile_id: styleProfileId }),
    });

    const data = await res.json();
    if (data.success) onProcessed(data.output_video_id);
  }

  async function handleExport() {
    if (!outputVideoId) return;

    const res = await fetch("/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: projectId, output_video_id: outputVideoId }),
    });

    const data = await res.json();
    if (data.success) onExport(data.download_url);
  }

  return (
    <div className="flex gap-3 mt-4">
      <button
        onClick={handleProcess}
        disabled={!rawVideoId || !styleProfileId}
        className="px-5 py-2.5 bg-[#7c5cfc] text-white rounded-lg font-semibold text-sm hover:bg-[#5a3ecc] transition disabled:opacity-40"
      >
        Generate edit
      </button>
      {outputVideoId && (
        <button
          onClick={handleExport}
          className="px-5 py-2.5 border border-[#7c5cfc] text-[#7c5cfc] rounded-lg font-semibold text-sm hover:bg-[#ede9ff] transition"
        >
          Export / Download
        </button>
      )}
    </div>
  );
}
