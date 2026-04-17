// ─── Core Types ────────────────────────────────────────────────────────────────

export type TransactionStatus = "completed" | "pending" | "cancelled" | "predicted" | "overdue" | "ignored";

export type Transaction = {
  id: string;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  status: TransactionStatus;
  recurrenceId?: string;
  installmentId?: string;
  cardId?: string;
  predictedAmount?: number; // valor previsto antes da confirmação
  confirmedAt?: string;     // data real de confirmação
  note?: string;
};

// ─── Recorrências ───────────────────────────────────────────────────────────────

export type RecurrenceFrequency = "monthly" | "weekly" | "biweekly" | "yearly" | "custom";
export type RecurrenceStatus = "active" | "paused" | "cancelled";
export type PendingStatus = "predicted" | "pending" | "confirmed" | "overdue" | "ignored" | "skipped";

export type Recurrence = {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  frequency: RecurrenceFrequency;
  dayOfMonth: number;          // 1-31
  startDate: string;
  endDate?: string;
  cardId?: string;
  wallet?: string;
  note?: string;
  status: RecurrenceStatus;
  lastConfirmedDate?: string;
  nextDueDate: string;
};

export type RecurrenceOccurrence = {
  id: string;
  recurrenceId: string;
  title: string;
  amount: number;
  predictedAmount: number;
  type: "income" | "expense";
  category: string;
  dueDate: string;
  confirmedDate?: string;
  status: PendingStatus;
  note?: string;
};

// ─── Metas ─────────────────────────────────────────────────────────────────────

export type Goal = {
  id: string;
  title: string;
  emoji: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  color: string;
  description?: string;
  monthlyContribution?: number;
  autoContribute: boolean;
  createdAt: string;
  category?: string;
};

// ─── Cartões ───────────────────────────────────────────────────────────────────

export type Card = {
  id: string;
  name: string;
  bank?: string;
  brand: "visa" | "mastercard" | "elo" | "amex" | "hipercard";
  limit: number;
  usedLimit: number;
  closingDay: number;
  dueDay: number;
  color: string;
  lastFourDigits: string;
  isPaid: boolean;
  currentBillAmount: number;
  type?: string;
};

// ─── Parcelamentos ─────────────────────────────────────────────────────────────

export type Installment = {
  id: string;
  description: string;
  totalAmount: number;
  installmentAmount: number;
  totalInstallments: number;
  currentInstallment: number;
  cardId?: string;
  category: string;
  startDate: string;
  status: "active" | "completed" | "cancelled";
};

// ─── Monthly / Category Data ──────────────────────────────────────────────────

export type MonthlyData = {
  month: string;
  income: number;
  expense: number;
  savings: number;
  predictedIncome?: number;
  predictedExpense?: number;
};

export type CategoryData = {
  name: string;
  amount: number;
  percentage: number;
  color: string;
  previousAmount?: number;
};

// ──────────────────────────────────────────────────────────────────────────────
// MOCK DATA
// ──────────────────────────────────────────────────────────────────────────────

