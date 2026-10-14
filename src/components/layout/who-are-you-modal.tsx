"use client";

import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { DataService } from "@/lib/data-service";
import { HouseholdMember } from "@/lib/types";

const RELATIONSHIP_OPTIONS = [
  "Father",
  "Mother",
  "Son",
  "Daughter",
  "Grandfather",
  "Grandmother",
  "Partner / Spouse",
  "Brother",
  "Sister",
  "Other",
];

const COLOR_OPTIONS = [
  { name: "Blue", hex: "#3B82F6" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Lime", hex: "#D4F835" },
  { name: "Orange", hex: "#F97316" },
  { name: "Black", hex: "#0E0E10" },
];

const MEMBER_BG_COLORS = [
  "bg-[#3B82F6]", // Blue
  "bg-[#EC4899]", // Pink
  "bg-[#10B981]", // Green
  "bg-[#F97316]", // Orange
  "bg-[#8B5CF6]", // Purple
  "bg-[#06B6D4]", // Cyan
];

interface WhoAreYouModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export function WhoAreYouModal({ forceOpen, onClose }: WhoAreYouModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");

  // New member form
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("Father");
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].hex);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMembers = () => {
    DataService.getMembers().then((mems) => {
      setMembers(mems);
      const current = DataService.getCurrentUser();
      if (current?.id) {
        setSelectedMemberId(current.id);
      } else if (mems.length > 0) {
        setSelectedMemberId(mems[0].id);
      }
    });
  };

  useEffect(() => {
    loadMembers();

    if (!DataService.hasUserIdentified()) {
      setIsOpen(true);
    }

    const handleOpen = () => {
      loadMembers();
      setIsOpen(true);
    };

    window.addEventListener("open-who-are-you", handleOpen);
    return () => window.removeEventListener("open-who-are-you", handleOpen);
  }, []);

  useEffect(() => {
    if (forceOpen !== undefined) {
      setIsOpen(forceOpen);
    }
  }, [forceOpen]);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleSelectMember = (member: HouseholdMember) => {
    setSelectedMemberId(member.id);
    DataService.selectActiveUser(member.user_id);
    handleClose();
  };

  const handleContinue = async () => {
    // If the user entered a name in "Add Details", create that member
    if (name.trim()) {
      try {
        setIsSaving(true);
        setError(null);
        const newMember = await DataService.addMember({
          display_name: name.trim(),
          relationship: relationship,
          color: selectedColor,
          role: "member",
        });
        DataService.selectActiveUser(newMember.user_id);
        setName("");
        handleClose();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to add family member");
      } finally {
        setIsSaving(false);
      }
      return;
    }

    // Otherwise select the clicked member
    const target = members.find((m) => m.id === selectedMemberId);
    if (target) {
      DataService.selectActiveUser(target.user_id);
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-card text-card-foreground rounded-[32px] p-6 sm:p-8 shadow-2xl border border-border max-h-[92vh] overflow-y-auto">
        {/* Header with Close Button */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Who are you?
            </h2>
            <p className="text-sm font-medium text-muted-foreground mt-0.5">
              Select your family member
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="h-9 w-9 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 2x2 Grid of Family Member Cards matching Figma */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {members.map((member, idx) => {
            const isSelected = member.id === selectedMemberId;
            const bgClass =
              MEMBER_BG_COLORS[idx % MEMBER_BG_COLORS.length];
            const initials = member.display_name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <button
                key={member.id}
                type="button"
                onClick={() => handleSelectMember(member)}
                className={`relative p-4 rounded-2xl text-left text-white ${bgClass} transition-all duration-200 cursor-pointer active:scale-98 shadow-sm hover:brightness-105 flex items-center gap-3.5 ${
                  isSelected ? "ring-3 ring-black dark:ring-white scale-[1.02]" : ""
                }`}
              >
                {/* Circular Avatar badge */}
                <div className="h-11 w-11 rounded-full bg-black/20 flex items-center justify-center font-bold text-sm text-white shrink-0">
                  {initials}
                </div>

                {/* Name & Relation Pill */}
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-base leading-snug truncate">
                    {member.display_name}
                  </p>
                  <span className="inline-block px-2.5 py-0.5 mt-1 rounded-full bg-white/25 text-[11px] font-semibold text-white tracking-wide">
                    {member.relationship || member.role}
                  </span>
                </div>

                {isSelected && (
                  <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-black/30 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="h-px bg-border my-6" />

        {/* "Add Details" Section */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-foreground">
            Add Details
          </h3>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-xl">
              {error}
            </p>
          )}

          {/* Full Name */}
          <div className="flex items-center gap-3">
            <label className="w-24 text-xs font-bold text-muted-foreground shrink-0">
              Name
            </label>
            <input
              type="text"
              placeholder="Enter full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 h-11 px-4 rounded-xl bg-muted/60 border border-border text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
            />
          </div>

          {/* Relationship */}
          <div className="flex items-center gap-3">
            <label className="w-24 text-xs font-bold text-muted-foreground shrink-0">
              Relationship
            </label>
            <select
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              className="flex-1 h-11 px-4 rounded-xl bg-muted/60 border border-border text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
            >
              {RELATIONSHIP_OPTIONS.map((rel) => (
                <option key={rel} value={rel}>
                  {rel}
                </option>
              ))}
            </select>
          </div>

          {/* Avatar Color Picker */}
          <div className="flex items-center gap-3">
            <label className="w-24 text-xs font-bold text-muted-foreground shrink-0">
              Avatar Color
            </label>
            <div className="flex items-center gap-2.5">
              {COLOR_OPTIONS.map((c) => {
                const isPicked = selectedColor === c.hex;
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setSelectedColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`h-7 w-7 rounded-full flex items-center justify-center transition-transform cursor-pointer ${
                      isPicked ? "ring-2 ring-offset-2 ring-black dark:ring-white scale-110" : "hover:scale-105"
                    }`}
                    aria-label={c.name}
                  >
                    {isPicked && (
                      <Check className={`h-3.5 w-3.5 stroke-[3] ${c.hex === "#D4F835" ? "text-black" : "text-white"}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Actions: Cancel & Continue */}
        <div className="grid grid-cols-2 gap-3 mt-8">
          <button
            type="button"
            onClick={handleClose}
            className="h-12 rounded-full border border-border bg-card text-foreground font-bold text-sm hover:bg-muted transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleContinue}
            disabled={isSaving}
            className="h-12 rounded-full bg-[#D4F835] hover:bg-[#c5ea28] active:scale-98 text-black font-extrabold text-sm transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <span>{isSaving ? "Saving..." : "Continue →"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
