import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

interface SavedPainPoint {
  id: string;
  scan_id: string;
  title: string;
  score: number;
  subreddit: string;
  signal: string;
  created_at: string;
  scans: { idea: string } | null;
}

export default async function SavedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: painPoints } = await supabase
    .from("pain_points")
    .select("id, scan_id, title, score, subreddit, signal, created_at, scans(idea)")
    .eq("user_id", user.id)
    .eq("is_saved", true)
    .order("created_at", { ascending: false });

  const items = (painPoints ?? []) as SavedPainPoint[];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 px-8 py-8 overflow-auto">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Saved Results</h1>
            <p className="text-gray-500 text-sm mt-1">
              {items.length} saved pain point{items.length !== 1 ? "s" : ""} across all scans
            </p>
          </div>

          {items.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
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
              </div>
              <p className="text-gray-900 font-semibold mb-2">No saved results yet</p>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Run a scan and bookmark the pain points that matter most to you. They&apos;ll appear here.
              </p>
              <Link
                href="/scan"
                className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition"
              >
                Run your first scan
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((pp) => (
                <div
                  key={pp.id}
                  className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-300 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            pp.score >= 80
                              ? "bg-green-100 text-green-700"
                              : pp.score >= 60
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {pp.score}
                        </span>
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                          r/{pp.subreddit}
                        </span>
                        {pp.signal === "validates" ? (
                          <span className="text-xs font-medium bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                            ✓ Validates
                          </span>
                        ) : (
                          <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
                            ⚠ Challenges
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-gray-900 leading-snug">{pp.title}</p>
                      {pp.scans?.idea && (
                        <p className="text-xs text-gray-400 mt-1.5 truncate">
                          From scan: &quot;{pp.scans.idea}&quot;
                        </p>
                      )}
                    </div>
                    <Link
                      href={`/results/${pp.scan_id}`}
                      className="text-sm text-blue-600 font-medium hover:text-blue-700 whitespace-nowrap transition flex-shrink-0"
                    >
                      View scan →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
