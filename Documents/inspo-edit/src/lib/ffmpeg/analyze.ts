// ─────────────────────────────────────────────
// Analyze an inspo video and extract its style profile
// FFmpeg handles quantitative data (cuts, fps, duration)
// Claude handles qualitative data (color tone, caption style, vibe)
// ─────────────────────────────────────────────
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import os from "os";
import type { StyleProfile, Transition, CaptionStyle } from "@/lib/types";

ffmpeg.setFfmpegPath(ffmpegPath.path);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ── Types ─────────────────────────────────────

export interface VideoMetadata {
  duration: number;
  fps: number;
  resolution: string;
  bitrate: number;
}

export interface ClaudeStyleAnalysis {
  color_tone: string;
  brightness: number;
  contrast: number;
  saturation: number;
  color_grade_lut: Record<string, unknown>;
  caption_style: CaptionStyle;
  transition_feel: string;
  overall_vibe: string;
  pacing: "slow" | "medium" | "fast";
  raw_analysis: Record<string, unknown>;
}

// ── FFmpeg helpers ────────────────────────────

/** Pull basic metadata from a video file */
export async function getVideoMetadata(filePath: string): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, data) => {
      if (err) return reject(err);

      const videoStream = data.streams.find((s) => s.codec_type === "video");
      const duration = data.format.duration ?? 0;
      const bitrate = Number(data.format.bit_rate ?? 0);

      const fpsRaw = videoStream?.r_frame_rate ?? "30/1";
      const [num, den] = fpsRaw.split("/").map(Number);
      const fps = den ? num / den : num;

      const resolution = videoStream
        ? `${videoStream.width}x${videoStream.height}`
        : "unknown";

      resolve({ duration, fps, resolution, bitrate });
    });
  });
}

/**
 * Detect scene cuts using ffmpeg's scene filter.
 * Returns timestamps (in seconds) where cuts occur.
 */
export async function detectCuts(
  filePath: string,
  threshold = 0.3
): Promise<number[]> {
  return new Promise((resolve, reject) => {
    const cuts: number[] = [];

    ffmpeg(filePath)
      .videoFilters(`select='gt(scene,${threshold})',showinfo`)
      .outputOptions(["-f", "null"])
      .output("/dev/null")
      .on("stderr", (line: string) => {
        const match = line.match(/pts_time:([\d.]+)/);
        if (match) cuts.push(parseFloat(match[1]));
      })
      .on("end", () => resolve(cuts))
      .on("error", reject)
      .run();
  });
}

/**
 * Extract N evenly-spaced frames from the video as PNG files.
 * Returns an array of temp file paths.
 */
export async function extractFrames(
  filePath: string,
  duration: number,
  frameCount = 6
): Promise<string[]> {
  const framePaths: string[] = [];
  const interval = duration / (frameCount + 1);

  for (let i = 1; i <= frameCount; i++) {
    const timestamp = interval * i;
    const outPath = path.join(os.tmpdir(), `inspo-frame-${Date.now()}-${i}.png`);

    await new Promise<void>((resolve, reject) => {
      ffmpeg(filePath)
        .seekInput(timestamp)
        .frames(1)
        .output(outPath)
        .on("end", () => resolve())
        .on("error", reject)
        .run();
    });

    framePaths.push(outPath);
  }

  return framePaths;
}

/**
 * Build transitions array from cut timestamps.
 * Short gaps = hard cut, longer gaps = fade.
 */
export function inferTransitions(cutTimes: number[]): Transition[] {
  return cutTimes.map((t, i) => {
    const gap = i < cutTimes.length - 1 ? cutTimes[i + 1] - t : 0;
    return {
      at_sec: t,
      type: gap < 0.5 ? "cut" : "fade",
      duration_ms: gap < 0.5 ? 0 : 300,
    };
  });
}

// ── Claude vision analysis ────────────────────

/**
 * Sends sampled frames to Claude and asks for a qualitative style breakdown.
 * Returns structured style data that complements FFmpeg's quantitative output.
 */
