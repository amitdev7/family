"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";

export function PromoCard() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="relative rounded-[28px] bg-[#D4F835] text-black p-6 shadow-sm border border-[#c2e424] flex flex-col justify-between overflow-hidden h-full min-h-[280px]">
        {/* Title */}
        <div>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            How to reduce <br />
            expenses by{" "}
            <span className="inline-block px-2.5 py-0.5 border-2 border-black rounded-full text-xl sm:text-2xl font-black">
              25%
            </span>{" "}
            ?
          </h3>
        </div>

        {/* Playful Piggy Bank & Coins Illustration */}
        <div className="relative my-2 flex items-center justify-center">
          <svg
            className="w-40 h-28 text-black"
            viewBox="0 0 200 140"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Stack of Coins */}
            <ellipse cx="45" cy="115" rx="25" ry="8" stroke="currentColor" strokeWidth="3" />
            <path d="M20 115v8c0 4.4 11.2 8 25 8s25-3.6 25-8v-8" stroke="currentColor" strokeWidth="3" />
            <path d="M20 123v8c0 4.4 11.2 8 25 8s25-3.6 25-8v-8" stroke="currentColor" strokeWidth="3" />

            <ellipse cx="48" cy="95" rx="23" ry="7" stroke="currentColor" strokeWidth="3" />
            <path d="M25 95v8c0 3.9 10.3 7 23 7s23-3.1 23-7v-8" stroke="currentColor" strokeWidth="3" />

            {/* Currency note */}
            <rect x="75" y="105" width="60" height="25" rx="3" stroke="currentColor" strokeWidth="2.5" />
            <circle cx="105" cy="117.5" r="5" stroke="currentColor" strokeWidth="2" />

            {/* Piggy Bank */}
            <path
              d="M110 50c-15 0-30 10-30 30 0 18 14 30 35 30h20c15 0 25-10 25-25 0-15-10-25-25-25"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Snout */}
            <ellipse cx="80" cy="78" rx="8" ry="12" stroke="currentColor" strokeWidth="3" fill="#D4F835" />
            <circle cx="78" cy="76" r="1.5" fill="currentColor" />
            <circle cx="82" cy="76" r="1.5" fill="currentColor" />

            {/* Eye */}
            <circle cx="100" cy="65" r="3" fill="currentColor" />

            {/* Ears */}
            <path d="M102 45c-2-8 6-12 12-8s2 12-4 12" stroke="currentColor" strokeWidth="3" fill="#D4F835" />

            {/* Tail */}
            <path d="M160 80c5-5 10 0 5 5s-8-2-3-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />

            {/* Legs */}
            <rect x="105" y="108" width="8" height="12" rx="3" stroke="currentColor" strokeWidth="3" fill="#D4F835" />
            <rect x="135" y="108" width="8" height="12" rx="3" stroke="currentColor" strokeWidth="3" fill="#D4F835" />
          </svg>
        </div>

        {/* White Rounded Action Button */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full py-3.5 px-6 rounded-full bg-white hover:bg-neutral-100 active:scale-98 text-black text-xs font-black tracking-wide shadow-sm transition-all cursor-pointer text-center"
        >
          Learn more
        </button>
      </div>

      {/* Tip Dialog */}
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="How to cut household expenses by 25%"
          description="Practical rules formulated for Indian households to optimize monthly cash flow."
          maxWidth="md"
        >
          <div className="space-y-3 text-sm text-foreground py-2">
            <div className="p-3.5 rounded-2xl bg-muted/60 border border-border">
              <p className="font-bold">1. Audit Recurring Subscriptions</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Check broadband, OTT platforms, and memberships in the Recurring Bills tab. Canceling unused services saves ₹2,000–₹5,000 monthly.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-muted/60 border border-border">
              <p className="font-bold">2. Pre-budget Dining & Grocery runs</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Ordering via quick-commerce daily incurs delivery markups. Planning a weekly DMart run cuts food bills by 15-20%.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-muted/60 border border-border">
              <p className="font-bold">3. Set Up Category Caps</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configure monthly limits under the Budgets tab to receive real-time warnings before your family exceeds 80% utilization.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
