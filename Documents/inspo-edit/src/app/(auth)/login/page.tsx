"use client";
import { useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type Tab = "signin" | "signup";

function AuthForm() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab) ?? "signin";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("already registered") || msg.includes("user already exists") || msg.includes("email already")) {
        setError("An account with this email already exists. Please sign in instead.");
      } else {
        setError(error.message);
      }
      setLoading(false);
      return;
    }
    // Supabase returns an empty identities array when the email is already taken
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setError("An account with this email already exists. Please sign in instead.");
      setLoading(false);
      return;
    }
    router.push("/dashboard");
  }

  function switchTab(t: Tab) {
    setTab(t);
    setError(null);
    setEmail("");
    setPassword("");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="font-bold text-2xl tracking-tight text-gray-900">
            Valid<span className="text-blue-600">ly</span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">
            {tab === "signin" ? "Sign in to your account" : "Create your free account"}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => switchTab("signin")}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                tab === "signin"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => switchTab("signup")}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                tab === "signup"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="p-6">
            <form onSubmit={tab === "signin" ? handleSignIn : handleSignUp} className="flex flex-col gap-4">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
              />
              <input
                type="password"
                placeholder={tab === "signup" ? "Password (min 8 characters)" : "Password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={tab === "signup" ? 8 : undefined}
                required
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
              />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 transition disabled:opacity-50 text-sm"
              >
                {loading
                  ? tab === "signin" ? "Signing in..." : "Creating account..."
                  : tab === "signin" ? "Sign In" : "Create Account"}
              </button>
            </form>

            {tab === "signup" && (
              <p className="mt-4 text-xs text-gray-400 text-center leading-relaxed">
                By signing up you agree to our{" "}
                <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>{" "}
                and{" "}
                <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
              </p>
            )}
          </div>
        </div>

        <p className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition">
            ← Back to Validly
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50" />}>
      <AuthForm />
    </Suspense>
  );
}