export const transactions: Transaction[] = [
  { id: "t1",  description: "Salário",           category: "Renda",          amount: 8500,   type: "income",  date: "2024-04-05", status: "completed", recurrenceId: "r1" },
  { id: "t2",  description: "Aluguel",            category: "Moradia",        amount: -1800,  type: "expense", date: "2024-04-01", status: "completed", recurrenceId: "r2" },
  { id: "t3",  description: "Supermercado Extra", category: "Alimentação",    amount: -420,   type: "expense", date: "2024-04-03", status: "completed" },
  { id: "t4",  description: "Netflix",            category: "Assinaturas",    amount: -55.90, type: "expense", date: "2024-04-04", status: "completed", recurrenceId: "r5" },
  { id: "t5",  description: "Freelance Design",   category: "Renda",          amount: 1200,   type: "income",  date: "2024-04-06", status: "completed" },
  { id: "t6",  description: "Conta de Luz",       category: "Contas",         amount: -180,   type: "expense", date: "2024-04-07", status: "completed", recurrenceId: "r6" },
  { id: "t7",  description: "Academia",           category: "Saúde",          amount: -99.90, type: "expense", date: "2024-04-08", status: "completed", recurrenceId: "r7" },
  { id: "t8",  description: "Restaurante Sushi",  category: "Alimentação",    amount: -145,   type: "expense", date: "2024-04-09", status: "completed" },
  { id: "t9",  description: "Dividendos PETR4",   category: "Investimentos",  amount: 320,    type: "income",  date: "2024-04-10", status: "completed" },
  { id: "t10", description: "Gasolina",           category: "Transporte",     amount: -250,   type: "expense", date: "2024-04-11", status: "completed" },
  { id: "t11", description: "Spotify",            category: "Assinaturas",    amount: -21.90, type: "expense", date: "2024-04-12", status: "completed", recurrenceId: "r8" },
  { id: "t12", description: "Farmácia",           category: "Saúde",          amount: -87.50, type: "expense", date: "2024-04-13", status: "completed" },
  { id: "t13", description: "Renda Extra Aulas",  category: "Renda",          amount: 600,    type: "income",  date: "2024-04-14", status: "pending" },
  { id: "t14", description: "Conta de Água",      category: "Contas",         amount: -75,    type: "expense", date: "2024-04-15", status: "completed", recurrenceId: "r9" },
  { id: "t15", description: "Investimento CDB",   category: "Investimentos",  amount: -1000,  type: "expense", date: "2024-04-15", status: "completed" },
  { id: "t16", description: "Cartão de Crédito",  category: "Contas",         amount: -890,   type: "expense", date: "2024-04-02", status: "completed", cardId: "c1" },
  { id: "t17", description: "Internet Claro",     category: "Contas",         amount: -120,   type: "expense", date: "2024-04-05", status: "completed", recurrenceId: "r10" },
  { id: "t18", description: "Uber",               category: "Transporte",     amount: -68,    type: "expense", date: "2024-04-10", status: "completed" },
];

export const recurrences: Recurrence[] = [
  {
    id: "r1", title: "Salário", amount: 8500, type: "income", category: "Renda",
    frequency: "monthly", dayOfMonth: 5, startDate: "2024-01-05",
    status: "active", nextDueDate: "2024-05-05", lastConfirmedDate: "2024-04-05",
  },
  {
    id: "r2", title: "Aluguel", amount: 1800, type: "expense", category: "Moradia",
    frequency: "monthly", dayOfMonth: 1, startDate: "2023-06-01",
    status: "active", nextDueDate: "2024-05-01", lastConfirmedDate: "2024-04-01",
  },
  {
    id: "r3", title: "Freelance Mensal", amount: 1200, type: "income", category: "Renda",
    frequency: "monthly", dayOfMonth: 20, startDate: "2024-02-20",
    status: "active", nextDueDate: "2024-04-20",
  },
  {
    id: "r4", title: "Parcela Notebook", amount: 350, type: "expense", category: "Tecnologia",
    frequency: "monthly", dayOfMonth: 10, startDate: "2024-01-10",
    endDate: "2024-12-10", status: "active", nextDueDate: "2024-05-10", cardId: "c1",
  },
  {
    id: "r5", title: "Netflix", amount: 55.90, type: "expense", category: "Assinaturas",
    frequency: "monthly", dayOfMonth: 4, startDate: "2023-01-04",
    status: "active", nextDueDate: "2024-05-04", lastConfirmedDate: "2024-04-04",
  },
  {
    id: "r6", title: "Conta de Luz", amount: 180, type: "expense", category: "Contas",
    frequency: "monthly", dayOfMonth: 7, startDate: "2023-06-07",
    status: "active", nextDueDate: "2024-05-07", lastConfirmedDate: "2024-04-07",
  },
  {
    id: "r7", title: "Academia", amount: 99.90, type: "expense", category: "Saúde",
    frequency: "monthly", dayOfMonth: 8, startDate: "2023-09-08",
    status: "active", nextDueDate: "2024-05-08", lastConfirmedDate: "2024-04-08",
  },
  {
    id: "r8", title: "Spotify", amount: 21.90, type: "expense", category: "Assinaturas",
    frequency: "monthly", dayOfMonth: 12, startDate: "2023-01-12",
    status: "active", nextDueDate: "2024-05-12", lastConfirmedDate: "2024-04-12",
  },
  {
    id: "r9", title: "Conta de Água", amount: 75, type: "expense", category: "Contas",
    frequency: "monthly", dayOfMonth: 15, startDate: "2023-06-15",
    status: "active", nextDueDate: "2024-05-15", lastConfirmedDate: "2024-04-15",
  },
  {
    id: "r10", title: "Internet Claro", amount: 120, type: "expense", category: "Contas",
    frequency: "monthly", dayOfMonth: 5, startDate: "2022-03-05",
    status: "active", nextDueDate: "2024-05-05", lastConfirmedDate: "2024-04-05",
  },
];

