"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Report } from "@/lib/types";

function firstSentence(text: string): string {
  const idx = text.search(/[.!?]/);
  return idx !== -1 ? text.slice(0, idx + 1).trim() : text;
}

function twoSentences(text: string): string {
  let count = 0;
  for (let i = 0; i < text.length; i++) {
    if (/[.!?]/.test(text[i])) {
      count++;
      if (count === 2) return text.slice(0, i + 1).trim();
    }
  }
  return text;
}

function isLongerThanTwoSentences(text: string): boolean {
  let count = 0;
  for (const ch of text) {
    if (/[.!?]/.test(ch)) count++;
    if (count > 2) return true;
  }
  return false;
}

interface Props {
  report: Report;
  isPaid: boolean;
  paymentPending: boolean;
}

export default function ReportView({ report, isPaid, paymentPending }: Props) {
  const { report_data: r, created_at } = report;
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [whyExpanded, setWhyExpanded] = useState(false);

  // If Stripe just redirected back with ?paid=true but the webhook hasn't fired yet,
  // auto-refresh every 3 s until the DB confirms is_paid.
  useEffect(() => {
    if (!paymentPending) return;
    const timer = setTimeout(() => window.location.reload(), 3000);
    return () => clearTimeout(timer);
  }, [paymentPending]);

  async function handleCheckout() {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: report.id }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setCheckoutLoading(false);
    }
  }

  function copyPitchScript() {
    navigator.clipboard.writeText(r.topPath.pitchScript).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function downloadPDF() {
    window.print();
  }

  const formattedDate = new Date(created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      {/* ── Print styles ── */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: #111 !important; }
          .print-section { background: white !important; border: 1px solid #e5e7eb !important; color: #111 !important; }
          .print-white { color: #111 !important; }
          .print-muted { color: #6b7280 !important; }
        }
      `}</style>

      <div className="min-h-screen bg-[#08080f] text-white">
        {/* ── Nav ── */}
        <nav className="no-print sticky top-0 z-50 bg-[#08080f]/95 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="font-bold text-lg tracking-tight">
              Stacked<span className="text-[#7c5cfc]">Path</span>
            </Link>
            <div className="flex items-center gap-3">
              {isPaid ? (
                <>
                  <button
                    onClick={copyPitchScript}
                    className="text-sm px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg font-medium transition"
                  >
                    {copied ? "Copied!" : "Copy pitch script"}
                  </button>
                  <button
                    onClick={downloadPDF}
                    className="text-sm px-4 py-2 bg-[#7c5cfc] hover:bg-[#6a4de0] text-white rounded-lg font-medium transition"
                  >
                    Download PDF
                  </button>
                </>
              ) : (
                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="text-sm px-4 py-2.5 bg-[#7c5cfc] hover:bg-[#6a4de0] text-white rounded-lg font-medium transition disabled:opacity-60"
                >
                  {checkoutLoading ? "Loading..." : "Download PDF — $9"}
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* ── Payment pending banner ── */}
        {paymentPending && (
          <div className="no-print bg-amber-500/10 border-b border-amber-500/20 px-6 py-3 text-center">
            <p className="text-amber-400 text-sm font-medium">
              Confirming your payment...
              <span className="ml-2 inline-block w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin align-middle" />
            </p>
          </div>
        )}

        {/* ── Headline hero ── */}
        <header className="bg-gradient-to-br from-[#1a0a40] via-[#0f0728] to-[#08080f] border-b border-white/10 px-6 py-14">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-5 print-muted">
              <span className="text-xs font-semibold text-[#a688fc] uppercase tracking-widest">
                Your Income Roadmap
              </span>
              <span className="text-white/20">·</span>
              <span className="text-xs text-white/40">{formattedDate}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-snug max-w-3xl print-white">
              {r.headline}
            </h1>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-12 space-y-16">
          {/* ── Top Path ── */}
          <section className="print-section bg-[#111118] border border-white/10 rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#7c5cfc]/20 to-transparent border-b border-white/10 px-6 py-4 flex items-center gap-3">
              <div className="w-2 h-6 bg-[#7c5cfc] rounded-full" />
              <div>
                <p className="text-xs font-semibold text-[#a688fc] uppercase tracking-widest">
                  Your #1 Income Path
                </p>
                <h2 className="text-xl font-bold text-white print-white">{r.topPath.name}</h2>
              </div>
            </div>

            <div className="p-6 space-y-12">
              {/* Why */}
              <div>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
                  Why this fits you
                </p>
                <p className="text-gray-300 leading-relaxed print-muted">
                  {whyExpanded ? r.topPath.why : twoSentences(r.topPath.why)}
                </p>
                {isLongerThanTwoSentences(r.topPath.why) && (
                  <button
                    onClick={() => setWhyExpanded(!whyExpanded)}
                    className="mt-1 text-xs text-[#a688fc] hover:text-white transition"
                  >
                    {whyExpanded ? "Read less" : "Read more"}
                  </button>
                )}
              </div>

              {/* Key metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-white font-bold text-2xl print-white">{firstSentence(r.topPath.timeToFirstDollar)}</p>
                  <p className="text-xs text-white/40 mt-1">Time to first dollar</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-white font-bold text-2xl print-white">{firstSentence(r.topPath.earningPotential)}</p>
                  <p className="text-xs text-white/40 mt-1">Earning potential</p>
                </div>
              </div>

              {/* 7-day plan */}
              <div>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">
                  Your 7-Day Action Plan
                </p>
                <ol className="space-y-3">
                  {r.topPath.firstWeekPlan.map((step, i) => (
                    <li key={i} className="flex gap-4">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#7c5cfc]/20 text-[#a688fc] text-xs font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-gray-300 text-sm leading-relaxed pt-1 print-muted">
                        {firstSentence(step)}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Who to target */}
              <div>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
                  Who to target first
                </p>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-300 text-sm leading-relaxed print-muted">
                    {r.topPath.whoToTarget}
                  </p>
                </div>
              </div>

              {/* What to charge */}
              <div>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
                  What to charge
                </p>
                <div className="bg-[#7c5cfc]/10 border border-[#7c5cfc]/30 rounded-xl p-4">
                  <p className="text-gray-200 text-sm leading-relaxed print-muted">
                    {r.topPath.whatToCharge}
                  </p>
                </div>
              </div>

              {/* Pitch script */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                    Your pitch script
                  </p>
                  {isPaid ? (
                    <button
                      onClick={copyPitchScript}
                      className="no-print text-xs px-3 py-1.5 bg-[#7c5cfc]/20 hover:bg-[#7c5cfc]/30 text-[#a688fc] rounded-lg font-medium transition"
                    >
                      {copied ? "Copied!" : "Copy to clipboard"}
                    </button>
                  ) : (
                    <button
                      onClick={handleCheckout}
                      disabled={checkoutLoading}
                      className="no-print text-xs px-3 py-1.5 bg-[#7c5cfc] hover:bg-[#6a4de0] text-white rounded-lg font-medium transition disabled:opacity-60"
                    >
                      {checkoutLoading ? "..." : "Unlock for $9"}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-gray-300 text-sm leading-relaxed italic print-muted">
                      &ldquo;{r.topPath.pitchScript}&rdquo;
                    </p>
                  </div>
                  {!isPaid && (
                    <div className="no-print absolute inset-0 backdrop-blur-md bg-[#08080f]/60 rounded-xl flex flex-col items-center justify-center gap-3">
                      <p className="text-white text-sm font-semibold">
                        Unlock your pitch script
                      </p>
                      <p className="text-white/50 text-xs text-center max-w-xs">
                        Copy it and send it today. One-time $9.
                      </p>
                      <button
                        onClick={handleCheckout}
                        disabled={checkoutLoading}
                        className="px-5 py-2.5 bg-[#7c5cfc] hover:bg-[#6a4de0] text-white text-sm font-semibold rounded-lg transition disabled:opacity-60"
                      >
                        {checkoutLoading ? "Loading..." : "Unlock + Download PDF — $9"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ── Alternative Paths ── */}
          <section>
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">
              Alternative Paths to Consider
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {r.alternativePaths.map((path, i) => (
                <div
                  key={i}
                  className="print-section bg-[#111118] border border-white/10 rounded-2xl p-5"
                >
                  <h3 className="text-white font-bold mb-3 print-white">{path.name}</h3>
                  <div className="flex gap-3">
                    <div className="flex-1 bg-white/5 rounded-lg p-3 text-center">
                      <p className="text-white text-sm font-semibold print-white">
                        {firstSentence(path.timeToFirstDollar)}
                      </p>
                      <p className="text-xs text-white/40 mt-0.5">First dollar</p>
                    </div>
                    <div className="flex-1 bg-white/5 rounded-lg p-3 text-center">
                      <p className="text-white text-sm font-semibold print-white">
                        {firstSentence(path.earningPotential)}
                      </p>
                      <p className="text-xs text-white/40 mt-0.5">Potential</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Warning flags ── */}
          {r.warningFlags.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">
                Watch Out For
              </h2>
              <div className="space-y-3">
                {r.warningFlags.map((flag, i) => (
                  <div
                    key={i}
                    className="print-section flex gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4"
                  >
                    <span className="text-amber-400 flex-shrink-0 mt-0.5">⚠</span>
                    <p className="text-amber-200 text-sm leading-relaxed print-muted">
                      {flag}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── One thing to do today ── */}
          <section className="print-section bg-gradient-to-r from-[#7c5cfc]/20 to-[#5a3ecc]/10 border border-[#7c5cfc]/30 rounded-2xl p-6 sm:p-8">
            <p className="text-xs font-semibold text-[#a688fc] uppercase tracking-widest mb-3">
              Do this today
            </p>
            <p className="text-white text-lg sm:text-xl font-semibold leading-snug print-white">
              {r.oneThingToDoToday}
            </p>
          </section>

          {/* ── Paywall CTA (bottom) ── */}
          {!isPaid && (
            <section className="no-print bg-[#111118] border border-white/10 rounded-2xl p-6 sm:p-8 text-center">
              <h3 className="text-white font-bold text-xl mb-2">
                Want to keep this forever?
              </h3>
              <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto leading-relaxed">
                Download your full roadmap as a polished PDF and get one-click access to copy your pitch script — ready to send today.
              </p>
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="px-8 py-3.5 bg-[#7c5cfc] hover:bg-[#6a4de0] text-white font-bold rounded-xl transition shadow-lg shadow-[#7c5cfc]/25 disabled:opacity-60"
              >
                {checkoutLoading ? "Loading..." : "Download PDF + Unlock pitch script — $9"}
              </button>
              <p className="text-gray-500 text-xs mt-3">One-time payment · No subscription</p>
            </section>
          )}

          {/* ── Share + new plan ── */}
          <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
              }}
              className="text-sm text-gray-400 hover:text-white transition"
            >
              Copy shareable link
            </button>
            <Link
              href="/generate"
              className="text-sm text-[#a688fc] hover:text-white transition font-medium"
            >
              Generate a new plan →
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}
