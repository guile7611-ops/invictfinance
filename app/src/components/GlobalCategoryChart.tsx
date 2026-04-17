"use client";

import { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend
} from "recharts";
import { PieChart as PieIcon, TrendingDown } from "lucide-react";

const COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444", 
  "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"
];

export default function GlobalCategoryChart() {
  const { transactions, recurrences, installments, occurrences, selectedMonth } = useApp();

  const data = useMemo(() => {
    const totals: Record<string, number> = {};

    // 1. Somar transações concluídas do mês selecionado
    transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(selectedMonth) && t.status === 'completed')
      .forEach(t => {
        totals[t.category] = (totals[t.category] || 0) + Math.abs(t.amount);
      });

    // 2. Somar ocorrências previstas/pendentes para o mês selecionado
    occurrences
      .filter(o => o.type === 'expense' && o.dueDate.startsWith(selectedMonth))
      .forEach(o => {
        totals[o.category] = (totals[o.category] || 0) + o.amount;
      });

    return Object.entries(totals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, occurrences, selectedMonth]);

  const totalExpense = data.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0) {
    return (
      <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 350 }}>
        <div style={{ textAlign: "center", color: "var(--gray-400)" }}>
          <PieIcon size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
          <p>Sem dados de gastos para este mês</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card fade-up fade-up-4" style={{ minHeight: 400, position: "relative" }}>
      <div className="card-header">
        <div>
          <div className="card-title">Onde seu dinheiro está indo</div>
          <div className="card-subtitle">Análise consolidada (À vista + Cartão + Fixas)</div>
        </div>
        <div className="icon-container" style={{ background: "var(--expense-light)", color: "var(--expense)" }}>
          <TrendingDown size={18} />
        </div>
      </div>

      <div style={{ height: 260, width: "100%", marginTop: 10 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={95}
              paddingAngle={4}
              dataKey="value"
              animationBegin={0}
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.2)" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
              formatter={(value: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div style={{ 
        textAlign: "center", 
        padding: "16px 0",
        borderBottom: "1px solid var(--gray-100)",
        marginBottom: 16
      }}>
        <div style={{ fontSize: 11, color: "var(--gray-400)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Gasto Total do Mês</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: "var(--gray-900)" }}>
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalExpense)}
        </div>
      </div>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr", 
        gap: "8px 16px", 
        marginTop: 10,
        padding: "0 10px"
      }}>
        {data.slice(0, 4).map((item, index) => (
          <div key={item.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[index % COLORS.length] }} />
              <span style={{ fontSize: 12, color: "var(--gray-600)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 80 }}>{item.name}</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-900)" }}>
              {((item.value / totalExpense) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