export const recurrenceOccurrences: RecurrenceOccurrence[] = [
  {
    id: "occ1", recurrenceId: "r3", title: "Freelance Mensal", amount: 1200, predictedAmount: 1200,
    type: "income", category: "Renda", dueDate: "2024-04-20", status: "pending",
    note: "Aguardando confirmação do pagamento",
  },
  {
    id: "occ2", recurrenceId: "r4", title: "Parcela Notebook", amount: 350, predictedAmount: 350,
    type: "expense", category: "Tecnologia", dueDate: "2024-04-10", status: "overdue",
    note: "Parcela 4/12",
  },
  {
    id: "occ3", recurrenceId: "r1", title: "Salário Maio", amount: 8500, predictedAmount: 8500,
    type: "income", category: "Renda", dueDate: "2024-05-05", status: "predicted",
  },
  {
    id: "occ4", recurrenceId: "r2", title: "Aluguel Maio", amount: 1800, predictedAmount: 1800,
    type: "expense", category: "Moradia", dueDate: "2024-05-01", status: "predicted",
  },
];

export const goals: Goal[] = [
  {
    id: "g1", title: "Reserva de Emergência", emoji: "🛡️",
    targetAmount: 30000, currentAmount: 12500, deadline: "2024-12-31",
    color: "#16a34a", description: "6 meses de despesas fixas",
    monthlyContribution: 1500, autoContribute: true, createdAt: "2024-01-01",
  },
  {
    id: "g2", title: "Viagem Europa", emoji: "✈️",
    targetAmount: 15000, currentAmount: 4200, deadline: "2025-06-01",
    color: "#2563eb", description: "Viagem de 21 dias pela Europa em julho",
    monthlyContribution: 800, autoContribute: false, createdAt: "2024-02-01",
  },
  {
    id: "g3", title: "Notebook Novo", emoji: "💻",
    targetAmount: 6000, currentAmount: 5400, deadline: "2024-06-01",
    color: "#7c3aed", description: "MacBook Pro M3",
    monthlyContribution: 600, autoContribute: true, createdAt: "2024-01-15",
  },
  {
    id: "g4", title: "Quitar Dívida", emoji: "💳",
    targetAmount: 8500, currentAmount: 8500, deadline: "2024-04-30",
    color: "#dc2626", description: "Quitar cartão de crédito",
    monthlyContribution: 0, autoContribute: false, createdAt: "2023-10-01",
  },
];

