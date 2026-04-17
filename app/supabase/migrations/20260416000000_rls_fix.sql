-- Criação da tabela de recorrências
CREATE TABLE IF NOT EXISTS recurrences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  category TEXT,
  type TEXT CHECK (type IN ('income', 'expense')),
  frequency TEXT DEFAULT 'monthly',
  day_of_month INTEGER,
  next_due_date DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Adição da coluna na tabela de transações
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS recurrence_id UUID REFERENCES recurrences(id) ON DELETE SET NULL;

-- Políticas de RLS
ALTER TABLE recurrences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own recurrences" ON recurrences;
CREATE POLICY "Users can manage their own recurrences" ON recurrences FOR ALL USING (auth.uid() = user_id);
