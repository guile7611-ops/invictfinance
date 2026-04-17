import { useMemo } from "react";
import AnimatedCounter from "./AnimatedCounter";
import { useApp } from "@/context/AppContext";

export default function SavingsPanel() {
  const { monthlyEconomy, balance, transactions, monthlyIncome, selectedMonth } = useApp();
  
  // A meta de economia é baseada na porcentagem da receita mensal economizada
  const savingsPct = monthlyIncome > 0 ? Math.min(100, Math.max(0, Math.round((monthlyEconomy / monthlyIncome) * 100))) : 0;
  const isNegative = monthlyEconomy < 0;

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference - (Math.abs(savingsPct) / 100) * circumference;

  const dynamicCategoryData = useMemo(() => {
    const expenses = transactions.filter(t => 
      t.type === 'expense' && 
      t.status === 'completed' && 
      t.date.startsWith(selectedMonth)
    );

    const totalExp = expenses.reduce((acc, t) => acc + Math.abs(t.amount), 0);
    
    // Agrupar por categoria
    const grouped = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

    const colors: Record<string, string> = {
      "Alimentação": "#ef4444",
      "Moradia": "#3b82f6",
      "Transporte": "#f59e0b",
      "Lazer": "#10b981",
      "Saúde": "#8b5cf6",
      "Educação": "#6366f1",
      "Serviços": "#64748b",
      "Outros": "#94a3b8"
    };

    return Object.entries(grouped)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalExp > 0 ? Math.round((amount / totalExp) * 100) : 0,
        color: colors[name] || "#" + Math.random().toString(16).slice(2, 8).padEnd(6, '0')
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, selectedMonth]);

  return (
    <div className="card fade-up fade-up-6" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Savings Goal Ring */}
      <div>
        <div className="card-header" style={{ marginBottom: 16 }}>
          <div>
            <div className="card-title">Meta de Economia</div>
            <div className="card-subtitle">
              {new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(selectedMonth + "-02"))}
            </div>
          </div>
        </div>

        <div className="progress-ring-container">
          <div className="progress-ring">
            <svg width="150" height="150" viewBox="0 0 150 150" aria-label={`Economia: ${savingsPct}%`}>
              <circle
                cx="75"
                cy="75"
                r={radius}
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="12"
              />
              <circle
                cx="75"
                cy="75"
                r={radius}
                fill="none"
                stroke={isNegative ? "#ef4444" : "#1a5c3a"}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashoffset}
                transform="rotate(-90 75 75)"
                style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1)" }}
              />
              <circle
                cx="75"
                cy="75"
                r={radius - 16}
                fill="none"
                stroke={isNegative ? "#fee2e2" : "#dcfce7"}
                strokeWidth="1"
              />
            </svg>

            <div className="progress-ring-text">
              <div className="progress-pct" style={{ color: isNegative ? "#dc2626" : "var(--gray-900)" }}>{savingsPct}%</div>
              <div className="progress-label">{isNegative ? "déficit" : "da meta"}</div>
            </div>
          </div>

          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "var(--gray-500)" }}>Economia Real</span>
              <span style={{ fontWeight: 700, color: isNegative ? "#dc2626" : "var(--income)" }}>
                R$ <AnimatedCounter value={monthlyEconomy} decimals={2} />
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "var(--gray-500)" }}>Saldo Total</span>
              <span style={{ fontWeight: 600, color: "var(--gray-600)" }}>
                R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div style={{ height: 6, background: "var(--gray-100)", borderRadius: 99, marginTop: 4, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${Math.abs(savingsPct)}%`,
                  background: isNegative ? "linear-gradient(90deg, #b91c1c, #ef4444)" : "linear-gradient(90deg, #1a5c3a, #22c55e)",
                  borderRadius: 99,
                  transition: "width 1.4s cubic-bezier(0.4,0,0.2,1)",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: "var(--gray-100)" }} />

      <div>
        <div className="card-title" style={{ marginBottom: 14 }}>Gastos por Categoria</div>
        {dynamicCategoryData.length === 0 ? (
          <div style={{ padding: "20px 0", textAlign: "center", color: "var(--gray-400)", fontSize: 13 }}>
            Nenhum gasto registrado este mês.
          </div>
        ) : (
          <div className="category-list">
            {dynamicCategoryData.map((cat) => (
              <div key={cat.name} className="category-item">
                <div className="category-dot" style={{ background: cat.color }} />
                <span className="category-name">{cat.name}</span>
                <div className="category-bar-wrap">
                  <div
                    className="category-bar"
                    style={{ width: `${cat.percentage}%`, background: cat.color }}
                  />
                </div>
                <span className="category-amount">
                  R$ {cat.amount.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
