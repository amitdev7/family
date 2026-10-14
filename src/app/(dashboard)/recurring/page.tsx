"use client";

import React, { useState } from "react";
import {
  Mic,
  Calendar,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Modal } from "@/components/ui/modal";
import { formatINR } from "@/lib/formatters";

// Clean slate: recurring subscriptions array starts empty
const DEFAULT_BILL_ITEMS: Array<{
  id: string;
  name: string;
  subtitle: string;
  amount: number;
  nextDue: string;
  status: string;
  icon: any;
  iconBg: string;
}> = [];

export default function RecurringPage() {
  const [bills, setBills] = useState(DEFAULT_BILL_ITEMS);
  const [allActive, setAllActive] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form State
  const [billName, setBillName] = useState("");
  const [billAmount, setBillAmount] = useState("");
  const [billSubtitle, setBillSubtitle] = useState("Utility • Monthly");

  const handleRecordNow = (billName?: string) => {
    const target = billName || "Airtel Xstream Fiber";
    setToastMsg(`Recorded auto-payment for ${target} successfully!`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleToggleActive = (id: string) => {
    setBills((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, status: b.status === "Active" ? "Paused" : "Active" } : b
      )
    );
  };

  const handleAddBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billName.trim() || !billAmount) return;

    const newBill = {
      id: "rec-" + Date.now(),
      name: billName.trim(),
      subtitle: billSubtitle,
      amount: parseFloat(billAmount),
      nextDue: "Next due in 30 days",
      status: "Active",
      icon: Zap,
      iconBg: "bg-[#0E0E10] text-[#D4F835]",
    };

    setBills((prev) => [newBill, ...prev]);
    setIsAddOpen(false);
    setBillName("");
    setBillAmount("");
    setToastMsg(`Added ${newBill.name} to recurring bills!`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <AppLayout title="Recurring Bills">
      <div className="max-w-xl mx-auto space-y-6 select-none">
        {/* Top Header matching Figma image_20261014_111556.jpg */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#D4F835] text-black flex items-center justify-center font-bold shadow-xs">
              <Calendar className="h-5 w-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              Recurring Bills
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              All active
            </span>
            <button
              type="button"
              onClick={() => setAllActive(!allActive)}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center ${allActive ? "bg-[#D4F835]" : "bg-zinc-300 dark:bg-zinc-700"
                }`}
            >
              <div
                className={`h-5 w-5 rounded-full bg-black shadow-xs transition-transform ${allActive ? "translate-x-5" : "translate-x-0"
                  }`}
              />
            </button>
          </div>
        </div>

        {/* Dynamic Status Capsule Pill */}
        <div className="py-2.5 px-4 rounded-full bg-[#0E0E10] text-white text-xs font-semibold text-center shadow-xs">
          {bills.length} Total • {bills.filter((b) => b.status === "Active").length} Active • {bills.filter((b) => b.status === "Paused").length} Paused
        </div>

        {/* Toast Feedback */}
        {toastMsg && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold text-center animate-in fade-in flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Bill Cards or Clean Zero State */}
        {bills.length === 0 ? (
          <div className="rounded-[28px] bg-card border border-border/80 p-8 sm:p-10 text-center space-y-3">
            <div className="h-14 w-14 rounded-2xl bg-[#D4F835]/15 text-black dark:text-[#D4F835] flex items-center justify-center mx-auto text-2xl font-bold">
              ⚡
            </div>
            <h3 className="font-extrabold text-base text-foreground">No Recurring Subscriptions Yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Add your broadband, OTT streaming, house rent, or electricity bills to track monthly due dates automatically.
            </p>
            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="px-5 py-2.5 rounded-full bg-[#D4F835] text-black font-extrabold text-xs shadow-md cursor-pointer hover:bg-[#c6ea27] transition-all"
            >
              + Add First Recurring Bill
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bills.map((bill) => {
              const Icon = bill.icon;
              const isActive = bill.status === "Active";

              return (
                <div
                  key={bill.id}
                  className="rounded-[28px] bg-card border border-border/80 p-5 shadow-xs space-y-4 hover:border-border transition-colors"
                >
                  {/* Top Info Row */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold shadow-xs ${bill.iconBg}`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>

                      <div>
                        <h3 className="font-extrabold text-base text-foreground leading-snug">
                          {bill.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {bill.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-lg text-foreground">
                        {formatINR(bill.amount)}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Status Row */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/60">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{bill.nextDue}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleActive(bill.id)}
                      className={`px-3 py-0.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${isActive
                        ? "bg-[#D4F835] text-black shadow-2xs"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                        }`}
                    >
                      {bill.status}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Record Now Black Button with Microphone icon matching Figma */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={() => handleRecordNow()}
            className="w-full py-3.5 rounded-full bg-[#0E0E10] text-white hover:bg-zinc-800 font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Mic className="h-4 w-4 text-[#D4F835]" />
            <span>Record Now</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="w-full py-2.5 rounded-full border border-border text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
          >
            + Add New Recurring Bill
          </button>
        </div>
      </div>

      {/* Add Recurring Bill Modal */}
      {isAddOpen && (
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          maxWidth="sm"
          className="p-6 rounded-[28px] bg-card border-0 shadow-2xl"
        >
          <h3 className="text-lg font-bold text-foreground mb-4">
            Add Recurring Bill
          </h3>
          <form onSubmit={handleAddBill} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Service / Bill Name
              </label>
              <input
                type="text"
                value={billName}
                onChange={(e) => setBillName(e.target.value)}
                placeholder="e.g. Spotify, Electricity, Gym"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-secondary border border-border text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Amount (₹)
              </label>
              <input
                type="number"
                value={billAmount}
                onChange={(e) => setBillAmount(e.target.value)}
                placeholder="e.g. 999"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-secondary border border-border text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Billing Cycle
              </label>
              <input
                type="text"
                value={billSubtitle}
                onChange={(e) => setBillSubtitle(e.target.value)}
                placeholder="e.g. Broadband • Monthly"
                className="w-full px-3.5 py-2.5 rounded-xl bg-secondary border border-border text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4F835]"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="flex-1 py-2.5 rounded-full border border-border text-xs font-bold text-foreground hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-full bg-[#D4F835] hover:bg-[#c5ea28] text-black text-xs font-bold shadow-xs cursor-pointer"
              >
                Add Bill
              </button>
            </div>
          </form>
        </Modal>
      )}
    </AppLayout>
  );
}

