"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { 
  addMonths, 
  startOfMonth, 
  endOfMonth,
  differenceInMonths, 
  parseISO, 
  isSameMonth, 
  isBefore,
  addDays
} from 'date-fns';
import type {
  Transaction,
  Goal,
  Card,
  Recurrence,
  TransactionStatus,
  RecurrenceOccurrence
} from "@/lib/mockData";

export type NewTransaction = Omit<Transaction, "id">;
export type ModalMode = "income" | "expense" | "generic" | null;

export type QuickConfirmTarget = {
  occurrence: RecurrenceOccurrence | any;
} | null;

export type FriendDebt = {
  id: string;
  creator_id: string;
  lender_id: string;
  debtor_id: string;
  amount: number;
  description: string;
  status: 'pending' | 'paid';
  created_at: string;
  due_date: string;
};

type AppContextValue = {
  transactions: Transaction[];
  addTransaction: (t: NewTransaction & { isRecurring?: boolean }) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  
  friendDebts: FriendDebt[];
  addFriendDebt: (d: Omit<FriendDebt, "id" | "created_at" | "creator_id">) => Promise<void>;
  updateFriendDebtStatus: (id: string, status: 'pending' | 'paid') => Promise<void>;
  removeFriendDebt: (id: string) => Promise<void>;
  
  goals: Goal[];
  addGoal: (g: Omit<Goal, "id">) => Promise<void>;
  contributeToGoal: (goalId: string, amount: number) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;
  
  cards: Card[];
  addCard: (c: any) => Promise<void>;
  
  installments: any[];
  addInstallment: (i: any) => Promise<void>;
  removeInstallment: (id: string) => Promise<void>;
  payCardBill: (cardId: string) => Promise<void>;

  occurrences: RecurrenceOccurrence[];
  confirmOccurrence: (id: string, realAmount?: number, realDate?: string) => Promise<void>;
  updateOccurrenceStatus: (id: string, status: string) => Promise<void>;
  
  quickConfirmTarget: QuickConfirmTarget;
  openQuickConfirm: (o: RecurrenceOccurrence) => void;
  closeQuickConfirm: () => void;

  recurrences: Recurrence[];
  addRecurrence: (r: Partial<Recurrence>) => Promise<void>;
  removeRecurrence: (id: string) => Promise<void>;
  updateRecurrence: (id: string, updates: Partial<Recurrence>) => Promise<void>;

  totalIncome: number;
  totalExpenses: number;
  predictedIncome: number;
  predictedExpenses: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  recurrenceTodayCount: number;
  pendenciasCount: number;
  recurrenceCount: number;
  balance: number;
  projectedBalance: number;
  monthlyEconomy: number;

  activeSection: string;
  setActiveSection: (section: string) => void;

  isModalOpen: boolean;
  isRecurrenceModalOpen: boolean;
  isGoalModalOpen: boolean;
  modalMode: ModalMode;
  openModal: (mode?: ModalMode) => void;
  closeModal: () => void;
  editingRecurrence: Recurrence | null;
  openRecurrenceModal: (r?: Recurrence) => void;
  closeRecurrenceModal: () => void;
  openGoalModal: () => void;
  closeGoalModal: () => void;
  isCardModalOpen: boolean;
  openCardModal: () => void;
  closeCardModal: () => void;
  
  isInstallmentModalOpen: boolean;
  openInstallmentModal: () => void;
  closeInstallmentModal: () => void;

  isLoaded: boolean;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  viewMode: 'Mês' | 'Trimestre' | 'Ano';
  setViewMode: (mode: 'Mês' | 'Trimestre' | 'Ano') => void;
  displayMode: 'grid' | 'timeline';
  setDisplayMode: (mode: 'grid' | 'timeline') => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [installments, setInstallments] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [activeSection, setActiveSection] = useState("dashboard");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [viewMode, setViewMode] = useState<'Mês' | 'Trimestre' | 'Ano'>('Mês');
  const [displayMode, setDisplayMode] = useState<'grid' | 'timeline'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>(null);

  const [recurrences, setRecurrences] = useState<Recurrence[]>([]);
  const [friendDebts, setFriendDebts] = useState<FriendDebt[]>([]);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isInstallmentModalOpen, setIsInstallmentModalOpen] = useState(false);
  const [quickConfirmTarget, setQuickConfirmTarget] = useState<QuickConfirmTarget>(null);

  const fetchData = useCallback(async () => {
    if (!user) {
      setIsLoaded(true);
      return;
    }
    
    try {
      const [{ data: transData }, { data: goalData }, { data: cardData }, { data: instData }, { data: recData }, { data: debtData }] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from('goals').select('*').eq('user_id', user.id),
        supabase.from('credit_cards').select('*').eq('user_id', user.id),
        supabase.from('installments').select('*').eq('user_id', user.id),
        supabase.from('recurrences').select('*').eq('user_id', user.id),
        supabase.from('friend_debts').select('*').or(`lender_id.eq.${user.id},debtor_id.eq.${user.id}`)
      ]);
      
      if (transData) {
        setTransactions(transData.map(t => ({
          id: t.id,
          type: t.type,
          category: t.category,
          amount: parseFloat(t.amount),
          description: t.description || "",
          date: t.date,
          status: t.status as any,
          recurrenceId: t.recurrence_id
        })));
      }

      if (recData) {
        setRecurrences(recData.map(r => ({
          id: r.id,
          title: r.title,
          amount: parseFloat(r.amount),
          category: r.category,
          type: r.type,
          frequency: r.frequency || 'monthly',
          dayOfMonth: r.day_of_month,
          nextDueDate: r.next_due_date,
          startDate: r.start_date || r.created_at,
          status: r.status
        })));
      }

      if (goalData) {
        setGoals(goalData.map(g => ({
          id: g.id,
          title: g.title,
          targetAmount: parseFloat(g.target_amount),
          currentAmount: parseFloat(g.current_amount),
          emoji: g.icon || "🎯",
          category: g.category || "Geral",
          autoContribute: false,
          color: "#16a34a",
          createdAt: new Date().toISOString()
        })));
      }

      if (cardData) {
        setCards(cardData.map(c => {
          // Calcular valor da fatura somando parcelas ativas para este cartão
          const cardInstallments = (instData || []).filter((i: any) => i.card_id === c.id && i.status === 'active');
          const currentBill = cardInstallments.reduce((acc: number, i: any) => acc + parseFloat(i.installment_amount), 0);

          // Verificar se já existe pagamento este mês
          const monthStr = new Date().toISOString().slice(0, 7);
          const isPaid = (transData || []).some(t => 
            t.category === 'Cartão de Crédito' && 
            t.description.includes(c.name) && 
            t.date.startsWith(monthStr) &&
            t.status === 'completed'
          );

          return {
            id: c.id,
            name: c.name,
            bank: c.bank || "",
            brand: "visa",
            limit: parseFloat(c.limit_amount),
            usedLimit: parseFloat(c.current_balance),
            balance: parseFloat(c.current_balance),
            closingDay: c.closing_day || 10,
            dueDay: c.due_day || 20,
            color: c.color || "#10b981",
            lastFourDigits: c.last_four || "0000",
            isPaid: isPaid,
            currentBillAmount: currentBill,
            type: c.type || "credit"
          };
        }));
      }

      if (instData) {
        setInstallments(instData.map((i: any) => ({
          id: i.id,
          description: i.description,
          totalAmount: parseFloat(i.total_amount),
          installmentAmount: parseFloat(i.installment_amount),
          totalInstallments: i.total_installments,
          currentInstallment: i.current_installment,
          cardId: i.card_id,
          category: i.category,
          startDate: i.start_date,
          status: i.status
        })));
      }

      setIsLoaded(true);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchData();
  }, [user, fetchData]);

  const addTransaction = async (t: NewTransaction & { isRecurring?: boolean }) => {
    if (!user) return;
    
    if (t.isRecurring) {
      await addRecurrence({
        title: t.description,
        amount: Math.abs(t.amount),
        type: t.type,
        category: t.category,
        dayOfMonth: new Date(t.date).getUTCDate(),
        nextDueDate: t.date,
        status: 'active',
        frequency: 'monthly'
      });
      return;
    }

    const { error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: t.type,
        category: t.category,
        amount: t.amount,
        description: t.description,
        date: t.date,
        status: t.status
      });

    if (error) throw error;
    fetchData();
  };

  const removeTransaction = async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    fetchData();
  };

  const addInstallment = async (i: any) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('installments')
        .insert({
          user_id: user.id,
          description: i.description,
          total_amount: i.totalAmount,
          installment_amount: i.installmentAmount,
          total_installments: i.totalInstallments,
          current_installment: i.currentInstallment || 1,
          card_id: i.cardId,
          category: i.category,
          start_date: i.startDate || new Date().toISOString().split('T')[0],
          status: 'active'
        });
      if (error) {
        console.error("Erro Supabase ao adicionar parcelamento:", error);
        window.alert(`Erro ao salvar compra: ${error.message}`);
        throw error;
      }

      // Atualizar o limite utilizado do cartão no banco
      const card = cards.find(c => c.id === i.cardId);
      if (card) {
        const newBalance = (card.usedLimit || 0) + i.totalAmount;
        await supabase
          .from('credit_cards')
          .update({ current_balance: newBalance })
          .eq('id', i.cardId);
      }

      await fetchData();
    } catch (error) {
      console.error("Erro ao adicionar parcelamento:", error);
    }
  };

  const removeInstallment = async (id: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('installments')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error("Erro ao remover parcelamento:", error);
    }
  };

  const payCardBill = async (cardId: string) => {
    if (!user) return;
    const card = cards.find(c => c.id === cardId);
    if (!card || card.currentBillAmount <= 0) return;

    try {
      // 1. Criar transação de pagamento de fatura
      const { error: transError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'expense',
          category: 'Cartão de Crédito',
          amount: -Math.abs(card.currentBillAmount),
          description: `Pagamento Fatura: ${card.name}`,
          date: new Date().toISOString().split('T')[0],
          status: 'completed'
        });

      if (transError) throw transError;

      // 2. Liberar Limite do Cartão (Diminuir current_balance)
      const newBalance = Math.max(0, card.usedLimit - card.currentBillAmount);
      await supabase
        .from('credit_cards')
        .update({ current_balance: newBalance })
        .eq('id', cardId);

      // 3. Avançar parcelas de todos os parcelamentos ativos deste cartão
      const cardInstallments = installments.filter(inst => inst.cardId === cardId && inst.status === 'active');
      
      for (const inst of cardInstallments) {
        const nextInstallment = inst.currentInstallment + 1;
        const isCompleted = nextInstallment > inst.totalInstallments;

        await supabase
          .from('installments')
          .update({
            current_installment: isCompleted ? inst.totalInstallments : nextInstallment,
            status: isCompleted ? 'completed' : 'active'
          })
          .eq('id', inst.id);
      }

      await fetchData();
      window.alert(`Fatura do ${card.name} paga com sucesso!`);
    } catch (error) {
      console.error("Erro ao pagar fatura:", error);
      window.alert("Erro ao processar pagamento da fatura.");
    }
  };

  const addGoal = async (g: any) => {
    if (!user) return;
    const { error } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        title: g.title,
        target_amount: parseFloat(g.targetAmount),
        current_amount: parseFloat(g.currentAmount || 0),
        icon: g.emoji || "🎯",
        category: g.category || "Investimentos"
      });
    
    if (error) throw error;
    await fetchData();
  };

  const removeGoal = async (id: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    await fetchData();
  };

  const contributeToGoal = async (goalId: string, amount: number) => {
    if (!user) return;
    
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const newAmount = goal.currentAmount + amount;

    const { error } = await supabase
      .from('goals')
      .update({ current_amount: newAmount })
      .eq('id', goalId);
    
    if (error) throw error;

    await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'expense',
        category: 'Investimentos',
        amount: -Math.abs(amount),
        description: `Aporte Meta: ${goal.title}`,
        date: new Date().toISOString().split('T')[0],
        status: 'completed'
      });

    await fetchData();
  };

  const addFriendDebt = async (d: Omit<FriendDebt, "id" | "created_at" | "creator_id">) => {
    if (!user) return;
    const { error } = await supabase.from('friend_debts').insert({
      ...d,
      creator_id: user.id
    });
    if (error) throw error;
    await fetchData();
  };

  const updateFriendDebtStatus = async (id: string, status: 'pending' | 'paid') => {
    const { error } = await supabase.from('friend_debts').update({ status }).eq('id', id);
    if (error) throw error;
    await fetchData();
  };

  const removeFriendDebt = async (id: string) => {
    const { error } = await supabase.from('friend_debts').delete().eq('id', id);
    if (error) throw error;
    await fetchData();
  };


  const addCard = async (c: any) => {
    if (!user) return;
    const { error } = await supabase
      .from('credit_cards')
      .insert({
        user_id: user.id,
        name: c.name,
        bank: c.bank,
        limit_amount: c.limit,
        current_balance: c.balance,
        last_four: c.lastFourDigits,
        closing_day: c.closingDay,
        due_day: c.dueDay,
        color: c.color,
        type: c.type
      });
    
    if (error) {
      console.error("Erro Supabase ao adicionar cartão:", error);
      window.alert(`Não foi possível salvar o cartão no banco: ${error.message}`);
      throw error;
    }
    await fetchData();
  };

  const currentMonth = useMemo(() => new Date().toISOString().slice(0, 7), []);
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const totalIncome = useMemo(() => 
    transactions.filter(t => t.type === 'income' && t.status === 'completed')
    .reduce((acc, t) => acc + t.amount, 0)
  , [transactions]);

  const totalExpenses = useMemo(() => 
    transactions.filter(t => t.type === 'expense' && t.status === 'completed')
    .reduce((acc, t) => acc + t.amount, 0)
  , [transactions]);

  const balance = useMemo(() => (user?.initialBalance || 0) + totalIncome + totalExpenses, [user, totalIncome, totalExpenses]);

  const occurrences = useMemo(() => {
    const realOccurrences = transactions
      .filter(t => t.status === 'pending' || t.status === 'predicted' || t.status === 'overdue')
      .map(t => ({
        id: t.id,
        recurrenceId: t.recurrenceId,
        title: t.description,
        amount: Math.abs(t.amount),
        type: t.type,
        category: t.category,
        dueDate: t.date,
        status: t.status
      }));

    const projectedOccurrences: any[] = [];
    const now = new Date();

    recurrences.forEach(rec => {
      if (rec.status !== 'active') return;

      // Iniciar a partir do mês atual ou do próximo vencimento
      let tempDate = rec.nextDueDate ? parseISO(rec.nextDueDate) : new Date();
      
      // Ajustar para o dia do mês configurado
      if (rec.dayOfMonth) {
        tempDate.setDate(rec.dayOfMonth);
      }
      
      // Se o vencimento original já passou, trazer para o mês atual
      if (tempDate < startOfMonth(now)) {
        tempDate = new Date(now.getFullYear(), now.getMonth(), rec.dayOfMonth || now.getDate());
      }

      // Projetar exatamente os próximos 12 meses
      for (let i = 0; i < 12; i++) {
        const monthStr = tempDate.toISOString().slice(0, 7);
        
        // Verificar se já existe uma transação (paga, pendente ou prevista no DB) para este mês
        const alreadyHasReal = transactions.some(t => 
          t.recurrenceId === rec.id && t.date.startsWith(monthStr)
        );
        
        const alreadyProjected = projectedOccurrences.some(o => 
          o.recurrenceId === rec.id && o.dueDate.startsWith(monthStr)
        );

        if (!alreadyHasReal && !alreadyProjected) {
          const isCurrentOrPastMonth = monthStr <= now.toISOString().slice(0, 7);
          
          if (rec.type === 'income' && isCurrentOrPastMonth) {
            // Pular projeção de receita para o mês atual ou passados (evitar duplicidade/otimismo)
          } else {
            projectedOccurrences.push({
              id: `v-${rec.id}-${monthStr}`,
              recurrenceId: rec.id,
              title: rec.title,
              amount: Math.abs(rec.amount),
              type: rec.type,
              category: rec.category,
              dueDate: tempDate.toISOString().split('T')[0],
              status: 'predicted',
              isVirtual: true
            });
          }
        }
        
        tempDate = addMonths(tempDate, 1);
      }
    });

    // --- Inclusão de Faturas de Cartão (Projeção de 12 meses com base em parcelas) ---
    cards.forEach(card => {
      if (card.type !== 'credit') return;

      for (let i = 0; i < 12; i++) {
        const projectionDate = addMonths(new Date(now.getFullYear(), now.getMonth(), card.dueDay || 20), i);
        const monthStr = projectionDate.toISOString().slice(0, 7);

        // Somar parcelas que estarão ativas neste mês específico
        const activeInstallments = installments.filter(inst => {
          if (inst.cardId !== card.id || inst.status !== 'active') return false;
          
          const startMonth = inst.startDate.slice(0, 7);
          const monthsDiff = differenceInMonths(parseISO(monthStr), parseISO(startMonth));
          
          // Uma parcela é ativa se o mês atual for >= início E não ultrapassar o total
          // Ex: se começou em Jan e tem 3 parcelas, é ativa em Jan (0), Fev (1), Mar (2)
          const remainingFromStart = inst.totalInstallments - (inst.currentInstallment - 1);
          return monthsDiff >= 0 && monthsDiff < remainingFromStart;
        });

        const billAmount = activeInstallments.reduce((sum, inst) => sum + inst.installmentAmount, 0);

        if (billAmount > 0) {
          // Verificar se já existe pagamento REAL este mês
          const alreadyPaid = transactions.some(t => 
            t.category === 'Cartão de Crédito' && 
            t.description.includes(card.name) && 
            t.date.startsWith(monthStr) &&
            t.status === 'completed'
          );

          if (!alreadyPaid) {
            projectedOccurrences.push({
              id: `bill-${card.id}-${monthStr}`,
              title: `Fatura: ${card.name}`,
              amount: billAmount,
              type: 'expense',
              category: 'Cartão de Crédito',
              dueDate: projectionDate.toISOString().split('T')[0],
              status: 'predicted',
              isVirtual: true,
              isBill: true
            });
          }
        }
      }
    });

    const debtOccurrences = friendDebts
      .filter(d => d.status === 'pending')
      .map(d => {
        const isLender = d.lender_id === user?.id;
        return {
          id: `debt-${d.id}`,
          friendDebtId: d.id,
          title: `Amizade: ${d.description}`,
          amount: d.amount,
          type: isLender ? 'income' : 'expense',
          category: 'Amizades',
          dueDate: d.due_date,
          status: 'pending' as const,
          isFriendDebt: true
        };
      });

    return [...realOccurrences, ...projectedOccurrences, ...debtOccurrences].sort((a, b) => 
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
  }, [transactions, recurrences, cards, installments, friendDebts, user]);

  const recurrenceCount = useMemo(() => occurrences.length, [occurrences]);

  const recurrenceTodayCount = useMemo(() => {
    return occurrences.filter(o => o.type === 'expense' && o.dueDate <= todayStr).length;
  }, [occurrences, todayStr]);

  const pendenciasCount = useMemo(() => {
    return occurrences.filter(o => 
      o.type === 'expense' && 
      o.dueDate.startsWith(selectedMonth) &&
      (o.status === 'pending' || o.status === 'predicted' || o.status === 'overdue')
    ).length;
  }, [occurrences, selectedMonth]);

  // --- MÉTRICAS AGREGADAS POR PERÍODO (MÊS, TRIMESTRE, ANO) ---
  
  // Definir o intervalo de datas visível baseado no viewMode
  const visibleRange = useMemo(() => {
    const start = parseISO(selectedMonth + "-01");
    let end;
    if (viewMode === 'Trimestre') {
      end = endOfMonth(addMonths(start, 2));
    } else if (viewMode === 'Ano') {
      end = endOfMonth(addMonths(start, 11));
    } else {
      end = endOfMonth(start);
    }
    return { 
      startStr: selectedMonth + "-01", 
      endStr: end.toISOString().split('T')[0] 
    };
  }, [selectedMonth, viewMode]);

  const monthlyIncome = useMemo(() => {
    return transactions
      .filter(t => t.type === 'income' && t.status === 'completed' && t.date >= visibleRange.startStr && t.date <= visibleRange.endStr)
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions, visibleRange]);

  const monthlyExpenses = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense' && t.status === 'completed' && t.date >= visibleRange.startStr && t.date <= visibleRange.endStr)
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);
  }, [transactions, visibleRange]);

  const predictedIncome = useMemo(() => {
    return occurrences
      .filter(o => o.type === 'income' && o.dueDate >= visibleRange.startStr && o.dueDate <= visibleRange.endStr && (o.status === 'pending' || o.status === 'predicted'))
      .reduce((acc, o) => acc + o.amount, 0);
  }, [occurrences, visibleRange]);

  const predictedExpenses = useMemo(() => {
    return occurrences
      .filter(o => o.type === 'expense' && o.dueDate >= visibleRange.startStr && o.dueDate <= visibleRange.endStr && (o.status === 'pending' || o.status === 'predicted' || o.status === 'overdue'))
      .reduce((acc, o) => acc + o.amount, 0);
  }, [occurrences, visibleRange]);

  const projectedBalance = useMemo(() => {
    // Projeção do saldo no último dia do período visível
    const futureIncome = occurrences
      .filter(o => o.type === 'income' && o.dueDate > todayStr && o.dueDate <= visibleRange.endStr)
      .reduce((acc, o) => acc + o.amount, 0);
      
    const futureExpenses = occurrences
      .filter(o => o.type === 'expense' && o.dueDate > todayStr && o.dueDate <= visibleRange.endStr)
      .reduce((acc, o) => acc + o.amount, 0);

    return balance + futureIncome - futureExpenses;
  }, [balance, occurrences, visibleRange, todayStr, selectedMonth, viewMode]);

  const monthlyEconomy = useMemo(() => {
    // Evolução em relação ao saldo inicial configurado pelo usuário
    return projectedBalance - (user?.initialBalance || 0);
  }, [projectedBalance, user?.initialBalance]);

  const openModal = useCallback((mode: ModalMode = "generic") => {
    setModalMode(mode);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModalMode(null);
  }, []);

  const openQuickConfirm = useCallback((occ: any) => {
    setQuickConfirmTarget({ occurrence: occ });
  }, []);

  const closeQuickConfirm = useCallback(() => {
    setQuickConfirmTarget(null);
  }, []);

  const [isRecurrenceModalOpen, setIsRecurrenceModalOpen] = useState(false);
  const [editingRecurrence, setEditingRecurrence] = useState<any | null>(null);

  const addRecurrence = async (r: any) => {
    if (!user) return;
    
    try {
      const recurrenceId = typeof crypto.randomUUID === 'function' 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2) + Date.now().toString(36);

      const { error: recError } = await supabase
        .from('recurrences')
        .insert({
          id: recurrenceId,
          user_id: user.id,
          title: r.title,
          amount: parseFloat(r.amount),
          category: r.category,
          type: r.type,
          frequency: r.frequency,
          day_of_month: r.dayOfMonth,
          next_due_date: r.nextDueDate,
          status: r.status
        });

      if (recError) throw recError;

      const { error: transError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          recurrence_id: recurrenceId,
          type: r.type,
          category: r.category,
          amount: r.type === 'expense' ? -Math.abs(r.amount) : Math.abs(r.amount),
          description: r.title,
          date: r.nextDueDate,
          status: 'predicted'
        });

      if (transError) throw transError;

      fetchData();
    } catch (err: any) {
      console.error("Erro addRecurrence:", err);
      throw new Error("Falha ao salvar conta recorrente: " + (err.message || "Erro desconhecido"));
    }
  };

  const confirmOccurrence = async (occurrenceId: string, realAmount?: number, realDate?: string) => {
    if (!user) return;
    
    if (occurrenceId.startsWith('v-')) {
      const parts = occurrenceId.split('-');
      const recurrenceId = parts[1];
      const rec = recurrences.find(r => r.id === recurrenceId);
      if (!rec) return;

      const finalAmount = realAmount !== undefined 
        ? (rec.type === 'expense' ? -Math.abs(realAmount) : Math.abs(realAmount))
        : (rec.type === 'expense' ? -Math.abs(rec.amount) : Math.abs(rec.amount));

      const finalDate = realDate || new Date().toISOString().split('T')[0];

      const { error: insertError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          recurrence_id: rec.id,
          type: rec.type,
          category: rec.category,
          amount: finalAmount,
          description: rec.title,
          date: finalDate,
          status: 'completed'
        });
      
      if (insertError) throw insertError;
      
      const currentRecNext = new Date(rec.nextDueDate);
      const nextDate = addMonths(currentRecNext, 1);
      const nextDateStr = nextDate.toISOString().split('T')[0];

      await supabase
        .from('recurrences')
        .update({ next_due_date: nextDateStr })
        .eq('id', rec.id);

    } else {
      const { data: dbTrans } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', occurrenceId)
        .single();
      
      if (!dbTrans) return;

      const finalAmount = realAmount !== undefined 
        ? (dbTrans.type === 'expense' ? -Math.abs(realAmount) : Math.abs(realAmount))
        : dbTrans.amount;

      const finalDate = realDate || new Date().toISOString().split('T')[0];

      await supabase
        .from('transactions')
        .update({ 
          status: 'completed', 
          amount: finalAmount,
          date: finalDate 
        })
        .eq('id', occurrenceId);

      if (dbTrans.recurrence_id) {
        const rec = recurrences.find(r => r.id === dbTrans.recurrence_id);
        if (rec) {
          const currentNext = new Date(rec.nextDueDate);
          const nextDate = addMonths(currentNext, 1);
          const nextDateStr = nextDate.toISOString().split('T')[0];

          await supabase
            .from('recurrences')
            .update({ next_due_date: nextDateStr })
            .eq('id', rec.id);

          await supabase
            .from('transactions')
            .insert({
              user_id: user.id,
              recurrence_id: rec.id,
              type: rec.type,
              category: rec.category,
              amount: rec.amount,
              description: rec.title,
              date: nextDateStr,
              status: 'predicted'
            });
        }
      }
    }

    await fetchData();
  };

  const removeRecurrence = async (id: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('recurrences')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    fetchData();
  };

  const updateRecurrence = async (id: string, updates: any) => {
    if (!user) return;
    const { error } = await supabase
      .from('recurrences')
      .update(updates)
      .eq('id', id);
    
    if (error) throw error;
    fetchData();
  };

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  const openGoalModal = () => setIsGoalModalOpen(true);
  const closeGoalModal = () => setIsGoalModalOpen(false);

  const openRecurrenceModal = (r?: any) => {
    setEditingRecurrence(r || null);
    setIsRecurrenceModalOpen(true);
  };

  const closeRecurrenceModal = () => {
    setIsRecurrenceModalOpen(false);
    setEditingRecurrence(null);
  };

  const openCardModal = () => setIsCardModalOpen(true);
  const closeCardModal = () => setIsCardModalOpen(false);

  const openInstallmentModal = () => setIsInstallmentModalOpen(true);
  const closeInstallmentModal = () => setIsInstallmentModalOpen(false);

  return (
    <AppContext.Provider
      value={{
        transactions,
        addTransaction,
        removeTransaction,
        goals,
        addGoal,
        contributeToGoal,
        removeGoal,
        cards,
        addCard,
        installments,
        addInstallment,
        removeInstallment,
        payCardBill,
        friendDebts,
        addFriendDebt,
        updateFriendDebtStatus,
        removeFriendDebt,
        occurrences,
        confirmOccurrence,
        updateOccurrenceStatus: async (id: string, status: string) => {
          await supabase.from('transactions').update({ status }).eq('id', id);
          fetchData();
        },
        quickConfirmTarget,
        openQuickConfirm,
        closeQuickConfirm,
        recurrences,
        addRecurrence,
        removeRecurrence,
        updateRecurrence,
        totalIncome,
        totalExpenses,
        predictedIncome,
        predictedExpenses,
        monthlyIncome,
        monthlyExpenses,
        recurrenceTodayCount,
        pendenciasCount,
        recurrenceCount,
        balance,
        projectedBalance,
        monthlyEconomy,

        viewMode,
        setViewMode,
        displayMode,
        setDisplayMode,

        activeSection,
        setActiveSection,

        isModalOpen,
        isRecurrenceModalOpen,
        isGoalModalOpen,
        modalMode,
        openModal,
        closeModal,
        editingRecurrence,
        openRecurrenceModal,
        closeRecurrenceModal,
        openGoalModal,
        closeGoalModal,
        isCardModalOpen,
        openCardModal,
        closeCardModal,
        isInstallmentModalOpen,
        openInstallmentModal,
        closeInstallmentModal,
        isLoaded,
        selectedMonth,
        setSelectedMonth,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
};
