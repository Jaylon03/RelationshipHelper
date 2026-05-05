import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const today = new Date().toISOString().split("T")[0];

  const [usageResult, scansResult, savedResult] = await Promise.all([
    supabase
      .from("scan_usage")
      .select("count")
      .eq("user_id", user.id)
      .eq("date", today)
      .single(),
    supabase
      .from("scans")
      .select("id, idea, created_at, status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("pain_points")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_saved", true),
  ]);

  const scansToday = (usageResult.data as { count: number } | null)?.count ?? 0;
  const recentScans = scansResult.data ?? [];
  const savedCount = savedResult.count ?? 0;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 px-8 py-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">
              Welcome back,{" "}
              <span className="text-gray-700 font-medium">{user.email}</span>
            </p>
          </div>

          {/* Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {/* New Scan — primary highlighted */}
            <Link
              href="/scan"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl p-6 transition group col-span-1"
            >
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="font-bold text-lg mb-1">New Scan</p>
              <p className="text-blue-200 text-sm leading-snug">Validate an idea with Reddit data</p>
            </Link>

            {/* Scan History */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-bold text-2xl text-gray-900 mb-1">{recentScans.length}</p>
              <p className="text-gray-500 text-sm">
                Scan{recentScans.length !== 1 ? "s" : ""} completed
              </p>
            </div>

            {/* Saved Results */}
            <Link
              href="/saved"
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-200 hover:bg-blue-50/30 transition group"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <p className="font-bold text-2xl text-gray-900 mb-1">{savedCount}</p>
              <p className="text-gray-500 text-sm">Saved pain points</p>
            </Link>

            {/* Daily Scans */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="font-bold text-2xl text-gray-900 mb-1">
                {scansToday}{" "}
                <span className="text-lg text-gray-400 font-medium">/ 3</span>
              </p>
              <p className="text-gray-500 text-sm">Daily scans used</p>
              {scansToday >= 3 && (
                <p className="text-amber-600 text-xs mt-2 font-medium">
                  Limit reached · Resets tomorrow
                </p>
              )}
            </div>
          </div>

          {/* Recent Scans or Getting Started */}
          {recentScans.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-gray-900">Recent Scans</h2>
                <Link
                  href="/scan"
                  className="text-sm text-blue-600 font-medium hover:text-blue-700 transition"
                >
                  + New Scan
                </Link>
              </div>
              <div className="space-y-1">
                {recentScans.map(
                  (scan: { id: string; idea: string; created_at: string }) => (
                    <Link
                      key={scan.id}
                      href={`/results/${scan.id}`}
                      className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-gray-50 transition group"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition truncate">
                          {scan.idea}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(scan.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <svg
                        className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition flex-shrink-0 ml-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="font-semibold text-gray-900 mb-6">Getting Started</h2>
              <div className="space-y-5">
                {[
                  {
                    step: "1",
                    title: "Run your first scan",
                    desc: "Enter a startup idea and we'll scan Reddit communities for real pain points and market evidence.",
                    href: "/scan",
                    cta: "Start now →",
                  },
                  {
                    step: "2",
                    title: "Review pain points",
                    desc: "See ranked results with real Reddit evidence, relevance scores, and AI analysis for each finding.",
                    href: null,
                    cta: null,
                  },
                  {
                    step: "3",
                    title: "Save the best ones",
                    desc: "Bookmark the most relevant pain points to your saved list for quick reference and sharing.",
                    href: null,
                    cta: null,
                  },
                ].map((s) => (
                  <div key={s.step} className="flex items-start gap-4">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {s.step}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{s.desc}</p>
                      {s.href && s.cta && (
                        <Link
                          href={s.href}
                          className="text-xs text-blue-600 font-medium mt-1.5 inline-block hover:text-blue-700 transition"
                        >
                          {s.cta}
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
