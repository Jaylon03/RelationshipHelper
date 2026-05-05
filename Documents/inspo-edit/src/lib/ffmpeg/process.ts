// ─────────────────────────────────────────────
// Apply a style profile to raw footage
// ─────────────────────────────────────────────
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import type { StyleProfile } from "@/lib/types";

ffmpeg.setFfmpegPath(ffmpegPath.path);

export interface ProcessOptions {
  rawFilePath: string;
  outputPath: string;
  styleProfile: Partial<StyleProfile>;
}

/**
 * Applies color grading filters derived from the style profile.
 */
function buildColorFilter(profile: Partial<StyleProfile>): string {
  const brightness = profile.brightness ?? 0;
  const contrast = profile.contrast ?? 1;
  const saturation = profile.saturation ?? 1;

  return `eq=brightness=${brightness}:contrast=${contrast}:saturation=${saturation}`;
}

/**
 * Trims raw footage into clips matching the inspo's cut timing,
 * applies color grade, then concatenates into a single output file.
 */
export async function applyStyleProfile({
  rawFilePath,
  outputPath,
  styleProfile,
}: ProcessOptions): Promise<void> {
  const cutTimes = styleProfile.cut_times ?? [];
  const colorFilter = buildColorFilter(styleProfile);

  // If no cuts were detected, just apply color grade to the full clip
  if (cutTimes.length === 0) {
    return new Promise((resolve, reject) => {
      ffmpeg(rawFilePath)
        .videoFilters(colorFilter)
        .audioFilters(buildAudioFilters(styleProfile))
        .output(outputPath)
        .on("end", () => resolve())
        .on("error", reject)
        .run();
    });
  }

  // Build segment list matching inspo cut timing
  const segments: Array<{ start: number; end: number }> = [];
  for (let i = 0; i < cutTimes.length; i++) {
    segments.push({
      start: cutTimes[i],
      end: cutTimes[i + 1] ?? cutTimes[i] + (styleProfile.avg_clip_duration_secs ?? 3),
    });
  }

  // Cut, grade, and concat
  return new Promise((resolve, reject) => {
    const command = ffmpeg();

    segments.forEach(({ start, end }) => {
      command.input(rawFilePath).inputOptions([`-ss ${start}`, `-to ${end}`]);
    });

    const filterInputs = segments
      .map((_, i) => `[${i}:v]${colorFilter}[v${i}];[${i}:a]anull[a${i}]`)
      .join(";");

    const concatInputs = segments.map((_, i) => `[v${i}][a${i}]`).join("");
    const concatFilter = `${filterInputs};${concatInputs}concat=n=${segments.length}:v=1:a=1[vout][aout]`;

    command
      .complexFilter(concatFilter)
      .outputOptions(["-map [vout]", "-map [aout]"])
      .output(outputPath)
      .on("end", () => resolve())
      .on("error", reject)
      .run();
  });
}

function buildAudioFilters(profile: Partial<StyleProfile>): string {
  const fadeIn = profile.audio_fade_in_secs ?? 0;
  const fadeOut = profile.audio_fade_out_secs ?? 0;

  const filters: string[] = [];
  if (fadeIn > 0) filters.push(`afade=t=in:d=${fadeIn}`);
  if (fadeOut > 0) filters.push(`afade=t=out:d=${fadeOut}`);

  return filters.join(",") || "anull";
}
