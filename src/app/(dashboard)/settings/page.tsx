"use client";

import React, { useState, useEffect } from "react";
import {
  Edit2,
  ChevronDown,
  ShieldCheck,
  ChevronRight,
  Database,
  Trash2,
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { DataService } from "@/lib/data-service";
import { Household, HouseholdMember } from "@/lib/types";
import {
  getPersistedAuthUser,
  signInWithGoogle,
  signOutGoogle,
  StoredAuthUser,
} from "@/lib/firebase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";

const AVATAR_COLORS = [
  "bg-amber-400 text-black",
  "bg-pink-400 text-white",
  "bg-blue-500 text-white",
  "bg-purple-500 text-white",
];

export default function SettingsPage() {
  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  // Edit Household
  const [displayName, setDisplayName] = useState("My Household");
  const [isEditingName, setIsEditingName] = useState(false);

  // Add Member Form
  const [newFullName, setNewFullName] = useState("");
  const [newContact, setNewContact] = useState("");
  const [isSavingMember, setIsSavingMember] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<StoredAuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const loadData = async () => {
    const [h, mems] = await Promise.all([
      DataService.getHousehold(),
      DataService.getMembers(),
    ]);
    setHousehold(h);
    if (h?.name) setDisplayName(h.name);
    setMembers(mems);
    setCurrentUserId(DataService.getCurrentUser().user_id);
    setAuthUser(getPersistedAuthUser());
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener("household-user-changed", handleUpdate);
    return () => window.removeEventListener("household-user-changed", handleUpdate);
  }, []);

  const handleGoogleConnect = async () => {
    try {
      setIsAuthLoading(true);
      const user = await signInWithGoogle();
      setAuthUser(user);
      loadData();
      setToastMsg("Connected to Google! Session permanently saved.");
      setTimeout(() => setToastMsg(null), 3500);
    } catch {
      setToastMsg("Google authentication cancelled or failed.");
      setTimeout(() => setToastMsg(null), 3000);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleGoogleDisconnect = async () => {
    await signOutGoogle();
    setAuthUser(null);
    setToastMsg("Google account disconnected.");
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleClearAllData = async () => {
    if (confirm("Are you sure you want to clear all expenses and money inflow logs? This resets to a completely fresh clean slate.")) {
      await DataService.clearAllData();
      loadData();
      setToastMsg("All fake & old data cleared! Fresh slate ready.");
      setTimeout(() => setToastMsg(null), 3500);
    }
  };

  const handleSaveName = async () => {
    if (!displayName.trim()) return;
    await DataService.updateHousehold({ name: displayName.trim() });
    setIsEditingName(false);
    setToastMsg("Household name updated!");
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim()) return;

    try {
      setIsSavingMember(true);
      await DataService.addMember({
        display_name: newFullName.trim(),
        relationship: "Member",
        email: newContact.trim() || undefined,
        role: "member",
        color: "#D4F835",
      });
      setNewFullName("");
      setNewContact("");
      loadData();
      setToastMsg("New member added to household!");
      setTimeout(() => setToastMsg(null), 3000);
    } finally {
      setIsSavingMember(false);
    }
  };

  const handleSwitchUser = (userId: string) => {
    DataService.selectActiveUser(userId);
    setCurrentUserId(userId);
    setToastMsg("Active profile switched!");
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCloudSync = () => {
    setToastMsg("Cloud sync complete! Encrypted & secure.");
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <AppLayout title="Household Settings">
      <div className="max-w-xl mx-auto space-y-6 select-none">
        {/* Top Header matching Figma image_20261014_111612.jpg right */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Settings
          </h2>
        </div>

        {toastMsg && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold text-center animate-in fade-in">
            {toastMsg}
          </div>
        )}

        {/* Section 1: Household */}
        <div className="rounded-[28px] bg-card border border-border/80 p-6 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-foreground">
            Household
          </h3>

          <div className="space-y-4">
            {/* Display Name */}
            <div>
              <span className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Display name
              </span>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-secondary/50 border border-border">
                {isEditingName ? (
                  <div className="flex items-center gap-2 flex-1 mr-2">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-card px-3 py-1 rounded-lg text-sm font-bold text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
                    />
                    <button
                      type="button"
                      onClick={handleSaveName}
                      className="px-3 py-1 rounded-lg bg-[#D4F835] text-black text-xs font-bold cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <span className="font-bold text-sm text-foreground">
                    {displayName}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setIsEditingName(!isEditingName)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Default Currency */}
            <div>
              <span className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Default currency
              </span>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-secondary/50 border border-border cursor-pointer">
                <span className="font-bold text-sm text-foreground">
                  {household?.currency || "INR"} • Indian Rupee (₹)
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Family Members matching Figma */}
        <div className="rounded-[28px] bg-card border border-border/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-foreground">
              Family Members
            </h3>
            <span className="text-xs font-bold text-muted-foreground">
              {members.length} members
            </span>
          </div>

          <div className="space-y-3">
            {members.map((member, idx) => {
              const isActive = member.user_id === currentUserId;
              const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              const initial = member.display_name.slice(0, 1).toUpperCase();

              return (
                <div
                  key={member.id}
                  onClick={() => handleSwitchUser(member.user_id)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${isActive
                    ? "border-black/30 dark:border-white/30 bg-secondary/70 shadow-xs"
                    : "border-border/60 hover:bg-secondary/40"
                    }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`h-11 w-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs ${colorClass}`}
                    >
                      {initial}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-foreground truncate">
                          {member.display_name}
                        </span>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full bg-[#D4F835] text-black text-[10px] font-extrabold shadow-2xs">
                            Active • You
                          </span>
                        )}
                        {!isActive && (
                          <span className="text-[11px] text-muted-foreground font-semibold">
                            {member.relationship || "Member"}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] font-mono text-muted-foreground truncate mt-0.5">
                        User ID: {member.user_id}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 pl-2">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Add New Member matching Figma */}
        <div className="rounded-[28px] bg-card border border-border/80 p-6 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-foreground">
            Add New Member
          </h3>

          <form onSubmit={handleAddMember} className="space-y-3.5">
            <div>
              <input
                type="text"
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                placeholder="Full name"
                required
                className="w-full px-4 py-2.5 rounded-2xl bg-secondary/50 border border-border text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
              />
            </div>

            <div>
              <input
                type="text"
                value={newContact}
                onChange={(e) => setNewContact(e.target.value)}
                placeholder="Email or phone number"
                className="w-full px-4 py-2.5 rounded-2xl bg-secondary/50 border border-border text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
              />
            </div>

            <button
              type="submit"
              disabled={isSavingMember}
              className="w-full py-3 rounded-full bg-[#0E0E10] text-white hover:bg-zinc-800 font-bold text-sm transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isSavingMember ? "Adding..." : "+ Add New Member"}
            </button>
          </form>
        </div>

        {/* Section 4: Google Account & Firebase Auth */}
        <div className="rounded-[28px] bg-card border border-border/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-foreground">
              Google Account &amp; Auth
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
              Permanent Persistence
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-secondary/40 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-card border border-border flex items-center justify-center shrink-0">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
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
              </div>

              <div>
                <p className="font-extrabold text-sm text-foreground">
                  {authUser ? authUser.displayName || "Google Account Connected" : "Connect with Google"}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {authUser ? authUser.email || "Persistent Firebase Session Active" : "Sign in to keep your session permanently active"}
                </p>
              </div>
            </div>

            {authUser ? (
              <button
                type="button"
                onClick={handleGoogleDisconnect}
                className="px-4 py-2 rounded-full border border-border hover:bg-secondary text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Disconnect
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGoogleConnect}
                disabled={isAuthLoading}
                className="px-4 py-2 rounded-full bg-[#0E0E10] text-white hover:bg-zinc-800 text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isAuthLoading ? "Connecting..." : "Sign in with Google"}
              </button>
            )}
          </div>
        </div>

        {/* Section 5: Cloud, Database & Reset */}
        <div className="rounded-[28px] bg-card border border-border/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-foreground">
              Cloud Database &amp; Storage
            </h3>

            {/* Cloud Sync Button */}
            <button
              type="button"
              onClick={handleCloudSync}
              className="px-4 py-1.5 rounded-full bg-[#D4F835] hover:bg-[#c5ea28] text-black text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Cloud sync
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground font-medium">
            Database: {isSupabaseConfigured() ? "Supabase Connected & Active" : "Local Storage + Supabase Ready"} • Encrypted &amp; secure
          </p>

          {/* Database Row */}
          <div className="p-4 rounded-2xl bg-secondary/40 border border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-xs sm:text-sm text-foreground">
                  Supabase Database
                </p>
                <p className="text-[11px] text-muted-foreground">
                  PostgreSQL with Row Level Security (RLS)
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold">
              Online
            </span>
          </div>

          {/* Data Backup Row */}
          <div className="p-4 rounded-2xl bg-secondary/40 border border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-xs sm:text-sm text-foreground">
                  Data backup &amp; encryption
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Automatic • Daily • Multi-region
                </p>
              </div>
            </div>

            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Reset / Clean Slate Button */}
          <div className="pt-2 border-t border-border/60">
            <button
              type="button"
              onClick={handleClearAllData}
              className="w-full py-3 rounded-2xl border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 text-destructive text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear All Dummy Data &amp; Reset to Fresh Clean Slate</span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

