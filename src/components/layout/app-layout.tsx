"use client";

import React from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { MobileNav } from "./mobile-nav";

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  onAddExpenseClick?: () => void;
}

export function AppLayout({
  children,
  title,
  subtitle,
  onAddExpenseClick,
}: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        <Header
          title={title}
          subtitle={subtitle}
          onAddExpenseClick={onAddExpenseClick}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
      <MobileNav onAddExpenseClick={onAddExpenseClick} />
    </div>
  );
}
