"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import type { Scan, PainPoint, AiAnalysis } from "@/lib/types";

interface Props {
  scan: Scan;
  painPoints: PainPoint[];
}

function ScoreBadge({ score }: { score: number }) {
  const classes =
    score >= 80
      ? "bg-green-100 text-green-700"
      : score >= 60
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tabular-nums ${classes}`}
    >
      {score}
    </span>
  );
}

function SignalBadge({ signal }: { signal: string }) {
  if (signal === "validates") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
        ✓ Validates
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
      ⚠ Challenges
    </span>
  );
}

function PainPointCard({
  pp,
  idea,
}: {
  pp: PainPoint;
  idea: string;
}) {
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [saved, setSaved] = useState(pp.is_saved);
  const [saveLoading, setSaveLoading] = useState(false);

  async function runAnalysis() {
    if (analysis) {
      setAnalysisOpen(!analysisOpen);
      return;
    }
    setAnalysisLoading(true);
    setAnalysisOpen(true);
    try {
      const res = await fetch("/api/ai-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ painPointTitle: pp.title, idea }),
      });
      if (res.ok) {
        setAnalysis((await res.json()) as AiAnalysis);
      }
    } finally {
      setAnalysisLoading(false);
    }
  }

  async function toggleSave() {
    setSaveLoading(true);
    try {
      const res = await fetch("/api/save-pain-point", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ painPointId: pp.id, isSaved: !saved }),
      });
      if (res.ok) setSaved(!saved);
    } finally {
      setSaveLoading(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 transition hover:border-gray-300">
      {/* Header row */}
      <div className="flex items-start gap-3 mb-4">
        <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
          {pp.rank}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <ScoreBadge score={pp.score} />
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              r/{pp.subreddit}
            </span>
            <SignalBadge signal={pp.signal} />
          </div>
          <h3 className="font-semibold text-gray-900 leading-snug">{pp.title}</h3>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center flex-wrap gap-2">
        <button
          onClick={() => setEvidenceOpen(!evidenceOpen)}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
        >
          <svg
            className={`w-3.5 h-3.5 transition-transform ${evidenceOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
          Evidence ({pp.evidence.length})
        </button>

        <button
          onClick={runAnalysis}
          disabled={analysisLoading}
          className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition disabled:opacity-50"
        >
          {analysisLoading ? (
            <span className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          )}
          {analysisLoading ? "Analyzing..." : analysis ? "AI Analysis" : "AI Analysis"}
        </button>

        <button
          onClick={toggleSave}
          disabled={saveLoading}
          className={`ml-auto flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-50 ${
            saved
              ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
              : "text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100"
          }`}
        >
          <svg
            className="w-3.5 h-3.5"
            fill={saved ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
          {saved ? "Saved" : "Save"}
        </button>
      </div>

      {/* Evidence accordion */}
      {evidenceOpen && pp.evidence.length > 0 && (
        <div className="mt-4 space-y-2">
          {pp.evidence.map((quote, i) => (
            <blockquote
              key={i}
              className="pl-4 border-l-2 border-gray-300 text-sm text-gray-600 italic bg-gray-50 py-2.5 pr-4 rounded-r-lg leading-relaxed"
            >
              &ldquo;{quote}&rdquo;
            </blockquote>
          ))}
        </div>
      )}

      {/* AI Analysis panel */}
      {analysisOpen && (
        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">
            AI Analysis
          </p>
          {analysisLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              Analyzing this pain point...
            </div>
          ) : analysis ? (
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">Target Audience</p>
                <p className="text-sm text-gray-700 leading-relaxed">{analysis.targetAudience}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">Suggested Solution</p>
                <p className="text-sm text-gray-700 leading-relaxed">{analysis.suggestedSolution}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">Monetization Angle</p>
                <p className="text-sm text-gray-700 leading-relaxed">{analysis.monetizationAngle}</p>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default function ResultsView({ scan, painPoints }: Props) {
  const formattedDate = new Date(scan.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 px-8 py-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          {/* Page header */}
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition mb-3"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 leading-snug">{scan.idea}</h1>
            <p className="text-gray-500 text-sm mt-1">
              {painPoints.length} pain point{painPoints.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 items-start">
            {/* Pain points list */}
            <div className="lg:col-span-2 space-y-4">
              {painPoints.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                  <p className="text-gray-500 mb-4">
                    No pain points were found for this idea.
                  </p>
                  <Link
                    href="/scan"
                    className="text-sm text-blue-600 font-medium hover:text-blue-700 transition"
                  >
                    Try a different idea →
                  </Link>
                </div>
              ) : (
                painPoints.map((pp) => (
                  <PainPointCard key={pp.id} pp={pp} idea={scan.idea} />
                ))
              )}
            </div>

            {/* Scan details sidebar card */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-6">
                <h2 className="font-semibold text-gray-900 mb-5">Scan Details</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                      Date Completed
                    </p>
                    <p className="text-sm text-gray-700">{formattedDate}</p>
                  </div>

                  {scan.subreddits && scan.subreddits.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                        Subreddits Scanned
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {scan.subreddits.map((sub) => (
                          <span
                            key={sub}
                            className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg"
                          >
                            r/{sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                      Results
                    </p>
                    <p className="text-sm text-gray-700">
                      {painPoints.length} pain point{painPoints.length !== 1 ? "s" : ""} analyzed
                    </p>
                  </div>

                  <div className="pt-2 space-y-2">
                    <Link
                      href="/scan"
                      className="block w-full text-center py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition"
                    >
                      New Scan
                    </Link>
                    <Link
                      href="/saved"
                      className="block w-full text-center py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-xl transition"
                    >
                      View Saved
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
