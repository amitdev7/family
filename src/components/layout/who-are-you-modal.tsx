"use client";

import React, { useState, useEffect } from "react";
import { Check, Sparkles, Globe } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { DataService } from "@/lib/data-service";
import { HouseholdMember } from "@/lib/types";
import {
  Language,
  TRANSLATIONS,
  getSavedLanguage,
  saveLanguage,
} from "@/lib/translations";

const MEMBER_STYLES: Record<
  string,
  { bg: string; text: string; avatarBg: string; pillBg: string; emoji: string }
> = {
  "usr-amit": {
    bg: "bg-blue-600",
    text: "text-white",
    avatarBg: "bg-blue-800 text-white",
    pillBg: "bg-white/20 text-white",
    emoji: "👑",
  },
  "usr-ajay": {
    bg: "bg-pink-500",
    text: "text-white",
    avatarBg: "bg-pink-700 text-white",
    pillBg: "bg-white/20 text-white",
    emoji: "🌸",
  },
  "usr-chhotu": {
    bg: "bg-emerald-500",
    text: "text-white",
    avatarBg: "bg-emerald-700 text-white",
    pillBg: "bg-white/20 text-white",
    emoji: "🧸",
  },
};

const LANGUAGE_OPTIONS: Array<{ id: Language; label: string; flag: string }> = [
  { id: "en", label: "English", flag: "🇬🇧" },
  { id: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { id: "hinglish", label: "Hinglish", flag: "💬" },
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
  const [selectedUserId, setSelectedUserId] = useState<string>("usr-amit");
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("en");

  const loadInitialData = async () => {
    const list = await DataService.getMembers();
    setMembers(list);
    const current = DataService.getCurrentUser();
    if (current?.user_id) {
      setSelectedUserId(current.user_id);
    } else if (list.length > 0) {
      setSelectedUserId(list[0].user_id);
    }
    setSelectedLanguage(getSavedLanguage());
  };

  useEffect(() => {
    loadInitialData();

    // Check if new user has identified on this device
    const identified = DataService.hasUserIdentified();
    if (!identified) {
      setIsOpen(true);
    }

    const handleOpen = () => {
      loadInitialData();
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

  const handleSelectLanguage = (lang: Language) => {
    setSelectedLanguage(lang);
    saveLanguage(lang);
  };

  const handleContinue = () => {
    const targetId = selectedUserId || members[0]?.user_id || "usr-amit";
    saveLanguage(selectedLanguage);
    DataService.selectActiveUser(targetId);
    setIsOpen(false);
    if (onClose) onClose();
  };

  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const selectedMemberName = members.find((m) => m.user_id === selectedUserId)?.display_name || "Amit";

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleContinue}
      maxWidth="md"
      hideCloseButton={true}
      preventBackdropClose={true}
      className="p-0 overflow-hidden rounded-[32px] border-0 shadow-2xl bg-card"
    >
      <div className="p-6 sm:p-8 space-y-6 select-none">
        {/* Top Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4F835]/20 text-[#0E0E10] dark:text-[#D4F835] text-xs font-black mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t.welcome}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {t.whoAreYou}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            {t.selectProfile}
          </p>
        </div>

        {/* 1. Language Choice Pills */}
        <div className="space-y-2 p-3.5 rounded-2xl bg-secondary/50 border border-border/80">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span className="flex items-center gap-1.5 text-foreground font-extrabold">
              <Globe className="h-3.5 w-3.5 text-[#D4F835]" />
              <span>{t.selectLanguage}</span>
            </span>
            <span className="text-[11px] font-medium">Language</span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            {LANGUAGE_OPTIONS.map((lang) => {
              const isSelected = selectedLanguage === lang.id;
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.id)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                    isSelected
                      ? "bg-[#D4F835] text-black border-transparent shadow-xs scale-102"
                      : "bg-card hover:bg-secondary/80 text-foreground border-border/80"
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Strictly 3 Members Selection Grid (Amit, Ajay, Chhotu) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
          {members.map((member) => {
            const isSelected = member.user_id === selectedUserId;
            const style = MEMBER_STYLES[member.user_id] || {
              bg: "bg-blue-600",
              text: "text-white",
              avatarBg: "bg-blue-800 text-white",
              pillBg: "bg-white/20 text-white",
              emoji: "👤",
            };

            return (
              <button
                key={member.id}
                type="button"
                onClick={() => setSelectedUserId(member.user_id)}
                className={`relative flex flex-col items-center justify-between p-5 rounded-2xl transition-all duration-200 text-center cursor-pointer shadow-md ${
                  style.bg
                } ${style.text} ${
                  isSelected
                    ? "ring-4 ring-[#D4F835] ring-offset-2 ring-offset-card scale-105 shadow-xl"
                    : "hover:scale-102 opacity-85 hover:opacity-100"
                }`}
              >
                {/* Selected Check Badge */}
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 h-5 w-5 rounded-full bg-[#D4F835] text-black flex items-center justify-center shadow-xs">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                )}

                {/* Avatar Initial Circle */}
                <div
                  className={`h-14 w-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner relative ${style.avatarBg}`}
                >
                  <span>{member.display_name.slice(0, 1).toUpperCase()}</span>
                  <span className="absolute -bottom-1 -right-1 text-sm">
                    {style.emoji}
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="font-extrabold text-base tracking-tight leading-tight">
                    {member.display_name}
                  </h3>
                  <div className="mt-1">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold backdrop-blur-xs ${style.pillBg}`}
                    >
                      {member.role === "admin" ? "Admin" : "Member"}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* 3. Continue & Enter Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleContinue}
            className="w-full py-3.5 px-6 rounded-full bg-[#0E0E10] text-white hover:bg-zinc-800 text-sm font-black transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <span>
              {t.continueAs} {selectedMemberName}
            </span>
            <span className="text-[#D4F835]">→</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
