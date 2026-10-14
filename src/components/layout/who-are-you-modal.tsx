"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DataService } from "@/lib/data-service";
import { HouseholdMember } from "@/lib/types";
import { Users, UserPlus, Check, Sparkles, HeartHandshake, ShieldCheck } from "lucide-react";

const RELATIONSHIP_OPTIONS = [
  "Father",
  "Mother",
  "Son",
  "Daughter",
  "Grandfather",
  "Grandmother",
  "Brother",
  "Sister",
  "Uncle",
  "Aunt",
  "Partner / Spouse",
  "Roommate",
  "Other",
];

const COLOR_OPTIONS = [
  "#2563eb", // Blue
  "#ec4899", // Pink
  "#10b981", // Emerald
  "#8b5cf6", // Purple
  "#f97316", // Orange
  "#06b6d4", // Cyan
  "#eab308", // Yellow
  "#ef4444", // Red
  "#14b8a6", // Teal
  "#6366f1", // Indigo
];

interface WhoAreYouModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export function WhoAreYouModal({ forceOpen, onClose }: WhoAreYouModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [activeUserId, setActiveUserId] = useState<string>("");
  const [tab, setTab] = useState<"select" | "create">("select");

  // New member form state
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("Father");
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshData = async () => {
    const mems = await DataService.getMembers();
    setMembers(mems);
    const curr = DataService.getCurrentUser();
    setActiveUserId(curr.user_id);
  };

  useEffect(() => {
    refreshData();

    // Check if user has identified themselves on this browser/device
    const hasIdentified = DataService.hasUserIdentified();
    if (!hasIdentified || forceOpen) {
      setIsOpen(true);
      // If no members exist or explicitly forced into create
      if (!hasIdentified) {
        setTab("select");
      }
    }

    const handleOpenModal = () => {
      refreshData();
      setIsOpen(true);
    };

    const handleUserChanged = () => {
      refreshData();
    };

    window.addEventListener("open-who-are-you", handleOpenModal);
    window.addEventListener("household-user-changed", handleUserChanged);

    return () => {
      window.removeEventListener("open-who-are-you", handleOpenModal);
      window.removeEventListener("household-user-changed", handleUserChanged);
    };
  }, [forceOpen]);

  const handleSelectMember = (userId: string) => {
    DataService.selectActiveUser(userId);
    setActiveUserId(userId);
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    try {
      setIsSaving(true);
      const newMember = await DataService.addMember({
        name: name.trim(),
        relationship: relationship.trim(),
        color,
        role: "member",
      });
      setActiveUserId(newMember.user_id);
      setName("");
      setIsOpen(false);
      if (onClose) onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    // If the user has never identified themselves, pick the first member as default so they can browse
    if (!DataService.hasUserIdentified() && members.length > 0) {
      DataService.selectActiveUser(members[0].user_id);
    }
    setIsOpen(false);
    if (onClose) onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="md"
      className="p-0 overflow-hidden"
    >
      <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-background p-6 border-b border-border text-center relative">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md mb-3">
          <HeartHandshake className="h-7 w-7" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Who are you in this home?
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
          Choose your family profile or add yourself so expenses and activity are credited accurately to you.
        </p>

        {/* Tab switch pills */}
        <div className="mt-5 inline-flex p-1 rounded-xl bg-muted/80 border border-border/60">
          <button
            type="button"
            onClick={() => {
              setTab("select");
              setError(null);
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${tab === "select"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Existing Member</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("create");
              setError(null);
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${tab === "create"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>I am New / Add Details</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {tab === "select" ? (
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tap your profile to continue:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
              {members.map((m) => {
                const isSelected = m.user_id === activeUserId;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSelectMember(m.user_id)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all relative ${isSelected
                      ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary"
                      : "border-border bg-card/70 hover:bg-muted/60 hover:border-border/80"
                      }`}
                  >
                    <Avatar name={m.display_name} src={m.avatar_url} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-foreground truncate">
                          {m.display_name}
                        </span>
                        {isSelected && (
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {m.relationship && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium">
                            {m.relationship}
                          </Badge>
                        )}
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                          {m.role}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground/70 font-mono block truncate mt-0.5">
                        ID: {m.user_id.slice(0, 14)}...
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span>Not in this list?</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTab("create")}
                className="gap-1.5 text-xs"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Add Your Details</span>
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateMember} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Your Full Name *
              </label>
              <Input
                type="text"
                required
                placeholder="e.g. Ramesh Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Family Role / Relation *
              </label>
              <Select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
              >
                {RELATIONSHIP_OPTIONS.map((rel) => (
                  <option key={rel} value={rel}>
                    {rel}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Profile Color
              </label>
              <div className="flex flex-wrap gap-2 mb-1">
                {COLOR_OPTIONS.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setColor(hex)}
                    className={`h-7 w-7 rounded-full transition-all ${color === hex
                      ? "scale-110 ring-2 ring-primary ring-offset-2"
                      : "hover:scale-105 opacity-80"
                      }`}
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-muted/40 border border-border text-[11px] text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                A permanent, unique user ID will be generated to securely track all your family expenses.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTab("select")}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isSaving} className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Save & Set As My Profile</span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
