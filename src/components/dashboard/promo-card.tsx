"use client";

import React, { useState } from "react";
import { X, Sparkles, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";

const SAVING_TIPS = [
  {
    title: "Batch Grocery Shopping",
    desc: "Order bulk staples once a month via DMart or Zepto wholesale to save up to 18% on pantry essentials.",
  },
  {
    title: "Streamline Family Subscriptions",
    desc: "Switch individual streaming plans to Family Plans (Netflix, Spotify, YouTube Premium) to cut recurring media bills in half.",
  },
  {
    title: "The 48-Hour Cart Rule",
    desc: "For any impulse non-essential purchase above ₹2,000, wait 48 hours. 65% of impulse desires fade naturally.",
  },
  {
    title: "Smart Utility Scheduling",
    desc: "Run washing machines and geysers during off-peak hours and enable smart plugs to curb phantom electricity draw.",
  },
];

export function PromoCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="rounded-[28px] bg-[#E2F937] text-black p-6 shadow-xs relative overflow-hidden flex flex-col justify-between h-full select-none">
        {/* Headline matching Figma image_20261014_111154.jpg */}
        <div className="relative z-10">
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            How to reduce
            <br />
            expenses
            <br />
            <span className="inline-flex items-center gap-1.5 mt-1">
              <span>by</span>
              <span className="inline-block px-3 py-0.5 rounded-full border-2 border-black font-black text-xl sm:text-2xl">
                25%
              </span>
              <span>?</span>
            </span>
          </h3>
        </div>

        {/* Hand-drawn piggy bank & coins vector illustration */}
        <div className="relative my-4 flex items-center justify-end">
          <svg
            viewBox="0 0 160 110"
            className="w-40 h-28 overflow-visible drop-shadow-xs"
            fill="none"
          >
            {/* Banknote bills underneath */}
            <rect
              x="55"
              y="78"
              width="95"
              height="24"
              rx="4"
              fill="#c5ea28"
              stroke="#000"
              strokeWidth="2.5"
            />
            <line x1="65" y1="90" x2="140" y2="90" stroke="#000" strokeWidth="2" strokeDasharray="3 3" />

            {/* Coin stack */}
            <ellipse cx="36" cy="74" rx="28" ry="10" fill="#c5ea28" stroke="#000" strokeWidth="2.5" />
            <ellipse cx="36" cy="62" rx="28" ry="10" fill="#c5ea28" stroke="#000" strokeWidth="2.5" />
            <ellipse cx="36" cy="50" rx="28" ry="10" fill="#c5ea28" stroke="#000" strokeWidth="2.5" />
            <ellipse cx="36" cy="38" rx="28" ry="10" fill="#E2F937" stroke="#000" strokeWidth="2.5" />

            {/* Piggy bank body */}
            <ellipse
              cx="110"
              cy="52"
              rx="38"
              ry="30"
              fill="#E2F937"
              stroke="#000"
              strokeWidth="3"
            />
            {/* Piggy snout */}
            <ellipse
              cx="144"
              cy="55"
              rx="10"
              ry="14"
              fill="#E2F937"
              stroke="#000"
              strokeWidth="3"
            />
            <circle cx="142" cy="52" r="2.2" fill="#000" />
            <circle cx="142" cy="58" r="2.2" fill="#000" />

            {/* Piggy eye */}
            <circle cx="126" cy="42" r="3.5" fill="#000" />

            {/* Piggy ear */}
            <path
              d="M 112 24 C 114 16, 126 18, 124 28 Z"
              fill="#E2F937"
              stroke="#000"
              strokeWidth="2.5"
            />

            {/* Piggy feet */}
            <rect x="85" y="76" width="10" height="14" rx="3" fill="#000" />
            <rect x="122" y="76" width="10" height="14" rx="3" fill="#000" />

            {/* Coin slot */}
            <line x1="98" y1="26" x2="114" y2="26" stroke="#000" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Learn More Button matching Figma */}
        <div className="relative z-10">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full py-3 rounded-full bg-white text-black hover:bg-zinc-100 font-extrabold text-sm transition-colors text-center shadow-xs cursor-pointer"
          >
            Learn more
          </button>
        </div>
      </div>

      {/* Educational Tips Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          maxWidth="md"
          className="p-6 sm:p-8 rounded-[32px] bg-card border-0 shadow-2xl"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#E2F937] text-black flex items-center justify-center font-bold">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-xl text-foreground">
                  Reduce Expenses by 25%
                </h3>
                <p className="text-xs text-muted-foreground">
                  Proven household savings blueprint
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            {SAVING_TIPS.map((tip, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-secondary/50 border border-border/80 flex items-start gap-3.5"
              >
                <div className="mt-0.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">
                    {tip.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {tip.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="w-full py-3 rounded-full bg-[#0E0E10] text-white hover:bg-zinc-800 font-bold text-sm transition-colors cursor-pointer"
            >
              Got it, let&apos;s apply this!
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