export async function analyzeStyleWithClaude(
  framePaths: string[],
  videoMetadata: VideoMetadata,
  cutCount: number
): Promise<ClaudeStyleAnalysis> {
  // Build image content blocks from each frame
  const imageBlocks: Anthropic.ImageBlockParam[] = framePaths.map((framePath) => {
    const imageData = fs.readFileSync(framePath);
    const base64 = imageData.toString("base64");
    return {
      type: "image",
      source: {
        type: "base64",
        media_type: "image/png",
        data: base64,
      },
    };
  });

  const prompt = `You are analyzing frames from a short-form video (TikTok/Reels/Shorts style) to extract its visual edit style.

Video stats from technical analysis:
- Duration: ${videoMetadata.duration.toFixed(1)}s
- FPS: ${videoMetadata.fps.toFixed(1)}
- Resolution: ${videoMetadata.resolution}
- Detected cuts: ${cutCount}
- Avg clip length: ${cutCount > 0 ? (videoMetadata.duration / cutCount).toFixed(2) : videoMetadata.duration.toFixed(2)}s

Look at these ${framePaths.length} evenly-spaced frames and respond with ONLY a valid JSON object in this exact shape — no markdown, no explanation:

{
  "color_tone": "warm | cool | neutral | desaturated | vibrant",
  "brightness": <float -1.0 to 1.0, 0 = neutral>,
  "contrast": <float 0.5 to 2.0, 1.0 = neutral>,
  "saturation": <float 0.0 to 3.0, 1.0 = neutral>,
  "color_grade_lut": {
    "shadows": "<color description e.g. blue-tinted>",
    "midtones": "<color description>",
    "highlights": "<color description>"
  },
  "caption_style": {
    "font": "<detected or inferred font style e.g. bold sans-serif>",
    "size": <relative size 1-5, 3 = medium>,
    "color": "<hex or color name>",
    "position": "top | center | bottom",
    "bold": <true | false>
  },
  "transition_feel": "<description of how cuts/transitions feel e.g. snappy, smooth, energetic>",
  "overall_vibe": "<2-5 word description of the video's overall aesthetic>",
  "pacing": "slow | medium | fast"
}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          ...imageBlocks,
          { type: "text", text: prompt },
        ],
      },
    ],
  });

  const rawText = response.content[0].type === "text" ? response.content[0].text : "{}";

  let parsed: Partial<ClaudeStyleAnalysis> = {};
  try {
    parsed = JSON.parse(rawText);
  } catch {
    // If Claude returns something we can't parse, fall back to defaults
    console.error("Claude response parse error:", rawText);
  }

  return {
    color_tone: parsed.color_tone ?? "neutral",
    brightness: parsed.brightness ?? 0,
    contrast: parsed.contrast ?? 1,
    saturation: parsed.saturation ?? 1,
    color_grade_lut: parsed.color_grade_lut ?? {},
    caption_style: parsed.caption_style ?? {
      font: "bold sans-serif",
      size: 3,
      color: "#ffffff",
      position: "bottom",
      bold: true,
    },
    transition_feel: parsed.transition_feel ?? "standard",
    overall_vibe: parsed.overall_vibe ?? "unknown",
    pacing: parsed.pacing ?? "medium",
    raw_analysis: { model_response: rawText },
  };
}

// ── Master function ───────────────────────────

/**
 * Runs full analysis on an inspo video.
 * Combines FFmpeg (quantitative) + Claude vision (qualitative)
 * into a complete StyleProfile.
 */
export async function analyzeInspoVideo(
  filePath: string
): Promise<Partial<StyleProfile>> {
  // Run FFmpeg analysis
  const meta = await getVideoMetadata(filePath);
  const cutTimes = await detectCuts(filePath);
  const transitions = inferTransitions(cutTimes);

  // Extract frames for Claude
  const framePaths = await extractFrames(filePath, meta.duration, 6);

  // Run Claude vision analysis
  const claudeAnalysis = await analyzeStyleWithClaude(framePaths, meta, cutTimes.length);

  // Clean up temp frame files
  framePaths.forEach((p) => {
    try { fs.unlinkSync(p); } catch {}
  });

  const avgClipDuration =
    cutTimes.length > 1
      ? cutTimes.reduce((acc, t, i) => {
          if (i === 0) return acc;
          return acc + (t - cutTimes[i - 1]);
        }, 0) / (cutTimes.length - 1)
      : meta.duration;

  return {
    // FFmpeg quantitative
    avg_clip_duration_secs: avgClipDuration,
    cut_times: cutTimes,
    transitions,
    beat_timestamps: [],
    // Claude qualitative
    brightness: claudeAnalysis.brightness,
    contrast: claudeAnalysis.contrast,
    saturation: claudeAnalysis.saturation,
    color_grade_lut: claudeAnalysis.color_grade_lut,
    caption_style: claudeAnalysis.caption_style,
    raw_analysis: {
      vibe: claudeAnalysis.overall_vibe,
      pacing: claudeAnalysis.pacing,
      color_tone: claudeAnalysis.color_tone,
      transition_feel: claudeAnalysis.transition_feel,
      ...claudeAnalysis.raw_analysis,
    },
  };
}
