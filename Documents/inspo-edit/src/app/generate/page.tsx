"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SKILL_OPTIONS = [
  "Writing / Copywriting",
  "Graphic Design",
  "Web Development",
  "Video Editing",
  "Social Media Management",
  "Photography",
  "Tutoring / Teaching",
  "Marketing / Ads",
  "Sales / Business Dev",
  "Data / Analytics",
  "Customer Support",
  "Music / Audio Production",
  "Consulting / Strategy",
  "Translation / Language",
  "Virtual Assistance",
  "SEO / Content",
  "Bookkeeping / Finance",
  "Coaching / Mentoring",
];

const RESTRICTION_OPTIONS = [
  "Cold calls / cold outreach",
  "Client work / freelancing",
  "Content creation",
  "Managing people",
  "Long-term commitments",
  "Technical / coding work",
];

type Urgency = "this week" | "this month" | "next 3 months";
type Target = "$500" | "$1k" | "$2.5k" | "$5k+";

export default function GeneratePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");
  const [hours, setHours] = useState(10);
  const [urgency, setUrgency] = useState<Urgency>("this month");
  const [target, setTarget] = useState<Target>("$1k");
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [tried, setTried] = useState("");

  function toggleSkill(s: string) {
    setSkills((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  function addCustomSkill() {
    const trimmed = customSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setCustomSkill("");
  }

  function toggleRestriction(r: string) {
    setRestrictions((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (skills.length === 0) {
      setError("Add at least one skill before generating your plan.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills, hours, urgency, target, restrictions, tried }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }
      router.push(`/report/${data.id}`);
    } catch {
      setError("Network error — please try again.");
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 border-4 border-[#7c5cfc] border-t-transparent rounded-full animate-spin mx-auto mb-8" />
          <h2 className="text-2xl font-bold text-white mb-3">
            Building your income roadmap...
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Claude is analyzing your profile and identifying your highest-leverage income opportunities. This takes about 15 seconds.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-tight text-gray-900">
            Stacked<span className="text-[#7c5cfc]">Path</span>
          </Link>
          <span className="text-sm text-gray-400">Free · Takes ~2 minutes</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Page header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-[#7c5cfc]/10 text-[#7c5cfc] rounded-full px-4 py-1.5 mb-4 text-sm font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7c5cfc] animate-pulse" />
            AI-powered income strategy
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Tell us about yourself
          </h1>
          <p className="text-gray-500 text-lg">
            Answer 6 questions. Get a personalized roadmap showing exactly what to pursue and how to start.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Skills */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              1. What skills do you have?
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Select all that apply. Be honest — include things you&apos;re decent at, not just expert-level.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {SKILL_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSkill(s)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium border transition-all ${
                    skills.includes(s)
                      ? "bg-[#7c5cfc] text-white border-[#7c5cfc] shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-[#7c5cfc]/40 hover:text-[#7c5cfc]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomSkill();
                  }
                }}
                placeholder="Add a custom skill..."
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7c5cfc]/30 focus:border-[#7c5cfc]"
              />
              <button
                type="button"
                onClick={addCustomSkill}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition"
              >
                Add
              </button>
            </div>
            {skills.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 bg-[#7c5cfc]/10 text-[#7c5cfc] text-xs font-medium px-3 py-1.5 rounded-full"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => toggleSkill(s)}
                      className="hover:text-[#5a3ecc] leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Hours */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              2. How many hours per week can you dedicate?
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Be realistic — this shapes what paths are actually viable for you.
            </p>
            <div className="flex items-center gap-6">
              <input
                type="range"
                min={1}
                max={40}
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="flex-1 accent-[#7c5cfc] h-2 rounded-full cursor-pointer"
              />
              <div className="w-20 text-center">
                <span className="text-3xl font-bold text-gray-900">{hours}</span>
                <span className="text-sm text-gray-400 block">hrs/week</span>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2 px-0.5">
              <span>1 hr</span>
              <span>10 hrs</span>
              <span>20 hrs</span>
              <span>40 hrs</span>
            </div>
          </section>

          {/* Urgency */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              3. How soon do you need income?
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              This affects which paths we prioritize for you.
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              {(["this week", "this month", "next 3 months"] as Urgency[]).map(
                (u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUrgency(u)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      urgency === u
                        ? "border-[#7c5cfc] bg-[#7c5cfc]/5 ring-2 ring-[#7c5cfc]/20"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className={`text-sm font-semibold mb-0.5 capitalize ${urgency === u ? "text-[#7c5cfc]" : "text-gray-900"}`}>
                      {u}
                    </div>
                    <div className="text-xs text-gray-400">
                      {u === "this week" && "Fast money now"}
                      {u === "this month" && "Some runway"}
                      {u === "next 3 months" && "Time to build"}
                    </div>
                  </button>
                )
              )}
            </div>
          </section>

          {/* Target */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              4. What&apos;s your target monthly income?
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              What would feel like a real win in the next 90 days?
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(["$500", "$1k", "$2.5k", "$5k+"] as Target[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTarget(t)}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    target === t
                      ? "border-[#7c5cfc] bg-[#7c5cfc]/5 ring-2 ring-[#7c5cfc]/20"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className={`text-lg font-bold ${target === t ? "text-[#7c5cfc]" : "text-gray-900"}`}>
                    {t}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">per month</div>
                </button>
              ))}
            </div>
          </section>

          {/* Restrictions */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              5. What are you unwilling to do?
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Optional, but important. We won&apos;t recommend paths that require these.
            </p>
            <div className="flex flex-wrap gap-2">
              {RESTRICTION_OPTIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => toggleRestriction(r)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium border transition-all ${
                    restrictions.includes(r)
                      ? "bg-red-50 text-red-600 border-red-200"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {restrictions.includes(r) ? "✕ " : ""}
                  {r}
                </button>
              ))}
            </div>
          </section>

          {/* Tried before */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              6. What have you tried before?
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Optional. Knowing what hasn&apos;t worked helps us avoid recommending the same thing.
            </p>
            <textarea
              value={tried}
              onChange={(e) => setTried(e.target.value)}
              placeholder="e.g. I tried dropshipping for 3 months, made a few sales but couldn't scale it. Also tried Fiverr for logo design."
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#7c5cfc]/30 focus:border-[#7c5cfc] leading-relaxed"
            />
          </section>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-4 bg-[#7c5cfc] hover:bg-[#6a4de0] text-white font-bold text-base rounded-xl transition shadow-lg shadow-[#7c5cfc]/25"
          >
            Generate my income plan →
          </button>
          <p className="text-center text-xs text-gray-400 -mt-4">
            Free to generate · No account required
          </p>
        </form>
      </div>
    </div>
  );
}
