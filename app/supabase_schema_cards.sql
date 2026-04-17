-- Tabela de Cartões de Crédito
CREATE TABLE IF NOT EXISTS credit_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bank TEXT,
  limit_amount DECIMAL(12,2) DEFAULT 0,
  current_balance DECIMAL(12,2) DEFAULT 0,
  last_four TEXT,
  closing_day INTEGER DEFAULT 10,
  due_day INTEGER DEFAULT 20,
  color TEXT DEFAULT '#10b981',
  type TEXT CHECK (type IN ('credit', 'debit')) DEFAULT 'credit',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Tabela de Parcelamentos
CREATE TABLE IF NOT EXISTS installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  installment_amount DECIMAL(12,2) NOT NULL,
  total_installments INTEGER NOT NULL,
  current_installment INTEGER DEFAULT 1,
  card_id UUID REFERENCES credit_cards(id) ON DELETE CASCADE,
  category TEXT,
  start_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE installments ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança
DROP POLICY IF EXISTS "Users can manage their own cards" ON credit_cards;
CREATE POLICY "Users can manage their own cards" ON credit_cards 
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own installments" ON installments;
CREATE POLICY "Users can manage their own installments" ON installments 
    FOR ALL USING (auth.uid() = user_id);
