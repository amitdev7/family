export type Language = "en" | "hi" | "hinglish";

export const LANGUAGE_STORAGE_KEY = "familyflow_selected_language";

export interface Translations {
  welcome: string;
  whoAreYou: string;
  selectProfile: string;
  selectLanguage: string;
  continueAs: string;
  dashboard: string;
  expenses: string;
  budgets: string;
  categories: string;
  reports: string;
  addExpense: string;
  receiveMoney: string;
  netBalance: string;
  inflow: string;
  spent: string;
  moneyLeft: string;
  recentTxns: string;
  quickTransfer: string;
  activeLedger: string;
  greetingMorning: string;
  greetingAfternoon: string;
  greetingEvening: string;
  greetingNight: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    welcome: "Welcome to FamilyFlow",
    whoAreYou: "Who are you?",
    selectProfile: "Choose your profile to begin managing family expenses",
    selectLanguage: "Choose Language",
    continueAs: "Continue as",
    dashboard: "Dashboard",
    expenses: "Expenses Ledger",
    budgets: "Budget Planner",
    categories: "Categories",
    reports: "Reports & Analytics",
    addExpense: "+ Add Expense",
    receiveMoney: "+ Receive Money",
    netBalance: "Net Balance",
    inflow: "Received (Inflow)",
    spent: "Total Spent",
    moneyLeft: "Remaining Balance",
    recentTxns: "Recent Transactions",
    quickTransfer: "Quick Transfer",
    activeLedger: "Live Household Hub",
    greetingMorning: "Good morning",
    greetingAfternoon: "Good afternoon",
    greetingEvening: "Good evening",
    greetingNight: "Good night",
  },
  hi: {
    welcome: "फैमिली फ्लो में आपका स्वागत है",
    whoAreYou: "आप कौन हैं?",
    selectProfile: "घर के खर्चों का प्रबंधन शुरू करने के लिए अपनी प्रोफ़ाइल चुनें",
    selectLanguage: "भाषा चुनें",
    continueAs: "आगे बढ़ें बतौर",
    dashboard: "डैशबोर्ड",
    expenses: "खर्चों का हिसाब",
    budgets: "बजट योजना",
    categories: "श्रेणियां (Categories)",
    reports: "रिपोर्ट और विश्लेषण",
    addExpense: "+ खर्चा जोड़ें",
    receiveMoney: "+ पैसे प्राप्त करें",
    netBalance: "कुल बचत / बैलेंस",
    inflow: "प्राप्त राशि (Inflow)",
    spent: "कुल खर्चा",
    moneyLeft: "बची हुई राशि",
    recentTxns: "हाल के खर्चे",
    quickTransfer: "त्वरित ट्रांसफर",
    activeLedger: "लाइव फैमिली हब",
    greetingMorning: "शुभ प्रभात",
    greetingAfternoon: "नमस्कार",
    greetingEvening: "शुभ संध्या",
    greetingNight: "शुभ रात्रि",
  },
  hinglish: {
    welcome: "FamilyFlow mein Swagat Hai",
    whoAreYou: "Aap kaun hain?",
    selectProfile: "Ghar ka hisab shuru karne ke liye apna profile select karein",
    selectLanguage: "Language chunein",
    continueAs: "Aage badhein as",
    dashboard: "Dashboard",
    expenses: "Kharcha Diary",
    budgets: "Budget Planner",
    categories: "Categories",
    reports: "Reports & Analytics",
    addExpense: "+ Kharcha Add Karein",
    receiveMoney: "+ Paisa Aaya",
    netBalance: "Kul Balance",
    inflow: "Mila Hua Paisa",
    spent: "Total Kharcha",
    moneyLeft: "Bacha Hua Paisa",
    recentTxns: "Haal Ke Kharche",
    quickTransfer: "Quick Transfer",
    activeLedger: "Live Household Hub",
    greetingMorning: "Good morning",
    greetingAfternoon: "Good afternoon",
    greetingEvening: "Good evening",
    greetingNight: "Good night",
  },
};

export function getSavedLanguage(): Language {
  if (typeof window === "undefined") return "en";
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
    if (saved === "en" || saved === "hi" || saved === "hinglish") {
      return saved;
    }
  } catch {}
  return "en";
}

export function saveLanguage(lang: Language) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      window.dispatchEvent(new Event("household-language-changed"));
    } catch {}
  }
}
