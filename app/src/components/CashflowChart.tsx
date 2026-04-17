"use client";

import { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { TrendingUp, Calendar } from "lucide-react";

const formatCurrency = (value: number) =>
  `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const isFuture = payload[0].payload.isFuture;

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: "16px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Calendar size={14} style={{ color: "var(--gray-400)" }} />
        <span style={{ fontWeight: 700, color: "#111827", fontSize: 14 }}>{label} 2026</span>
        {isFuture && (
          <span style={{ fontSize: 10, background: "#eff6ff", color: "#3b82f6", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>PROJEÇÃO</span>
        )}
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {payload.map((entry: any, idx: number) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: entry.color }} />
              <span style={{ color: "var(--gray-500)", fontSize: 12 }}>{entry.name}</span>
            </div>
            <span style={{ color: "var(--gray-900)", fontWeight: 700, fontSize: 13 }}>
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function CashflowChart({ fullWidth = false }: { fullWidth?: boolean }) {
  const { transactions, balance, recurrences, occurrences, selectedMonth, viewMode, projectedBalance } = useApp();

  const chartData = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const referenceDate = new Date(year, month - 1, 1);
    const data = [];
    
    // Mapeamento de alcance: Mês (3 meses), Trimestre (6 meses), Ano (12 meses)
    const range = viewMode === 'Mês' ? 1 : viewMode === 'Trimestre' ? 3 : 6;
    
    for (let i = -range; i <= range; i++) {
      const date = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + i, 1);
      const monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(date);
      const monthStr = date.toISOString().slice(0, 7);
      const isPast = date < new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const isCurrent = monthStr === new Date().toISOString().slice(0, 7);
      const isReference = monthStr === selectedMonth;

      const realIncome = transactions
        .filter(t => t.type === 'income' && t.status === 'completed' && t.date.startsWith(monthStr))
        .reduce((sum, t) => sum + t.amount, 0);

      const realExpense = Math.abs(transactions
        .filter(t => t.type === 'expense' && t.status === 'completed' && t.date.startsWith(monthStr))
        .reduce((sum, t) => sum + t.amount, 0));

      const monthOccurrences = occurrences.filter(o => o.dueDate.startsWith(monthStr));
      
      const projectedIncome = monthOccurrences
        .filter(o => o.type === 'income' && (o.status === 'pending' || o.status === 'predicted'))
        .reduce((sum, o) => sum + o.amount, 0);
      
      const projectedExpense = monthOccurrences
        .filter(o => o.type === 'expense' && (o.status === 'pending' || o.status === 'predicted' || o.status === 'overdue'))
        .reduce((sum, o) => sum + o.amount, 0);

      data.push({
        month: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
        monthStr,
        realIncome,
        realExpense,
        Receitas: realIncome + projectedIncome,
        Despesas: realExpense + projectedExpense,
        isFuture: i > 0,
        isCurrent: i === 0,
        isReference,
        Saldo: 0
      });
    }

    // Encontrar o índice do mês de HOJE nos dados para ser o ponto de partida do 'balance'
    const todayIndex = data.findIndex(d => {
      const today = new Date();
      const monthStr = today.toISOString().slice(0, 7);
      // Aqui precisamos comparar com a data original, mas como temos isCurrent marcado:
      return d.isCurrent;
    });

    // Se não encontrar o hoje (ex: visualizando só o futuro ou passado distante), usa o meio
    const startIndex = todayIndex !== -1 ? todayIndex : Math.floor(data.length / 2);

    // 1. Calcular para trás do hoje
    const result = [...data];
    let backBalance = balance;
    for (let i = startIndex - 1; i >= 0; i--) {
      // Para saber o saldo do mês anterior, pegamos o saldo atual e "desfazemos" a movimentação do mês atual
      // SaldoAnterior = SaldoAtual - (ReceitasMesAtual - DespesasMesAtual)
      backBalance -= (result[i + 1].Receitas - result[i + 1].Despesas);
      result[i].Saldo = backBalance;
    }

    // 2. Definir saldo do hoje
    result[startIndex].Saldo = balance;

    // 3. Calcular para frente do hoje
    let forwardBalance = balance;
    for (let i = startIndex + 1; i < result.length; i++) {
      forwardBalance += (result[i].Receitas - result[i].Despesas);
      result[i].Saldo = forwardBalance;
    }

    return result;
  }, [transactions, balance, occurrences, selectedMonth, viewMode]);

  // Pegar os dados específicos do mês selecionado para o rodapé
  const selectedMonthData = chartData.find(d => d.monthStr === selectedMonth) || 
                       chartData.find(d => d.isReference) || 
                       chartData[0];

  return (
    <div className="card fade-up fade-up-5" style={{ minHeight: 450, overflow: "visible" }}>
      <div className="card-header" style={{ marginBottom: 20 }}>
        <div>
          <h3 className="card-title" style={{ fontSize: 18, display: "flex", alignItems: "center", gap: 10 }}>
            Saúde Financeira & Projeção
            <div style={{ background: "var(--green-50)", padding: "4px 10px", borderRadius: 20, fontSize: 10, color: "var(--green-600)", fontWeight: 700 }}>
              AUTO-UPDATE
            </div>
          </h3>
          <p className="card-subtitle">Evolução do seu patrimônio e gastos previstos</p>
        </div>
        <div className="icon-container" style={{ background: "#eff6ff", color: "#3b82f6" }}>
          <TrendingUp size={18} />
        </div>
      </div>

      <div style={{ height: fullWidth ? 400 : 320, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
              dy={15}
            />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }} />
            
            {/* Marcador de HOJE */}
            {chartData.some(d => d.isCurrent) && (
              <ReferenceLine 
                x={chartData.find(d => d.isCurrent)?.month} 
                stroke="#10b981" 
                strokeDasharray="5 5" 
                label={{ position: 'top', value: 'HOJE', fill: '#10b981', fontSize: 10, fontWeight: 800 }} 
              />
            )}

            {/* Marcador de FOCO (Mês Selecionado) */}
            {chartData.some(d => d.isReference) && (
              <ReferenceLine 
                x={chartData.find(d => d.isReference)?.month} 
                stroke="#3b82f6" 
                strokeOpacity={0.05}
                strokeWidth={fullWidth ? 100 : 60}
              />
            )}

            <Area 
              type="monotone" 
              dataKey="Saldo" 
              stroke="#3b82f6" 
              strokeWidth={4} 
              fillOpacity={1} 
              fill="url(#colorSaldo)" 
              animationDuration={2000}
            />
            <Area 
              type="monotone" 
              dataKey="Receitas" 
              stroke="#10b981" 
              strokeWidth={0} 
              fill="#10b981" 
              fillOpacity={0.1} 
            />
            <Area 
              type="monotone" 
              dataKey="Despesas" 
              stroke="#ef4444" 
              strokeWidth={0} 
              fill="#ef4444" 
              fillOpacity={0.1} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ 
        marginTop: 25, 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        padding: "16px",
        background: "linear-gradient(to right, #f8fafc, #ffffff)",
        borderRadius: 16,
        border: "1px solid #f1f5f9"
      }}>
        <div style={{ display: "flex", gap: 32 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Receita Realizada (Mês)</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#10b981" }}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedMonthData?.realIncome || 0)}
            </span>
            <span style={{ fontSize: 10, color: "#94a3b8" }}>Ref: {selectedMonthData?.month}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Despesa Realizada (Mês)</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#ef4444" }}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedMonthData?.realExpense || 0)}
            </span>
            <span style={{ fontSize: 10, color: "#94a3b8" }}>Ref: {selectedMonthData?.month}</span>
          </div>
        </div>
        
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Projeção Final</span>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#3b82f6" }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(projectedBalance)}
          </div>
        </div>
      </div>
    </div>
  );
}

