"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Home, Lock, Mail, User, KeyRound, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { signInWithGoogle } from "@/lib/firebase/auth";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteTokenParam = searchParams.get("invite") || "";

  const [mode, setMode] = useState<"invite" | "new_household">(inviteTokenParam ? "invite" : "new_household");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteToken, setInviteToken] = useState(inviteTokenParam);
  const [householdName, setHouseholdName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleGoogleSignUp = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Google Sign-In failed or was cancelled.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (signUpError) throw signUpError;

        if (mode === "invite" && inviteToken) {
          // Accept invitation through RPC
          const { error: inviteError } = await supabase.rpc("accept_household_invitation", {
            invite_token: inviteToken,
            member_name: fullName,
          });
          if (inviteError) {
            console.warn("Invite RPC error:", inviteError);
          }
        } else if (mode === "new_household" && householdName) {
          // Create new household
          await supabase.from("households").insert({
            name: householdName,
            currency: "INR",
            locale: "en-IN",
          });
        }

        setSuccess("Account created successfully! Redirecting to your household...");
      }

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
            <Home className="h-6 w-6" />
          </div>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Join or Create a Household
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
          Strict household security ensures private, segregated access
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-secondary rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setMode("new_household")}
              className={`py-2 text-xs font-semibold rounded-lg transition-colors ${mode === "new_household"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              New Household
            </button>
            <button
              type="button"
              onClick={() => setMode("invite")}
              className={`py-2 text-xs font-semibold rounded-lg transition-colors ${mode === "invite"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Have Invite Token
            </button>
          </div>

          {/* Primary Google Sign Up Button (Firebase Auth) */}
          <div className="mb-6 space-y-2">
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl border-2 border-border/80 bg-secondary/50 hover:bg-secondary text-foreground font-black text-sm transition-all cursor-pointer shadow-sm hover:shadow-md hover:border-[#D4F835] active:scale-[0.99] disabled:opacity-50"
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isGoogleLoading ? "Connecting..." : "Sign Up with Google (Fast & Permanent)"}</span>
            </button>
            <p className="text-[11px] text-center text-muted-foreground font-medium">
              Permanent session • Household access enabled immediately
            </p>
          </div>

          {/* Divider */}
          <div className="relative mb-6 flex items-center justify-center">
            <div className="border-t border-border w-full"></div>
            <span className="bg-card px-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Or register with email
            </span>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs sm:text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {mode === "new_household" ? (
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Household Name
                </label>
                <div className="relative">
                  <Home className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    required
                    placeholder="e.g. The Sharma Residence"
                    value={householdName}
                    onChange={(e) => setHouseholdName(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Invitation Code / Token
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    required
                    placeholder="Enter token from your invite email"
                    value={inviteToken}
                    onChange={(e) => setInviteToken(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full mt-2 font-semibold" isLoading={isLoading}>
              {mode === "new_household" ? "Create Household & Account" : "Join Household with Token"}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-sm text-muted-foreground">Loading...</div>}>
      <SignUpForm />
    </React.Suspense>
  );
}

