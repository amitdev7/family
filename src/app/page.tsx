import Link from "next/link";
import { ArrowRight, Home, Shield, Users, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      {/* Navigation Header */}
      <header className="border-b border-border/80 bg-card/60 backdrop-blur-md px-6 py-4 flex items-center justify-between max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Home className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-foreground">Our Home</span>
            <p className="text-[11px] text-muted-foreground font-medium">Household Finance</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm" className="gap-1.5 font-semibold">
              <span>Open Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 md:py-20 flex flex-col items-center text-center justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-6">
          <Home className="h-3.5 w-3.5" />
          <span>Every expense. One home. Total clarity.</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground max-w-3xl leading-[1.15]">
          A private finance platform built for <span className="text-primary">Indian households</span>.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Log every grocery run, utility bill, and rent payment together. Share real-time visibility across family members in Indian Rupees (₹), with zero financial clutter.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Link href="/dashboard">
            <Button size="lg" className="w-full sm:w-auto gap-2 font-semibold text-base px-8 h-12 shadow-md">
              <span>Launch Shared Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/expenses">
            <Button variant="outline" size="lg" className="w-full sm:w-auto font-semibold text-base px-6 h-12">
              Browse Expenses
            </Button>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left w-full max-w-4xl">
          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-foreground text-base">Multi-User Family Sharing</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Give 3–5 family members individual accounts to log and edit expenses collaboratively.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
              <PieChart className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-foreground text-base">Monthly Budgets & Alerts</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Set household and category limits. Track remaining amounts and visual utilization.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-foreground text-base">Bank-Grade Isolation</h3>
            <p className="text-xs text-muted-foreground mt-1">
              PostgreSQL Row Level Security ensures no cross-household leaks and complete privacy.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/80 py-6 text-center text-xs text-muted-foreground">
        <p>Our Home © {new Date().getFullYear()} — Private Household Expense Management</p>
      </footer>
    </div>
  );
}