export const cards: Card[] = [
  {
    id: "c1", name: "Nubank", brand: "mastercard", limit: 12000, usedLimit: 4850,
    closingDay: 22, dueDay: 2, color: "#7c3aed", lastFourDigits: "4521",
    isPaid: false, currentBillAmount: 4850,
  },
  {
    id: "c2", name: "Itaú Platinum", brand: "visa", limit: 20000, usedLimit: 2300,
    closingDay: 15, dueDay: 25, color: "#1d4ed8", lastFourDigits: "8832",
    isPaid: true, currentBillAmount: 0,
  },
  {
    id: "c3", name: "Inter", brand: "mastercard", limit: 5000, usedLimit: 890,
    closingDay: 28, dueDay: 8, color: "#ea580c", lastFourDigits: "2210",
    isPaid: false, currentBillAmount: 890,
  },
];

export const installments: Installment[] = [
  {
    id: "i1", description: "MacBook Pro M3", totalAmount: 15999, installmentAmount: 1333.25,
    totalInstallments: 12, currentInstallment: 3, cardId: "c1",
    category: "Tecnologia", startDate: "2024-02-01", status: "active",
  },
  {
    id: "i2", description: "TV Samsung 65\"", totalAmount: 4800, installmentAmount: 400,
    totalInstallments: 12, currentInstallment: 7, cardId: "c2",
    category: "Eletrodomésticos", startDate: "2023-10-01", status: "active",
  },
  {
    id: "i3", description: "iPhone 15 Pro", totalAmount: 7000, installmentAmount: 583.33,
    totalInstallments: 12, currentInstallment: 12, cardId: "c1",
    category: "Tecnologia", startDate: "2023-05-01", status: "completed",
  },
];

export const monthlyData: MonthlyData[] = [
  { month: "Out", income: 9200,  expense: 4100, savings: 5100, predictedIncome: 9100,  predictedExpense: 4200 },
  { month: "Nov", income: 8800,  expense: 5200, savings: 3600, predictedIncome: 9100,  predictedExpense: 5000 },
  { month: "Dez", income: 11500, expense: 7800, savings: 3700, predictedIncome: 9100,  predictedExpense: 6000 },
  { month: "Jan", income: 9100,  expense: 4800, savings: 4300, predictedIncome: 9200,  predictedExpense: 5000 },
  { month: "Fev", income: 9300,  expense: 5100, savings: 4200, predictedIncome: 9200,  predictedExpense: 5000 },
  { month: "Mar", income: 8900,  expense: 4600, savings: 4300, predictedIncome: 9200,  predictedExpense: 4800 },
  { month: "Abr", income: 10620, expense: 5213, savings: 5407, predictedIncome: 10820, predictedExpense: 5800 },
];

export const categoryData: CategoryData[] = [
  { name: "Moradia",      amount: 1800,  percentage: 34.5, color: "#1a5c3a", previousAmount: 1800 },
  { name: "Alimentação",  amount: 565,   percentage: 10.8, color: "#22c55e", previousAmount: 440 },
  { name: "Contas",       amount: 1265,  percentage: 24.3, color: "#16a34a", previousAmount: 1265 },
  { name: "Transporte",   amount: 318,   percentage: 6.1,  color: "#4ade80", previousAmount: 290 },
  { name: "Saúde",        amount: 187.4, percentage: 3.6,  color: "#86efac", previousAmount: 200 },
  { name: "Lazer",        amount: 76.8,  percentage: 1.5,  color: "#bbf7d0", previousAmount: 120 },
  { name: "Investimentos",amount: 1000,  percentage: 19.2, color: "#052e16", previousAmount: 1000 },
];

export const kpis = {
  totalBalance: 12847.50,
  monthlyIncome: 10620,
  monthlyExpenses: 5213.20,
  savingsGoal: 5407,
  savingsGoalTarget: 6000,
  investmentTotal: 32400,
};

export const categories = [
  "Todas",
  "Renda",
  "Freela",
  "Mesada",
  "Investimentos",
  "Recebimento de Dívida",
  "Apostas & Métodos",
  "Moradia",
  "Alimentação",
  "Contas",
  "Transporte",
  "Saúde",
  "Lazer",
  "Assinaturas",
  "Tecnologia",
];

export const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];
