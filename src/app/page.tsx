"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Globe, Sparkles, Home } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
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

export default function WelcomeEntryPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("usr-amit");
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("en");
  const [isEntering, setIsEntering] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // If user has already chosen their member identity, proceed to dashboard
    if (DataService.hasUserIdentified()) {
      router.replace("/dashboard");
      return;
    }

    DataService.getMembers().then((list) => {
      setMembers(list);
      if (list.length > 0) {
        setSelectedUserId(list[0].user_id);
      }
    });

    setSelectedLanguage(getSavedLanguage());
  }, [router]);

  const handleSelectLanguage = (lang: Language) => {
    setSelectedLanguage(lang);
    saveLanguage(lang);
  };

  const handleEnterHousehold = () => {
    setIsEntering(true);
    const targetId = selectedUserId || members[0]?.user_id || "usr-amit";
    saveLanguage(selectedLanguage);
    DataService.selectActiveUser(targetId);
    router.replace("/dashboard");
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-[#D4F835] border-t-transparent animate-spin" />
      </div>
    );
  }

  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const selectedMemberName =
    members.find((m) => m.user_id === selectedUserId)?.display_name || "Amit";

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative select-none">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        {/* Logo and Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0E0E10] text-[#D4F835] shadow-lg mb-2">
            <Home className="h-7 w-7 stroke-[2.2]" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4F835]/20 text-[#0E0E10] dark:text-[#D4F835] text-xs font-black">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t.welcome}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            {t.whoAreYou}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-sm mx-auto">
            {t.selectProfile}
          </p>
        </div>

        {/* Card Container */}
        <div className="rounded-[32px] border border-border bg-card p-6 sm:p-8 shadow-xl space-y-6">
          {/* 1. Language Selection Pills */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-secondary/50 border border-border/80">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
              <span className="flex items-center gap-1.5 text-foreground font-extrabold">
                <Globe className="h-3.5 w-3.5 text-[#D4F835]" />
                <span>{t.selectLanguage}</span>
              </span>
              <span className="text-[11px] font-medium">Step 1 of 2</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {LANGUAGE_OPTIONS.map((lang) => {
                const isSelected = selectedLanguage === lang.id;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => handleSelectLanguage(lang.id)}
                    className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${isSelected
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

          {/* 2. Strictly 3 Members (Amit, Ajay, Chhotu) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground px-1">
              <span className="text-foreground font-extrabold">
                Select Your Member Profile
              </span>
              <span className="text-[11px] font-medium">Step 2 of 2</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {members.map((member, idx) => {
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
                    className={`relative flex flex-col items-center justify-between p-5 rounded-2xl transition-all duration-200 text-center cursor-pointer shadow-md ${style.bg
                      } ${style.text} ${isSelected
                        ? "ring-4 ring-[#D4F835] ring-offset-2 ring-offset-card scale-105 shadow-xl"
                        : "hover:scale-102 opacity-85 hover:opacity-100"
                      }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 h-5 w-5 rounded-full bg-[#D4F835] text-black flex items-center justify-center shadow-xs">
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </div>
                    )}

                    <div
                      className={`h-14 w-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner relative ${style.avatarBg}`}
                    >
                      <span>{member.display_name.slice(0, 1).toUpperCase()}</span>
                      <span className="absolute -bottom-1 -right-1 text-sm">
                        {style.emoji}
                      </span>
                    </div>

                    <div className="mt-3">
                      <span className="text-[10px] uppercase font-black tracking-wider opacity-80 block mb-0.5">
                        Member {idx + 1}
                      </span>
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
          </div>

          {/* 3. Enter Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleEnterHousehold}
              disabled={isEntering}
              className="w-full py-4 px-6 rounded-full bg-[#0E0E10] text-white hover:bg-zinc-800 text-sm font-black transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              <span>
                {t.continueAs} {selectedMemberName}
              </span>
              <span className="text-[#D4F835] font-bold text-base">→</span>
            </button>
            <p className="text-[11px] text-center text-muted-foreground font-medium mt-3">
              Direct access • Your selection is saved permanently for this device
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
