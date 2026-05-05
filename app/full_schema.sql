-- 1. Tabela de Perfis (Extensão do auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    initial_balance DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles" ON public.profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Trigger para criar perfil automaticamente no signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, username)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', lower(new.raw_user_meta_data->>'full_name'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. Tabela de Transações
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
    category TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'predicted', 'pending', 'overdue')),
    recurrence_id UUID, -- Adicionado via alter table depois ou aqui
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own transactions" ON public.transactions
    FOR ALL USING (auth.uid() = user_id);


-- 3. Tabela de Recorrências
CREATE TABLE IF NOT EXISTS public.recurrences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    category TEXT,
    type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
    frequency TEXT DEFAULT 'monthly',
    day_of_month INTEGER,
    next_due_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.recurrences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own recurrences" ON public.recurrences
    FOR ALL USING (auth.uid() = user_id);

-- Vincular transações a recorrências
ALTER TABLE public.transactions 
    ADD CONSTRAINT fk_transactions_recurrence 
    FOREIGN KEY (recurrence_id) REFERENCES public.recurrences(id) ON DELETE SET NULL;


-- 4. Tabela de Metas (Goals)
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    target_amount DECIMAL(12,2) NOT NULL,
    current_amount DECIMAL(12,2) DEFAULT 0,
    icon TEXT DEFAULT '🎯',
    category TEXT DEFAULT 'Investimentos',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own goals" ON public.goals
    FOR ALL USING (auth.uid() = user_id);


-- 5. Tabela de Cartões de Crédito
CREATE TABLE IF NOT EXISTS public.credit_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    bank TEXT,
    limit_amount DECIMAL(12,2) DEFAULT 0,
    current_balance DECIMAL(12,2) DEFAULT 0,
    last_four TEXT,
    closing_day INTEGER DEFAULT 10,
    due_day INTEGER DEFAULT 20,
    color TEXT DEFAULT '#10b981',
    type TEXT CHECK (type IN ('credit', 'debit')) DEFAULT 'credit',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own cards" ON public.credit_cards
    FOR ALL USING (auth.uid() = user_id);


-- 6. Tabela de Parcelamentos (Installments)
CREATE TABLE IF NOT EXISTS public.installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    description TEXT NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    installment_amount DECIMAL(12,2) NOT NULL,
    total_installments INTEGER NOT NULL,
    current_installment INTEGER DEFAULT 1,
    card_id UUID REFERENCES public.credit_cards(id) ON DELETE CASCADE,
    category TEXT,
    start_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own installments" ON public.installments
    FOR ALL USING (auth.uid() = user_id);


-- 7. Amizades e Dívidas (Social)
CREATE TABLE IF NOT EXISTS public.friend_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES auth.users(id) NOT NULL,
    receiver_id UUID REFERENCES auth.users(id) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(sender_id, receiver_id)
);

CREATE TABLE IF NOT EXISTS public.friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id_1 UUID REFERENCES auth.users(id) NOT NULL,
    user_id_2 UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id_1, user_id_2)
);

CREATE TABLE IF NOT EXISTS public.friend_debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES auth.users(id) NOT NULL,
    lender_id UUID REFERENCES auth.users(id) NOT NULL,
    debtor_id UUID REFERENCES auth.users(id) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
    due_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_debts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view requests" ON public.friend_requests FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users create requests" ON public.friend_requests FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users update requests" ON public.friend_requests FOR UPDATE USING (auth.uid() = receiver_id);
CREATE POLICY "Users delete requests" ON public.friend_requests FOR DELETE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users view friendships" ON public.friendships FOR SELECT USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);
CREATE POLICY "Users create friendships" ON public.friendships FOR INSERT WITH CHECK (auth.uid() = user_id_1 OR auth.uid() = user_id_2);
CREATE POLICY "Users delete friendships" ON public.friendships FOR DELETE USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

CREATE POLICY "Users view friend debts" ON public.friend_debts FOR SELECT USING (auth.uid() = lender_id OR auth.uid() = debtor_id);
CREATE POLICY "Users create friend debts" ON public.friend_debts FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users update friend debts" ON public.friend_debts FOR UPDATE USING (auth.uid() = lender_id OR auth.uid() = debtor_id);
