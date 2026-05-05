// ─────────────────────────────────────────────
// inspo-edit — shared TypeScript types
// ─────────────────────────────────────────────

export type VideoType = "inspo" | "raw" | "output";

export type ProjectStatus =
  | "pending"
  | "analyzing"
  | "processing"
  | "ready"
  | "failed";

// ── Database row shapes ───────────────────────

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  project_id: string;
  type: VideoType;
  storage_path: string | null;
  source_url: string | null;
  duration_secs: number | null;
  resolution: string | null;
  fps: number | null;
  file_size_bytes: number | null;
  created_at: string;
}

export interface StyleProfile {
  id: string;
  project_id: string;
  inspo_video_id: string;
  avg_clip_duration_secs: number | null;
  cut_times: number[] | null;
  color_grade_lut: Record<string, unknown> | null;
  brightness: number | null;
  contrast: number | null;
  saturation: number | null;
  transitions: Transition[] | null;
  caption_style: CaptionStyle | null;
  beat_timestamps: number[] | null;
  audio_fade_in_secs: number | null;
  audio_fade_out_secs: number | null;
  raw_analysis: Record<string, unknown> | null;
  created_at: string;
}

// ── Sub-types ─────────────────────────────────

export interface Transition {
  at_sec: number;
  type: "cut" | "fade" | "wipe" | "zoom" | string;
  duration_ms: number;
}

export interface CaptionStyle {
  font: string;
  size: number;
  color: string;
  position: "top" | "center" | "bottom";
  bold: boolean;
}

// ── StackedPath types ─────────────────────────

export interface IncomeFormInput {
  skills: string[];
  hours: number;
  urgency: "this week" | "this month" | "next 3 months";
  target: "$500" | "$1k" | "$2.5k" | "$5k+";
  restrictions: string[];
  tried?: string;
}

export interface AlternativePath {
  name: string;
  why: string;
  timeToFirstDollar: string;
  earningPotential: string;
}

export interface TopPath {
  name: string;
  why: string;
  timeToFirstDollar: string;
  earningPotential: string;
  firstWeekPlan: string[];
  whoToTarget: string;
  whatToCharge: string;
  pitchScript: string;
}

export interface ReportData {
  headline: string;
  topPath: TopPath;
  alternativePaths: [AlternativePath, AlternativePath];
  warningFlags: string[];
  oneThingToDoToday: string;
}

export interface Report {
  id: string;
  created_at: string;
  form_input: IncomeFormInput;
  report_data: ReportData;
  is_paid: boolean;
  stripe_session_id: string | null;
  email: string | null;
}

// ── Validly types ─────────────────────────────

export interface Scan {
  id: string;
  created_at: string;
  user_id: string;
  idea: string;
  subreddits: string[] | null;
  status: "completed" | "failed";
}

export interface PainPoint {
  id: string;
  created_at: string;
  scan_id: string;
  user_id: string;
  rank: number;
  title: string;
  score: number;
  subreddit: string;
  evidence: string[];
  signal: "validates" | "challenges";
  is_saved: boolean;
}

export interface ScanUsage {
  id: string;
  user_id: string;
  date: string;
  count: number;
}

export interface AiAnalysis {
  targetAudience: string;
  suggestedSolution: string;
  monetizationAngle: string;
}

// ── API request / response shapes ────────────

export interface AnalyzeRequest {
  project_id: string;
  inspo_video_id: string;
}

export interface AnalyzeResponse {
  success: boolean;
  style_profile_id: string;
  style_profile: Partial<StyleProfile>;
}

export interface ProcessRequest {
  project_id: string;
  raw_video_id: string;
  style_profile_id: string;
}

export interface ProcessResponse {
  success: boolean;
  output_video_id: string;
  storage_path: string;
}

export interface ExportRequest {
  project_id: string;
  output_video_id: string;
  format?: "mp4" | "mov";
}

export interface ExportResponse {
  success: boolean;
  download_url: string;
  expires_at: string;
}
