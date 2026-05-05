"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";

const benefits = [
  {
    icon: (
      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Unlimited scans",
    desc: "Run as many scans as you need, every day. No daily caps, no waiting until midnight.",
  },
  {
    icon: (
      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Deeper Reddit analysis",
    desc: "Pro scans search more subreddits and analyze up to 3x more posts per scan.",
  },
  {
    icon: (
      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: "AI pain point analysis",
    desc: "Every pain point comes with a full AI breakdown — target audience, suggested solution, and monetization angle.",
  },
  {
    icon: (
      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
    title: "Unlimited saved results",
    desc: "Save every pain point you find and build a personal library of validated market opportunities.",
  },
  {
    icon: (
      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Full scan history",
    desc: "Access every scan you've ever run. Compare ideas over time and track your research.",
  },
  {
    icon: (
      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: "Priority support",
    desc: "Get direct help when you need it. Pro users go to the front of the queue.",
  },
];

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout", { method: "POST" });
      const data = (await res.json()) as { url?: string };
      if (data.url) window.location.href = data.url;
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 px-8 py-10 overflow-auto">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 transition inline-flex items-center gap-1 mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Upgrade to Pro</h1>
            <p className="text-gray-500 text-sm mt-1">
              Everything you need to validate ideas faster and ship with confidence.
            </p>
          </div>

          {/* Pricing card */}
          <div className="bg-white border-2 border-blue-600 rounded-2xl p-8 mb-6 shadow-sm">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Most popular
                </div>
                <h2 className="text-xl font-bold text-gray-900">Validly Pro</h2>
                <p className="text-gray-500 text-sm mt-0.5">For founders who are serious about validation</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-gray-900">$19</p>
                <p className="text-gray-400 text-sm">per month</p>
              </div>
            </div>

            {/* Benefits list */}
            <div className="space-y-4 mb-8">
              {benefits.map((b) => (
                <div key={b.title} className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    {b.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{b.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-base rounded-xl transition shadow-lg shadow-blue-600/20"
            >
              {loading ? "Redirecting to checkout..." : "Upgrade to Pro — $19/month"}
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">
              Cancel anytime. No contracts, no hidden fees.
            </p>
          </div>

          {/* Free tier comparison */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">What you have now (Free)</h3>
            <div className="space-y-2">
              {[
                "3 scans per day",
                "Basic pain point analysis",
                "Save up to 10 pain points",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
