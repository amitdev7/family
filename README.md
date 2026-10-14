# 🏠 Family Expense & Budget Management System

A multi-member household personal finance, budget tracking, and shared expense management web application tailored for Indian families (INR `₹`), built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**.

Deployed live on Vercel: **[family-gray-rho.vercel.app](https://family-gray-rho.vercel.app/dashboard)**

---

## 🤖 Comprehensive AI & Architecture Documentation

For complete, exhaustive technical architecture, entity models, responsive design breakdown, and data schemas designed for AI assistants and developers, see:
👉 **[AI_SYSTEM_OVERVIEW.md](./AI_SYSTEM_OVERVIEW.md)**

---

## ✨ Key Features

- **Direct Dashboard Access**: Opens directly to `/dashboard` with key monthly indicators, spending curves, category breakdowns, and upcoming bills.
- **"Who Are You?" Onboarding & Identity Engine**:
  - Automatically prompts new visitors to choose their family profile or add a new member.
  - Supports family roles (Father, Mother, Son, Daughter, Grandfather, Grandmother, Partner/Spouse, etc.).
  - Generates a persistent unique User ID (`usr_<timestamp>_<random>`) stored on the device.
  - Allows switching active users anytime from the Header, Sidebar, or Settings.
- **Universal Multi-Device Compatibility**:
  - **Desktop & Laptop**: Persistent sidebar, 4-column metric grids, interactive charts.
  - **Tablet**: Flexible 2-to-3 column layouts.
  - **Mobile**: Sticky bottom navigation bar with elevated center "+" button for fast one-tap expense recording, scrollable tables, and mobile-optimized modal dialogs.
- **Ledger & Expense Manager**:
  - Real-time search, multi-criteria filtering (Category, Member, Payment Method, Date Range).
  - Sorting and pagination (15/page).
  - CSV export.
  - Add, edit, delete with confirmation modal, and receipt attachment support.
- **Budget Tracking**: Category-specific budgets and overall monthly limits with real-time percentage utilization and color-coded alert badges (Safe, Warning, Exceeded).
- **Recurring Bills**: Subscriptions, rent, utility bills, school fees with next due date countdown and auto-convert to expense.
- **Financial Analytics & Reports**: Member-wise expenditure share (who spends how much), monthly comparison charts, and category heatmaps.
- **Dual-Mode Persistence**:
  - **Offline / Local Demo Mode**: Instant zero-config demo with `localStorage` persistence and rich seed data for the Sharma family.
  - **Cloud Mode**: Connects directly to Supabase PostgreSQL database with Row Level Security (RLS) and Auth.
- **Indian Financial Standards**: Full INR (`₹`) formatting with Indian comma placement (`₹1,25,000` / `₹1.5L`).

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. It will immediately redirect to `/dashboard`.

### 3. Build for Production
```bash
npm run build
```

---

## 📁 Project Structure

```
src/
├── app/                  # Next.js 15 App Router pages & layouts
│   ├── (auth)/           # Login, Signup, Password Reset pages
│   ├── (dashboard)/      # Dashboard, Expenses, Budgets, Categories, Recurring, Reports, Settings
│   ├── layout.tsx        # Root HTML layout with ThemeProvider
│   └── page.tsx          # Root redirect -> /dashboard
├── components/
│   ├── dashboard/        # Category doughnut chart, spending trend area chart
│   ├── expenses/         # Expense modal, details dialog, delete confirmation
│   ├── layout/           # AppLayout, Header, Sidebar, MobileNav, WhoAreYouModal
│   └── ui/               # Reusable atom-level UI components (Button, Card, Modal, Table, etc.)
└── lib/
    ├── calculations/     # Financial calculation & aggregation helpers
    ├── supabase/         # Supabase client & middleware
    ├── validations/      # Zod validation schemas
    ├── data-service.ts   # Central dual-mode data service (Supabase + LocalStorage)
    ├── demo-data.ts      # Default seed dataset
    ├── formatters.ts     # Currency (₹ INR), compact numbers & date formatters
    └── types/            # TypeScript entity types & interfaces
```

---

## 📄 License
MIT

