import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { 
  Plus, 
  Target, 
  Calendar, 
  TrendingUp, 
  ArrowRight,
  ChevronRight,
  MoreHorizontal,
  Trash2,
  DollarSign
} from "lucide-react";

export default function GoalsView() {
  const { goals, contributeToGoal, openGoalModal, removeGoal } = useApp();
  const [contributeAmounts, setContributeAmounts] = useState<Record<string, string>>({});

  const handleContributeChange = (id: string, value: string) => {
    setContributeAmounts(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--gray-900)" }}>Metas Financeiras</h2>
          <p style={{ fontSize: 13, color: "var(--gray-500)" }}>Acompanhe o progresso dos seus sonhos e reservas</p>
        </div>
        <button className="btn-primary" onClick={openGoalModal}>
          <Plus size={16} />
          Nova Meta
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: 20 }}>
        {goals.map((goal) => {
          const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
          const isCompleted = progress >= 100;
          const currentContribution = contributeAmounts[goal.id] || "";

          return (
            <div key={goal.id} className="card" style={{ 
              position: "relative", 
              overflow: "hidden",
              transition: "transform 0.2s ease, box-shadow 0.2s ease"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ display: "flex", gap: 14 }}>
                  <div style={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: 14, 
                    background: `${goal.color || '#2563eb'}15`, 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    fontSize: 24
                  }}>
                    {goal.emoji || '🎯'}
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: 16, color: "var(--gray-900)" }}>{goal.title}</h3>
                    <div style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 2 }}>{goal.category}</div>
                  </div>
                </div>
                <button 
                  onClick={() => { if(confirm("Remover esta meta?")) removeGoal(goal.id); }}
                  style={{ background: "none", border: "none", color: "var(--gray-300)", cursor: "pointer" }}
                  className="hover-danger"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
                  <div>
                    <span style={{ fontSize: 20, fontWeight: 800, color: "var(--gray-900)" }}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal.currentAmount)}
                    </span>
                    <span style={{ fontSize: 13, color: "var(--gray-400)", marginLeft: 6 }}>de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal.targetAmount)}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: isCompleted ? "var(--income)" : (goal.color || '#2563eb') }}>
                    {progress.toFixed(0)}%
                  </div>
                </div>
                
                <div style={{ height: 10, background: "var(--gray-100)", borderRadius: 5, overflow: "hidden" }}>
                  <div style={{ 
                    height: "100%", 
                    width: `${progress}%`, 
                    background: isCompleted ? "var(--income)" : (goal.color || '#2563eb'),
                    borderRadius: 5,
                    transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)"
                  }} />
                </div>
              </div>

              {!isCompleted && (
                <div style={{ 
                  display: "flex", 
                  gap: 8, 
                  marginTop: 16, 
                  padding: "16px 0",
                  borderTop: "1px solid var(--gray-50)"
                }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)", fontSize: 12 }}>R$</span>
                    <input 
                      type="number" 
                      placeholder="Valor aporte"
                      value={currentContribution}
                      onChange={(e) => handleContributeChange(goal.id, e.target.value)}
                      style={{ 
                        width: "100%", 
                        padding: "8px 8px 8px 28px", 
                        borderRadius: 8, 
                        border: "1px solid var(--gray-200)",
                        fontSize: 13
                      }}
                    />
                  </div>
                  <button 
                    onClick={() => {
                      const amount = parseFloat(currentContribution);
                      if (amount > 0) {
                        contributeToGoal(goal.id, amount);
                        handleContributeChange(goal.id, "");
                      }
                    }}
                    className="btn-primary" 
                    disabled={!currentContribution}
                    style={{ padding: "8px 16px", fontSize: 13 }}
                  >
                    Aportar
                  </button>
                </div>
              )}

              {isCompleted && (
                <div style={{ 
                  marginTop: 16, 
                  padding: "10px", 
                  background: "var(--green-50)", 
                  color: "var(--income)",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8
                }}>
                  <Target size={14} />
                  Meta alcançada! Parabéns!
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
