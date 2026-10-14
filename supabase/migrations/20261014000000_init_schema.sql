-- Our Home: Complete Family Expense & Inflow Tracker Schema

CREATE TABLE IF NOT EXISTS households (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS household_members (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  relationship TEXT,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'member',
  color TEXT NOT NULL DEFAULT '#D4F835',
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🏷️',
  color TEXT NOT NULL DEFAULT '#3b82f6',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  amount NUMERIC(12, 2) NOT NULL,
  description TEXT NOT NULL,
  expense_date DATE NOT NULL,
  paid_by_user_id TEXT NOT NULL,
  created_by_user_id TEXT NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'Cash',
  notes TEXT,
  receipt_path TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  period TEXT NOT NULL DEFAULT 'monthly',
  period_start DATE NOT NULL,
  created_by_user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS received_money (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  from_member_id TEXT,
  from_member_name TEXT NOT NULL,
  relationship TEXT,
  to_member_id TEXT,
  to_member_name TEXT,
  amount NUMERIC(12, 2) NOT NULL,
  date DATE NOT NULL,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  notes TEXT,
  payment_method TEXT NOT NULL DEFAULT 'Cash',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recurring_expenses (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  amount NUMERIC(12, 2) NOT NULL,
  description TEXT NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'monthly',
  start_date DATE NOT NULL,
  next_occurrence DATE NOT NULL,
  paid_by_user_id TEXT NOT NULL,
  created_by_user_id TEXT NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'Cash',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  actor_user_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  change_summary JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE received_money ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Permissive public policies for household authenticated access
CREATE POLICY IF NOT EXISTS "Allow all for authenticated/anon household" ON households FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow all for authenticated/anon members" ON household_members FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow all for authenticated/anon categories" ON categories FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow all for authenticated/anon expenses" ON expenses FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow all for authenticated/anon budgets" ON budgets FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow all for authenticated/anon received_money" ON received_money FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow all for authenticated/anon recurring_expenses" ON recurring_expenses FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow all for authenticated/anon activity_logs" ON activity_logs FOR ALL USING (true);
