"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, Globe, Sparkles, ArrowRight } from "lucide-react";
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

const LANGUAGE_OPTIONS: Array<{ id: Language; label: string }> = [
  { id: "en", label: "English" },
  { id: "hi", label: "हिन्दी" },
  { id: "hinglish", label: "Hinglish" },
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
      <div className="min-h-screen bg-[#E7DDF5] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-[#C5A3FF] border-t-transparent animate-spin" />
      </div>
    );
  }

  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const selectedMemberName =
    members.find((m) => m.user_id === selectedUserId)?.display_name || "Amit";

  return (
    <div className="min-h-screen bg-[#E7DDF5] p-2 sm:p-4 md:p-6 flex flex-col justify-center select-none font-sans antialiased">
      {/* Figma Make Canvas Shell */}
      <div className="w-full max-w-2xl mx-auto bg-[#F5F5F4] sm:rounded-[32px] sm:border sm:border-white p-5 sm:p-8 sm:shadow-[0_22px_70px_rgba(0,0,0,.08)] relative">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        {/* 3D Hero House Art & Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-xl bg-[#2D2D2D] flex items-center justify-center shadow-md p-1 border border-white/10">
              <Image
                src="/logo.svg"
                alt="Family Logo"
                width={28}
                height={28}
                priority
                className="object-contain"
              />
            </div>
            <span className="text-xl font-black tracking-tight text-[#2D2D2D]">
              Family
            </span>
          </div>

          <div className="relative mx-auto w-32 h-24 sm:w-40 sm:h-28 mb-1 flex items-center justify-center">
            <Image
              src={HERO_IMAGES.familyHouse}
              alt="Family Smart Home"
              width={180}
              height={135}
              priority
              className="object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEE5FF] text-[#6E4CA8] text-xs font-black border border-[#C5A3FF]/40 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-[#C5A3FF]" />
            <span>{t.welcome}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#2D2D2D]">
            {t.whoAreYou}
          </h1>
          <p className="text-xs sm:text-sm text-[#71717A] font-medium max-w-sm mx-auto">
            {t.selectProfile}
          </p>
        </div>

        {/* Main Selection Bento Card */}
        <div className="rounded-[26px] border border-[#ECECE8] bg-white p-5 sm:p-6 shadow-sm space-y-5">
          {/* 1. Language Selection Pills with 3D Flags */}
          <div className="space-y-2 p-3 rounded-2xl bg-[#F9F9F8] border border-[#ECECE8]">
            <div className="flex items-center justify-between text-xs font-bold text-[#71717A]">
              <span className="flex items-center gap-1.5 text-[#2D2D2D] font-extrabold">
                <Globe className="h-3.5 w-3.5 text-[#C5A3FF]" />
                <span>{t.selectLanguage}</span>
              </span>
              <span className="text-[11px] font-bold">Step 1 of 2</span>
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
                    className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer border ${isSelected
                      ? "bg-[#2D2D2D] text-white border-transparent shadow-md scale-102 font-extrabold"
                      : "bg-white hover:bg-[#F4F4F2] text-[#71717A] hover:text-[#2D2D2D] border-[#ECECE8]"
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
                      <span className="text-[10px] uppercase font-bold text-[#71717A]">{lang.id}</span>
                    )}
                    <span>{lang.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Strictly 3 Members (Amit, Ajay, Chhotu) with 3D Pixar Avatars */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#71717A] px-1">
              <span className="text-[#2D2D2D] font-extrabold">
                Select Your Member Profile
              </span>
              <span className="text-[11px] font-bold">Step 2 of 2</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {members.map((member, idx) => {
                const isSelected = member.user_id === selectedUserId;
                const avatarData = MEMBER_AVATARS[member.user_id];
                const style = MEMBER_STYLES[member.user_id] || {
                  bg: "bg-slate-50",
                  text: "text-slate-900",
                  pillBg: "bg-slate-200 text-slate-900",
                  border: "border-slate-200",
                };

                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setSelectedUserId(member.user_id)}
                    className={`relative flex flex-col items-center justify-between p-4 rounded-2xl transition-all duration-200 text-center cursor-pointer border ${isSelected
                      ? "bg-[#F7F2FF] border-[#C5A3FF] ring-3 ring-[#C5A3FF]/40 scale-103 shadow-md"
                      : "bg-white border-[#ECECE8] hover:border-[#D4D4D8] hover:bg-[#F9F9F8] opacity-90 hover:opacity-100"
                      }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 h-5 w-5 rounded-full bg-[#C5A3FF] text-[#2D2D2D] flex items-center justify-center shadow-xs">
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </div>
                    )}

                    {/* 3D Character Avatar Image */}
                    <div className="relative w-16 h-16 my-1 flex items-center justify-center">
                      {avatarData?.image ? (
                        <Image
                          src={avatarData.image}
                          alt={member.display_name}
                          width={64}
                          height={64}
                          className="rounded-2xl object-cover drop-shadow-md hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-[#EEE5FF] text-[#6E4CA8] font-black text-xl flex items-center justify-center">
                          {member.display_name.slice(0, 1)}
                        </div>
                      )}
                      {avatarData?.roleBadge && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-[#ECECE8] p-0.5 shadow-xs flex items-center justify-center">
                          <Image
                            src={avatarData.roleBadge}
                            alt="Role Badge"
                            width={16}
                            height={16}
                            className="object-contain"
                          />
                        </div>
                      )}
                    </div>

                    <div className="mt-2 text-center w-full">
                      <span className="text-[10px] uppercase font-black tracking-wider text-[#71717A] block">
                        Member {idx + 1}
                      </span>
                      <h3 className="font-extrabold text-base tracking-tight leading-tight text-[#2D2D2D] mt-0.5">
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
              className="w-full py-3.5 px-6 rounded-full bg-[#2D2D2D] text-white font-bold text-sm shadow-md hover:bg-[#1a1a1a] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>
                {t.continueAs} {selectedMemberName}
              </span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
            <p className="text-[11px] text-center text-[#71717A] font-medium mt-2.5">
              Direct access • Your selection is saved permanently for this device
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

