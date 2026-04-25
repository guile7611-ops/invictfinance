-- 1. Políticas da tabela Profiles
-- Permite que qualquer usuário autenticado leia os perfis (necessário para buscar amigos pelo nome)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
CREATE POLICY "Anyone can view profiles" 
ON public.profiles FOR SELECT 
USING (auth.role() = 'authenticated');

-- 2. Tabela de Solicitações de Amizade (Friend Requests)
CREATE TABLE IF NOT EXISTS public.friend_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES auth.users(id) NOT NULL,
    receiver_id UUID REFERENCES auth.users(id) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(sender_id, receiver_id) -- Previne duplicação de solicitações na mesma direção
);

ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver as solicitações que enviaram ou receberam
DROP POLICY IF EXISTS "Users can view their friend requests" ON public.friend_requests;
CREATE POLICY "Users can view their friend requests" 
ON public.friend_requests FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Usuários podem enviar solicitações (sendo o sender_id)
DROP POLICY IF EXISTS "Users can create friend requests" ON public.friend_requests;
CREATE POLICY "Users can create friend requests" 
ON public.friend_requests FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

-- Usuários podem atualizar as solicitações que receberam (aceitar)
DROP POLICY IF EXISTS "Users can update their received friend requests" ON public.friend_requests;
CREATE POLICY "Users can update their received friend requests" 
ON public.friend_requests FOR UPDATE 
USING (auth.uid() = receiver_id);

-- Usuários podem deletar as solicitações (cancelar as que enviaram ou recusar as que receberam)
DROP POLICY IF EXISTS "Users can delete friend requests" ON public.friend_requests;
CREATE POLICY "Users can delete friend requests" 
ON public.friend_requests FOR DELETE 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- 3. Tabela de Amizades Confirmadas (Friendships)
CREATE TABLE IF NOT EXISTS public.friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id_1 UUID REFERENCES auth.users(id) NOT NULL,
    user_id_2 UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id_1, user_id_2) -- Previne amizade duplicada
);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver suas próprias amizades
DROP POLICY IF EXISTS "Users can view their friendships" ON public.friendships;
CREATE POLICY "Users can view their friendships" 
ON public.friendships FOR SELECT 
USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- Usuários podem criar amizades (quando aceitam uma solicitação)
DROP POLICY IF EXISTS "Users can insert friendships" ON public.friendships;
CREATE POLICY "Users can insert friendships" 
ON public.friendships FOR INSERT 
WITH CHECK (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- Usuários podem deletar amizades (desfazer amizade)
DROP POLICY IF EXISTS "Users can delete friendships" ON public.friendships;
CREATE POLICY "Users can delete friendships" 
ON public.friendships FOR DELETE 
USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);
