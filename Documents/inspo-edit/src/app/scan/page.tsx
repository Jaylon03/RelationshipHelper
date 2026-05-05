"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

const SCAN_STEPS = [
  "Generating Reddit search queries...",
  "Scanning subreddits for relevant posts...",
  "Analyzing pain points from Reddit data...",
];

export default function ScanPage() {
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState("");
  const [limitReached, setLimitReached] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!idea.trim()) return;

    setError("");
    setLoading(true);
    setStepIndex(0);

    try {
      // Step 1: Generate search intents with Claude
      const intentsRes = await fetch("/api/generate-intents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: idea.trim() }),
      });

      if (intentsRes.status === 429) {
        setLimitReached(true);
        setLoading(false);
        return;
      }

      if (!intentsRes.ok) {
        const data = await intentsRes.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Failed to generate search queries");
      }

      const { searchQueries, subreddits } = (await intentsRes.json()) as {
        searchQueries: string[];
        subreddits: string[];
      };

      setStepIndex(1);

      // Step 2: Scan Reddit
      const scanRes = await fetch("/api/run-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: idea.trim(), searchQueries, subreddits }),
      });

      if (!scanRes.ok) {
        const data = await scanRes.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Failed to scan Reddit");
      }

      const { posts } = (await scanRes.json()) as { posts: unknown[] };

      setStepIndex(2);

      // Step 3: Analyze with Claude and save to DB
      const analysisRes = await fetch("/api/analyze-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: idea.trim(), posts, subreddits }),
      });

      if (!analysisRes.ok) {
        const data = await analysisRes.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Failed to analyze results");
      }

      const { scanId } = (await analysisRes.json()) as { scanId: string };

      router.push(`/results/${scanId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-sm">
            <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-8" />
            <h2 className="text-xl font-bold text-gray-900 mb-3">{SCAN_STEPS[stepIndex]}</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              This takes about 15–30 seconds. We&apos;re scanning Reddit for real market evidence.
            </p>
            <div className="flex items-center justify-center gap-2 mt-8">
              {SCAN_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i < stepIndex
                      ? "w-8 bg-blue-600"
                      : i === stepIndex
                      ? "w-8 bg-blue-400 animate-pulse"
                      : "w-4 bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <div className="mt-6 space-y-1">
              {SCAN_STEPS.map((step, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 text-xs transition-colors ${
                    i < stepIndex
                      ? "text-green-600"
                      : i === stepIndex
                      ? "text-blue-600 font-medium"
                      : "text-gray-300"
                  }`}
                >
                  <span>
                    {i < stepIndex ? "✓" : i === stepIndex ? "→" : "○"}
                  </span>
                  {step}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (limitReached) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-sm">
            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Daily scan limit reached</h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Free accounts can run 3 scans per day. Your limit resets at midnight.
            </p>
            <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition text-sm mb-3">
              Upgrade for unlimited scans
            </button>
            <button
              onClick={() => setLimitReached(false)}
              className="w-full py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition text-sm"
            >
              Go back
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 bg-blue-600/10 text-blue-600 rounded-full px-4 py-1.5 mb-4 text-sm font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              Reddit-powered validation
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Validate your startup idea
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed">
              Describe your idea and we&apos;ll scan Reddit communities to find real pain points and market evidence.
            </p>
          </div>

          {/* Form */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <form onSubmit={handleSubmit}>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Your startup idea
              </label>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Describe your startup idea in one sentence..."
                rows={4}
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 leading-relaxed transition"
                required
              />
              <p className="text-xs text-gray-400 mt-2 mb-6">
                Example: &quot;A tool that helps indie developers find beta testers for their apps before launch&quot;
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!idea.trim()}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base rounded-xl transition shadow-lg shadow-blue-600/20"
              >
                Find My Market →
              </button>
              <p className="text-center text-xs text-gray-400 mt-3">
                Scans ~8 subreddits · Analyzes 100+ Reddit posts · Takes ~30 seconds
              </p>
            </form>
          </div>

          {/* Tips */}
          <div className="mt-6 grid sm:grid-cols-3 gap-3">
            {[
              { icon: "✓", text: "Be specific about the problem you solve" },
              { icon: "✓", text: "Mention your target customer if you know it" },
              { icon: "✓", text: "One idea per scan for best results" },
            ].map((tip) => (
              <div key={tip.text} className="flex items-start gap-2 text-xs text-gray-500">
                <span className="text-blue-600 font-bold flex-shrink-0">{tip.icon}</span>
                {tip.text}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
