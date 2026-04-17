-- Tabela de Dívidas e Empréstimos entre Amigos
CREATE TABLE IF NOT EXISTS public.friend_debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES auth.users(id) NOT NULL,
    lender_id UUID REFERENCES auth.users(id) NOT NULL, -- Quem emprestou (vai receber)
    debtor_id UUID REFERENCES auth.users(id) NOT NULL, -- Quem deve (vai pagar)
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    due_date DATE DEFAULT CURRENT_DATE
);

-- RLS para Friend Debts
ALTER TABLE public.friend_debts ENABLE ROW LEVEL SECURITY;

-- Permitir ver dívidas onde sou o credor ou o devedor
CREATE POLICY "Users can view their own friend debts" 
ON public.friend_debts FOR SELECT 
USING (auth.uid() = lender_id OR auth.uid() = debtor_id);

-- Permitir criar dívidas (qualquer um pode registrar, mas o devedor/credor deve ser um dos envolvidos)
CREATE POLICY "Users can create friend debts" 
ON public.friend_debts FOR INSERT 
WITH CHECK (auth.uid() = creator_id);

-- Permitir atualizar status (apenas os envolvidos)
CREATE POLICY "Users can update their friend debts" 
ON public.friend_debts FOR UPDATE 
USING (auth.uid() = lender_id OR auth.uid() = debtor_id);
