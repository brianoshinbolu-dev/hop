"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"email" | "login" | "signup">("email");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function checkEmail(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: rpcError } = await supabase.rpc("check_email_exists", {
        email_to_check: email,
      });

      if (rpcError) {
        console.error("check_email_exists rpc error:", rpcError);
        setError("Something went wrong. Please try again.");
        return;
      }

      if (data) {
        setStep("login");
      } else {
        setStep("signup");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);
    if (err) {
      if (err.message.includes("already registered")) {
        setError("An account with this email already exists. Please sign in instead.");
      } else {
        setError(err.message);
      }
    } else {
      router.push("/onboarding");
      router.refresh();
    }
  }

  function goBack() {
    setStep("email");
    setError("");
    setPassword("");
    setConfirmPassword("");
  }

  if (step === "email") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">HOP</h1>
          <p className="mt-1 text-sm text-gray-500">Hauler Operations Platform</p>
          <form onSubmit={checkEmail} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Checking..." : "Continue"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (step === "login") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-500">{email}</p>
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
            <button
              type="button"
              onClick={goBack}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              ← Use a different email
            </button>
          </form>
          <p className="mt-4 text-center text-xs text-gray-400">
            Forgot password?{" "}
            <button
              type="button"
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.resetPasswordForEmail(email);
                goBack();
              }}
              className="text-blue-600 hover:underline"
            >
              Reset it
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
        <p className="mt-1 text-sm text-gray-500">{email}</p>
        <form onSubmit={handleSignUp} className="mt-6 space-y-4">
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="new-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
              Confirm password
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
          <button
            type="button"
            onClick={goBack}
            className="w-full text-sm text-gray-500 hover:text-gray-700"
          >
            ← Use a different email
          </button>
        </form>
      </div>
    </div>
  );
}
