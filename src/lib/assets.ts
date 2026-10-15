export const MEMBER_AVATARS: Record<string, { image: string; fallbackInitial: string; name: string; role: string; emoji: string }> = {
  "usr-amit": {
    image: "/images/avatars/avatar-amit.png",
    fallbackInitial: "A",
    name: "Amit",
    role: "Admin",
    emoji: "👑",
  },
  "usr-ajay": {
    image: "/images/avatars/avatar-ajay.png",
    fallbackInitial: "A",
    name: "Ajay",
    role: "Member",
    emoji: "🌸",
  },
  "usr-chhotu": {
    image: "/images/avatars/avatar-chhotu.png",
    fallbackInitial: "C",
    name: "Chhotu",
    role: "Member",
    emoji: "🧸",
  },
};

export const CATEGORY_IMAGES: Record<string, string> = {
  "cat-groceries": "/images/categories/cat-groceries.png",
  "cat-rent": "/images/categories/cat-housing.png",
  "cat-housing": "/images/categories/cat-housing.png",
  "cat-utilities": "/images/categories/cat-utilities.png",
  "cat-dining": "/images/categories/cat-dining.png",
  "cat-transport": "/images/categories/cat-transport.png",
  "cat-entertainment": "/images/categories/cat-entertainment.png",
  "cat-health": "/images/categories/cat-healthcare.png",
  "cat-healthcare": "/images/categories/cat-healthcare.png",
  "cat-education": "/images/categories/cat-education.png",
};

export const FLAG_IMAGES: Record<string, string> = {
  en: "/images/flags/lang-en.png",
  hi: "/images/flags/lang-hi.png",
  hinglish: "/images/flags/lang-hinglish.png",
};

export const FEATURE_IMAGES = {
  transferBeam: "/images/features/transfer-beam.png",
  securityShield: "/images/features/security-shield.png",
  fuelGauge: "/images/features/fuel-gauge.png",
};

export const EMPTY_STATE_IMAGES = {
  expenses: "/images/empty/empty-expenses.png",
  budgets: "/images/empty/empty-budgets.png",
  inflow: "/images/empty/empty-inflow.png",
};

export const HERO_IMAGES = {
  familyHouse: "/images/hero/hero-family-house.png",
};
