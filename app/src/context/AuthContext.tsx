"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { sendPasswordRecoveryEmail } from "@/lib/emailActions";

type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  initialBalance?: number;
  friendIds?: string[];

  friendRequests?: string[];
  outgoingRequests?: string[];
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoaded: boolean;
  mockEmail: { to: string; code: string } | null;
  setMockEmail: (email: any) => void;
  updateInitialBalance: (amount: number) => Promise<void>;
  login: (identifier: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  verifyRecoveryCode: (email: string, code: string) => Promise<string>;
  sendFriendRequest: (username: string) => Promise<void>;
  acceptFriendRequest: (userId: string) => Promise<void>;
  declineFriendRequest: (userId: string) => Promise<void>;
  logout: () => void;
  storedUsers: User[]; // Agora representará todos os perfis do sistema
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mockEmail, setMockEmail] = useState<{ to: string; code: string } | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<Record<string, string>>({});
  const [storedUsers, setStoredUsers] = useState<User[]>([]);

  // 1. Tentar recuperar cache síncrono para velocidade "Liso"
  useEffect(() => {
    const cachedUser = localStorage.getItem('dash_user_cache');
    if (cachedUser) {
      try {
        const parsed = JSON.parse(cachedUser);
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem('dash_user_cache');
      }
    }
  }, []);

  // 2. Carregar sessão e perfis do Supabase em background
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Já temos o token de sessão, podemos liberar a UI
          setIsLoaded(true); 
          // Atualiza dados extras (nome, saldo inicial, etc) em background
          refreshUserData(session.user.id);
        } else {
          setIsLoaded(true);
          setUser(null);
          localStorage.removeItem('dash_user_cache');
        }
      } catch (err) {
        console.error("Auth init error:", err);
        setIsLoaded(true);
      } finally {
        fetchAllProfiles();
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        if (session?.user) refreshUserData(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('dash_user_cache');
        setIsLoaded(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);






  const fetchAllProfiles = async () => {
    const { data } = await supabase.from('profiles').select('*');
    if (data) {
      setStoredUsers(data.map(p => ({
        id: p.id,
        name: p.full_name || p.username,
        username: p.username,
        email: p.email,
        avatar: p.avatar_url,
        friendIds: [] // Carregado separadamente se necessário
      })));
    }
  };

  const refreshUserData = async (userId: string) => {
    // Buscar perfil
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        // Buscar amigos e solicitações...
        const [{ data: friends }, { data: requests }] = await Promise.all([
          supabase.from('friendships').select('user_id_1, user_id_2').or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`),
          supabase.from('friend_requests').select('*').or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        ]);
        
        const friendIds = friends?.map(f => f.user_id_1 === userId ? f.user_id_2 : f.user_id_1) || [];
        const incoming = requests?.filter(r => r.receiver_id === userId && r.status === 'pending').map(r => r.sender_id) || [];
        const outgoing = requests?.filter(r => r.sender_id === userId && r.status === 'pending').map(r => r.receiver_id) || [];

        const fullUser = {
          id: profile.id,
          name: profile.full_name || profile.username || profile.email?.split('@')[0],
          username: profile.username || profile.email,
          email: profile.email,
          avatar: profile.avatar_url,
          initialBalance: parseFloat(profile.initial_balance || 0),
          friendIds,
          friendRequests: incoming,
          outgoingRequests: outgoing
        };

        setUser(fullUser);
        localStorage.setItem('dash_user_cache', JSON.stringify(fullUser));

      } else if (!profile && !profileError) {
        // Fallback para usuário básico se o perfil ainda não existir ou falhar
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || "Usuário",
            username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || "user",
            friendIds: [],
          } as any);
        }
      }
    } catch (err) {
      console.warn("Refresh user data failed, keeping current user if any.");
    }
  };


  const updateInitialBalance = async (amount: number) => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ initial_balance: amount })
      .eq('id', user.id);
    
    if (error) throw error;
    await refreshUserData(user.id);
  };

  const login = async (identifier: string, password: string) => {
    let email = identifier;

    // 1. Resolver Username -> Email se necessário
    if (!identifier.includes('@')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', identifier.replace(/^@/, "").toLowerCase())
        .maybeSingle();
      
      if (profile) {
        email = profile.email;
      } else {
        throw new Error("Usuário não encontrado.");
      }
    }

    // 2. Tentar Login com Timeout
    const loginPromise = supabase.auth.signInWithPassword({ email, password });
    
    // Timeout de 15 segundos
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("O servidor demorou muito para responder. Verifique sua conexão.")), 15000)
    );

    const { error } = await Promise.race([loginPromise, timeoutPromise]) as any;
    
    if (error) throw error;
  };



  const register = async (username: string, email: string, password: string) => {
    // 1. Auth Signup (O Profile será criado automaticamente pelo Trigger que configuramos no SQL)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: username // Passando metadados que o trigger vai ler
        }
      }
    });

    if (authError) throw authError;
    
    // Pequeno delay para o trigger terminar de criar o perfil antes de recarregarmos
    setTimeout(() => fetchAllProfiles(), 1000);
  };


  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const sendFriendRequest = async (friendUsername: string) => {
    if (!user) throw new Error("Você precisa estar logado");
    
    const cleanSearchName = friendUsername.replace(/^@/, "").toLowerCase();
    const friend = storedUsers.find(u => u.username.toLowerCase() === cleanSearchName);
    
    if (!friend) throw new Error(`Usuário "@${cleanSearchName}" não encontrado`);
    if (friend.id === user.id) throw new Error("Você não pode adicionar a si mesmo");

    const { error } = await supabase
      .from('friend_requests')
      .insert({
        sender_id: user.id,
        receiver_id: friend.id,
        status: 'pending'
      });

    if (error) {
      if (error.code === '23505') throw new Error("Solicitação já enviada");
      throw error;
    }

    await refreshUserData(user.id);
  };

  const acceptFriendRequest = async (requesterId: string) => {
    if (!user) throw new Error("Você precisa estar logado");

    // 1. Atualizar status da solicitação
    await supabase
      .from('friend_requests')
      .update({ status: 'accepted' })
      .eq('sender_id', requesterId)
      .eq('receiver_id', user.id);

    // 2. Criar vínculo na tabela friendships
    await supabase
      .from('friendships')
      .insert({
        user_id_1: requesterId,
        user_id_2: user.id
      });

    await refreshUserData(user.id);
  };

  const declineFriendRequest = async (requesterId: string) => {
    if (!user) throw new Error("Você precisa estar logado");

    await supabase
      .from('friend_requests')
      .delete()
      .eq('sender_id', requesterId)
      .eq('receiver_id', user.id);

    await refreshUserData(user.id);
  };

  // Mock de recuperação de senha (Supabase tem o seu próprio, mas vamos manter o fluxo visual)
  const forgotPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    
    // Simulação visual para o usuário
    setMockEmail({ to: email, code: 'LINK' });
  };

  const verifyRecoveryCode = async (email: string, code: string) => {
    return Promise.resolve("Supabase enviou um link real para seu e-mail.");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoaded, 
      mockEmail, 
      setMockEmail, 
      updateInitialBalance,
      login, 
      register, 
      forgotPassword, 
      verifyRecoveryCode, 
      sendFriendRequest, 
      acceptFriendRequest, 
      declineFriendRequest, 
      logout, 
      storedUsers 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
