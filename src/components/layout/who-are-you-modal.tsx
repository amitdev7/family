"use client";

import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { DataService } from "@/lib/data-service";
import { HouseholdMember } from "@/lib/types";

const RELATIONSHIP_OPTIONS = [
  "Father",
  "Mother",
  "Son",
  "Daughter",
  "Self",
  "Spouse",
  "Brother",
  "Sister",
  "Grandparent",
  "Other",
];

const AVATAR_COLORS = [
  { name: "Blue", hex: "#3b82f6", bgClass: "bg-blue-500", textClass: "text-white" },
  { name: "Pink", hex: "#f472b6", bgClass: "bg-pink-400", textClass: "text-white" },
  { name: "Lime", hex: "#D4F835", bgClass: "bg-[#D4F835]", textClass: "text-black" },
  { name: "Orange", hex: "#fb923c", bgClass: "bg-orange-400", textClass: "text-white" },
  { name: "Black", hex: "#0E0E10", bgClass: "bg-[#0E0E10]", textClass: "text-white" },
];

// 4 Figma Cards styles matching image_20261014_111553.jpg
const MEMBER_CARD_STYLES = [
  {
    bg: "bg-[#3b82f6]",
    text: "text-white",
    avatarBg: "bg-[#2563eb] text-white",
    pillBg: "bg-white/25 text-white",
    border: "border-blue-400",
  },
  {
    bg: "bg-[#f472b6]",
    text: "text-white",
    avatarBg: "bg-[#ec4899] text-white",
    pillBg: "bg-white/25 text-white",
    border: "border-pink-300",
  },
  {
    bg: "bg-[#4ade80]",
    text: "text-black",
    avatarBg: "bg-[#D4F835] text-black",
    pillBg: "bg-white/70 text-black",
    border: "border-emerald-300",
  },
  {
    bg: "bg-[#fb923c]",
    text: "text-white",
    avatarBg: "bg-[#f97316] text-white",
    pillBg: "bg-white/25 text-white",
    border: "border-orange-300",
  },
];

interface WhoAreYouModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function WhoAreYouModal({
  isOpen: controlledIsOpen,
  onClose,
}: WhoAreYouModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  // Add Details Form
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("Father");
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0].hex);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMembers = async () => {
    const list = await DataService.getMembers();
    setMembers(list);
    const current = DataService.getCurrentUser();
    setSelectedUserId(current?.user_id || (list[0]?.user_id ?? ""));
  };

  useEffect(() => {
    loadMembers();

    // Check if new user has identified on this device
    const identified = DataService.hasUserIdentified();
    if (!identified) {
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
    if (controlledIsOpen !== undefined) {
      setIsOpen(controlledIsOpen);
    }
  }, [controlledIsOpen]);

  const handleSelectMember = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleClose = () => {
    if (!DataService.hasUserIdentified() && members.length > 0) {
      DataService.selectActiveUser(selectedUserId || members[0].user_id);
    }
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleContinue = async () => {
    // If the user entered custom details in "Add Details", create member
    if (name.trim()) {
      try {
        setIsSaving(true);
        setError(null);
        const newMember = await DataService.addMember({
          display_name: name.trim(),
          relationship,
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

    // Otherwise, select the currently highlighted member
    if (selectedUserId) {
      DataService.selectActiveUser(selectedUserId);
      handleClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="md"
      className="p-0 overflow-hidden rounded-[32px] border-0 shadow-2xl bg-card"
    >
      <div className="p-6 sm:p-8 space-y-6">
        {/* Top Header matching Figma image_20261014_111553.jpg */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Who are you?
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5 font-medium">
              Select your family member
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 2x2 Colored Family Cards Grid from Figma */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {members.slice(0, 4).map((member, idx) => {
            const isSelected = member.user_id === selectedUserId;
            const style = MEMBER_CARD_STYLES[idx % MEMBER_CARD_STYLES.length];
            const initials = member.display_name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();

            return (
              <button
                key={member.id}
                type="button"
                onClick={() => handleSelectMember(member.user_id)}
                className={`relative flex items-center gap-3.5 p-4 rounded-2xl transition-all duration-200 text-left cursor-pointer shadow-sm ${style.bg} ${style.text} ${isSelected
                  ? "ring-4 ring-black/40 scale-[1.02] shadow-md"
                  : "hover:scale-[1.01] opacity-95"
                  }`}
              >
                {/* Avatar Initial Circle */}
                <div
                  className={`h-11 w-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${style.avatarBg}`}
                >
                  {initials}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-base truncate leading-tight">
                    {member.display_name}
                  </h3>
                  <div className="mt-1">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold backdrop-blur-xs ${style.pillBg}`}
                    >
                      {member.relationship || "Member"}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-white text-black flex items-center justify-center shadow-xs">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Add Details Section */}
        <div className="pt-2 border-t border-border/60 space-y-3.5">
          <h4 className="font-bold text-base text-foreground">
            Add Details
          </h4>

          {error && (
            <div className="p-2.5 rounded-xl bg-destructive/10 text-destructive text-xs font-medium">
              {error}
            </div>
          )}

          {/* Name Row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label className="text-xs font-bold text-foreground w-20 shrink-0">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
              className="flex-1 px-4 py-2 rounded-xl bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
            />
          </div>

          {/* Relationship & Avatar Color Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-foreground w-20 shrink-0">
                Relationship
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-secondary/50 border border-border text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835] cursor-pointer"
              >
                {RELATIONSHIP_OPTIONS.map((rel) => (
                  <option key={rel} value={rel}>
                    {rel}
                  </option>
                ))}
              </select>
            </div>

            {/* Avatar Color Swatches */}
            <div className="flex items-center gap-2 sm:pl-2">
              <span className="text-xs font-medium text-muted-foreground mr-1">
                Avatar Color
              </span>
              <div className="flex items-center gap-1.5">
                {AVATAR_COLORS.map((col) => (
                  <button
                    key={col.hex}
                    type="button"
                    onClick={() => setSelectedColor(col.hex)}
                    className={`h-6 w-6 rounded-full flex items-center justify-center transition-transform cursor-pointer ${col.bgClass} ${selectedColor === col.hex
                      ? "scale-110 ring-2 ring-black dark:ring-white"
                      : "hover:scale-105 opacity-80"
                      }`}
                    title={col.name}
                  >
                    {selectedColor === col.hex && (
                      <Check className={`h-3 w-3 stroke-[3] ${col.textClass}`} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons: Cancel & Continue -> */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-3 px-4 rounded-full border border-border text-sm font-bold text-foreground hover:bg-secondary transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleContinue}
            disabled={isSaving}
            className="flex-1 py-3 px-4 rounded-full bg-[#D4F835] hover:bg-[#c5ea28] text-black text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <span>Continue</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}

