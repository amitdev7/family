"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, Globe, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { DataService } from "@/lib/data-service";
import { HouseholdMember } from "@/lib/types";
import {
  Language,
  TRANSLATIONS,
  getSavedLanguage,
  saveLanguage,
} from "@/lib/translations";
import {
  MEMBER_AVATARS,
  FLAG_IMAGES,
  HERO_IMAGES,
} from "@/lib/assets";

const MEMBER_STYLES: Record<
  string,
  { bg: string; text: string; pillBg: string; border: string }
> = {
  "usr-amit": {
    bg: "bg-blue-600/10 hover:bg-blue-600/20",
    text: "text-blue-600 dark:text-blue-400",
    pillBg: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
    border: "border-blue-500/30",
  },
  "usr-ajay": {
    bg: "bg-pink-600/10 hover:bg-pink-600/20",
    text: "text-pink-600 dark:text-pink-400",
    pillBg: "bg-pink-500/20 text-pink-700 dark:text-pink-300",
    border: "border-pink-500/30",
  },
  "usr-chhotu": {
    bg: "bg-emerald-600/10 hover:bg-emerald-600/20",
    text: "text-emerald-600 dark:text-emerald-400",
    pillBg: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-500/30",
  },
};

const LANGUAGE_OPTIONS: Array<{ id: Language; label: string; fallbackFlag: string }> = [
  { id: "en", label: "English", fallbackFlag: "🇬🇧" },
  { id: "hi", label: "हिन्दी", fallbackFlag: "🇮🇳" },
  { id: "hinglish", label: "Hinglish", fallbackFlag: "💬" },
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
    <div className="min-h-screen bg-background flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 relative select-none">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        {/* 3D Hero House Art & Header */}
        <div className="text-center space-y-2 mb-4">
          <div className="relative mx-auto w-36 h-28 sm:w-44 sm:h-32 mb-1 flex items-center justify-center">
            <Image
              src={HERO_IMAGES.familyHouse}
              alt="FamilyFlow Smart Home"
              width={200}
              height={150}
              priority
              className="object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
            />
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
        <div className="rounded-[32px] border border-border bg-card p-6 sm:p-7 shadow-2xl space-y-5">
          {/* 1. Language Selection Pills with 3D Flags */}
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
                const flagSrc = FLAG_IMAGES[lang.id];

                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => handleSelectLanguage(lang.id)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                      isSelected
                        ? "bg-[#D4F835] text-black border-transparent shadow-md scale-102 font-extrabold"
                        : "bg-card hover:bg-secondary text-foreground border-border/80"
                    }`}
                  >
                    {flagSrc ? (
                      <div className="w-5 h-5 relative shrink-0">
                        <Image
                          src={flagSrc}
                          alt={lang.label}
                          width={20}
                          height={20}
                          className="rounded-full object-contain"
                        />
                      </div>
                    ) : (
                      <span>{lang.fallbackFlag}</span>
                    )}
                    <span>{lang.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Strictly 3 Members (Amit, Ajay, Chhotu) with 3D Pixar Avatars */}
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
                const avatarData = MEMBER_AVATARS[member.user_id];
                const style = MEMBER_STYLES[member.user_id] || {
                  bg: "bg-secondary/40",
                  text: "text-foreground",
                  pillBg: "bg-secondary text-foreground",
                  border: "border-border",
                };

                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setSelectedUserId(member.user_id)}
                    className={`relative flex flex-col items-center justify-between p-4 rounded-2xl transition-all duration-200 text-center cursor-pointer border ${
                      style.border
                    } ${
                      isSelected
                        ? "bg-secondary/90 border-[#D4F835] ring-3 ring-[#D4F835] ring-offset-2 ring-offset-card scale-103 shadow-xl"
                        : "bg-secondary/30 hover:bg-secondary/60 opacity-90 hover:opacity-100"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 h-5 w-5 rounded-full bg-[#D4F835] text-black flex items-center justify-center shadow-xs">
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </div>
                    )}

                    {/* 3D Character Avatar Image */}
                    <div className="relative w-18 h-18 my-1 flex items-center justify-center">
                      {avatarData?.image ? (
                        <Image
                          src={avatarData.image}
                          alt={member.display_name}
                          width={72}
                          height={72}
                          className="rounded-2xl object-cover drop-shadow-md hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground font-black text-xl flex items-center justify-center">
                          {member.display_name.slice(0, 1)}
                        </div>
                      )}
                      <span className="absolute -bottom-1 -right-1 text-xs bg-card rounded-full p-0.5 border border-border shadow-xs">
                        {avatarData?.emoji || "👤"}
                      </span>
                    </div>

                    <div className="mt-2 text-center w-full">
                      <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground block">
                        Member {idx + 1}
                      </span>
                      <h3 className="font-extrabold text-base tracking-tight leading-tight text-foreground mt-0.5">
                        {member.display_name}
                      </h3>
                      <div className="mt-1">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${style.pillBg}`}
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
              className="w-full py-3.5 px-6 rounded-full bg-[#0E0E10] text-white hover:bg-zinc-800 text-sm font-black transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              <span>
                {t.continueAs} {selectedMemberName}
              </span>
              <span className="text-[#D4F835] font-bold text-base">→</span>
            </button>
            <p className="text-[11px] text-center text-muted-foreground font-medium mt-2.5">
              Direct access • Your selection is saved permanently for this device
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
