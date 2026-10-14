"use client";

import React, { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Edit2,
  ChevronDown,
  Plus,
  Cloud,
  ShieldCheck,
  Check,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { DataService } from "@/lib/data-service";
import { Household, HouseholdMember } from "@/lib/types";

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
  const [displayName, setDisplayName] = useState("Sharma Residence");
  const [isEditingName, setIsEditingName] = useState(false);

  // Add Member Form
  const [newFullName, setNewFullName] = useState("");
  const [newContact, setNewContact] = useState("");
  const [isSavingMember, setIsSavingMember] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadData = async () => {
    const [h, mems] = await Promise.all([
      DataService.getHousehold(),
      DataService.getMembers(),
    ]);
    setHousehold(h);
    if (h?.name) setDisplayName(h.name);
    setMembers(mems);
    setCurrentUserId(DataService.getCurrentUser().user_id);
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener("household-user-changed", handleUpdate);
    return () => window.removeEventListener("household-user-changed", handleUpdate);
  }, []);

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
                  INR • Indian Rupee (₹)
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

        {/* Section 4: Cloud & Data matching Figma */}
        <div className="rounded-[28px] bg-card border border-border/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-foreground">
              Cloud &amp; Data
            </h3>

            {/* Cloud Sync Button matching Figma */}
            <button
              type="button"
              onClick={handleCloudSync}
              className="px-4 py-1.5 rounded-full bg-[#D4F835] hover:bg-[#c5ea28] text-black text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Cloud sync
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground font-medium">
            Last synced: Today at 15:42 IST • Encrypted &amp; secure
          </p>

          {/* Data Backup Row */}
          <div className="p-4 rounded-2xl bg-secondary/40 border border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-xs sm:text-sm text-foreground">
                  Data backup
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Automatic • Daily
                </p>
              </div>
            </div>

            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>

          <p className="text-[11px] text-muted-foreground font-medium">
            Backup stored in cloud • 2.4 GB used of 50 GB
          </p>
        </div>
      </div>
    </AppLayout>
  );
}

