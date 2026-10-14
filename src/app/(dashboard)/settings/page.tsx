"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { DataService } from "@/lib/data-service";
import { Household, HouseholdMember } from "@/lib/types";
import {
  Edit2,
  ChevronDown,
  Plus,
  Cloud,
  ShieldCheck,
  Check,
  ChevronRight,
  MoreVertical,
} from "lucide-react";

export default function SettingsPage() {
  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [householdName, setHouseholdName] = useState("Sharma Residence");
  const [isEditingName, setIsEditingName] = useState(false);

  // New member form
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRelation, setNewMemberRelation] = useState("Son");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [isSavingMember, setIsSavingMember] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  const loadData = async () => {
    const [h, m] = await Promise.all([
      DataService.getHousehold(),
      DataService.getMembers(),
    ]);
    setHousehold(h);
    setHouseholdName(h.name);
    setMembers(m);
    setCurrentUserId(DataService.getCurrentUser().user_id);
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener("household-user-changed", handleUpdate);
    return () => window.removeEventListener("household-user-changed", handleUpdate);
  }, []);

  const handleSaveName = async () => {
    if (!householdName.trim()) return;
    await DataService.updateHousehold({ name: householdName.trim() });
    setIsEditingName(false);
    setSyncToast("Household name updated!");
    setTimeout(() => setSyncToast(null), 3000);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    try {
      setIsSavingMember(true);
      await DataService.addMember({
        display_name: newMemberName.trim(),
        relationship: newMemberRelation,
        email: newMemberEmail.trim() || undefined,
        role: "member",
        color: "#D4F835",
      });
      setNewMemberName("");
      setNewMemberEmail("");
      loadData();
      setSyncToast("New member added to household!");
      setTimeout(() => setSyncToast(null), 3000);
    } finally {
      setIsSavingMember(false);
    }
  };

  const handleSwitchUser = (userId: string) => {
    DataService.selectActiveUser(userId);
    setCurrentUserId(userId);
    setSyncToast("Switched active user profile!");
    setTimeout(() => setSyncToast(null), 3000);
  };

  const handleSyncCloud = () => {
    setSyncToast("Cloud sync completed. Data backup secured.");
    setTimeout(() => setSyncToast(null), 3000);
  };

  return (
    <AppLayout title="Settings" subtitle="Household preferences and member identity management">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
          Settings
        </h2>

        {syncToast && (
          <div className="p-3.5 rounded-2xl bg-[#D4F835]/15 border border-[#D4F835]/30 text-foreground text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-[#D4F835]" />
            <span>{syncToast}</span>
          </div>
        )}

        {/* Household Section matching Figma */}
        <div className="rounded-[28px] bg-card border border-border p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
            Household
          </h3>

          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1">
              Display name
            </label>
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/60 border border-border">
              {isEditingName ? (
                <input
                  type="text"
                  value={householdName}
                  onChange={(e) => setHouseholdName(e.target.value)}
                  onBlur={handleSaveName}
                  autoFocus
                  className="bg-transparent font-extrabold text-sm text-foreground focus:outline-none w-full"
                />
              ) : (
                <span className="font-extrabold text-sm text-foreground">
                  {householdName}
                </span>
              )}
              <button
                type="button"
                onClick={() => (isEditingName ? handleSaveName() : setIsEditingName(true))}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1">
              Default currency
            </label>
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/60 border border-border">
              <span className="font-extrabold text-sm text-foreground">
                INR • Indian Rupee (₹)
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Family Members Section matching Figma */}
        <div className="rounded-[28px] bg-card border border-border p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-foreground">
                Family Members
              </h3>
              <p className="text-xs text-muted-foreground font-medium">
                {members.length} members
              </p>
            </div>

            <a
              href="#add-new-member"
              className="px-3.5 py-1.5 rounded-full bg-[#0E0E10] hover:bg-black/85 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Add new member</span>
            </a>
          </div>

          <div className="space-y-3 pt-2">
            {members.map((member) => {
              const isActive = member.user_id === currentUserId;

              return (
                <div
                  key={member.id}
                  onClick={() => handleSwitchUser(member.user_id)}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                    isActive
                      ? "border-black dark:border-[#D4F835] bg-muted/70 shadow-xs"
                      : "border-border hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="h-10 w-10 rounded-full text-black font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs"
                      style={{ backgroundColor: member.color || "#D4F835" }}
                    >
                      {member.display_name.charAt(0)}
                    </div>

                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-foreground truncate">
                          {member.display_name}
                        </span>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full bg-[#D4F835] text-black font-black text-[9px] uppercase tracking-wide">
                            Active • You
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground font-mono truncate">
                        User ID: {member.user_id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-muted-foreground">
                    <span className="text-[11px] font-bold text-muted-foreground hidden sm:inline">
                      {member.relationship || member.role}
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add New Member Section matching Figma */}
        <form
          id="add-new-member"
          onSubmit={handleAddMember}
          className="rounded-[28px] bg-card border border-border p-6 shadow-xs space-y-4"
        >
          <h3 className="text-base font-extrabold text-foreground">
            Add New Member
          </h3>

          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1">
              Full name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Pooja Sharma"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-muted/60 border border-border text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">
                Relationship
              </label>
              <select
                value={newMemberRelation}
                onChange={(e) => setNewMemberRelation(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-muted/60 border border-border text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
              >
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Grandfather">Grandfather</option>
                <option value="Grandmother">Grandmother</option>
                <option value="Partner / Spouse">Partner / Spouse</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">
                Email / Phone
              </label>
              <input
                type="text"
                placeholder="pooja@family.local"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-muted/60 border border-border text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSavingMember}
            className="w-full h-11 rounded-full bg-[#0E0E10] hover:bg-black/90 active:scale-98 text-white font-extrabold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isSavingMember ? "Adding..." : "+ Add Member"}
          </button>
        </form>

        {/* Cloud & Data Section matching Figma */}
        <div className="rounded-[28px] bg-card border border-border p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full bg-[#D4F835] text-black flex items-center justify-center font-bold">
                <Cloud className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-foreground">
                  Cloud & Data
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Last synced: Today at 15:42 IST • Encrypted & secure
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSyncCloud}
              className="px-4 py-2 rounded-full bg-[#D4F835] hover:bg-[#c5ea28] active:scale-95 text-black font-extrabold text-xs transition-all shadow-2xs cursor-pointer"
            >
              Cloud sync
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-muted/50 border border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-emerald-500" />
              <div>
                <p className="text-xs font-extrabold text-foreground">Data backup</p>
                <p className="text-[11px] text-muted-foreground">
                  Automatic • Daily • 2.4 GB used of 50 GB
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
