import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  AlertTriangle,
  ArrowUpCircle,
  ArrowDownCircle,
  Edit3,
  Search,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  RefreshCw
} from "lucide-react";
import { format, addMonths, startOfMonth, endOfMonth, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PendingView() {
  const { occurrences, confirmOccurrence, updateOccurrenceStatus, openQuickConfirm } = useApp();
  
  const currentMonthName = format(new Date(), "MMMM 'de' yyyy", { locale: ptBR });
  
  // Lista de todos os meses de AGORA até DEZEMBRO do ano atual
  const allMonthsUntilDecember = useMemo(() => {
    const months: string[] = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    
    let tempDate = startOfMonth(now);
    while (tempDate.getFullYear() === currentYear) {
      months.push(format(tempDate, "MMMM 'de' yyyy", { locale: ptBR }));
      tempDate = addMonths(tempDate, 1);
    }
    return months;
  }, []);

  const [expandedMonths, setExpandedMonths] = useState<string[]>([currentMonthName]);

  const toggleMonth = (month: string) => {
    setExpandedMonths(prev => 
      prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
    );
  };

  const expandAll = () => setExpandedMonths(allMonthsUntilDecember);
  const collapseAll = () => setExpandedMonths([]);

  const groupedPending = useMemo(() => {
    // Inicializa todos os meses até dezembro com arrays vazios
    const groups: Record<string, typeof occurrences> = {};
    allMonthsUntilDecember.forEach(m => groups[m] = []);
    
    // Aloca as ocorrências reais nos meses correspondentes
    occurrences.forEach(o => {
      const monthStr = format(new Date(o.dueDate), "MMMM 'de' yyyy", { locale: ptBR });
      if (groups[monthStr]) {
        groups[monthStr].push(o);
      }
    });

    return Object.entries(groups);
  }, [occurrences, allMonthsUntilDecember]);

  return (
    <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--gray-900)" }}>Recorrências Anuais</h2>
          <p style={{ fontSize: 13, color: "var(--gray-500)" }}>Planejamento e confirmação de fluxo recorrente até dezembro</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button 
            onClick={expandAll}
            className="btn-outline" 
            style={{ padding: "8px 12px", fontSize: 12, gap: 6 }}
          >
            <Maximize2 size={14} />
            Expandir Tudo
          </button>
          <button 
            onClick={collapseAll}
            className="btn-outline" 
            style={{ padding: "8px 12px", fontSize: 12, gap: 6 }}
          >
            <Minimize2 size={14} />
            Recolher Tudo
          </button>
        </div>
      </div>

      {groupedPending.length === 0 ? (
        <div className="card" style={{ padding: "60px 20px", textAlign: "center", color: "var(--gray-400)" }}>
          <RefreshCw size={48} style={{ margin: "0 auto 16px", color: "var(--green-300)" }} />
          <h3 style={{ color: "var(--gray-700)", fontWeight: 600 }}>Tudo pronto!</h3>
          <p style={{ fontSize: 14 }}>Nenhuma recorrência ativa encontrada.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {groupedPending.map(([month, items]) => {
            const isExpanded = expandedMonths.includes(month);
            const totalAmount = items.reduce((acc, current) => acc + (current.type === 'income' ? current.amount : -current.amount), 0);
            const isCurrentMonth = month === currentMonthName;
            
            const isDarkBg = isCurrentMonth || isExpanded;
            const textColor = isDarkBg ? "white" : "var(--gray-700)";
            const mutedTextColor = isDarkBg ? "rgba(255,255,255,0.6)" : "var(--gray-400)";

            return (
              <div key={month} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {/* Header Acordeão */}
                <div 
                  onClick={() => toggleMonth(month)}
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 12, 
                    padding: "16px 20px",
                    background: isCurrentMonth ? "var(--sidebar-bg)" : isExpanded ? "var(--gray-800)" : "white",
                    borderRadius: 12,
                    border: "1px solid var(--gray-100)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: isExpanded ? "0 4px 12px rgba(0, 0, 0, 0.1)" : "none"
                  }}
                  className="hover-scale"
                >
                  <div style={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: 8, 
                    background: isDarkBg ? "rgba(255,255,255,0.1)" : "var(--gray-50)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: isDarkBg ? "white" : "var(--gray-400)"
                  }}>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <span style={{ 
                      fontSize: 14, 
                      fontWeight: 700, 
                      color: textColor, 
                      textTransform: "uppercase",
                      letterSpacing: "0.02em",
                      display: "flex",
                      alignItems: "center",
                      gap: 8
                    }}>
                      {month}
                      {isCurrentMonth && (
                        <span style={{ 
                          fontSize: 9, 
                          background: "var(--green-500)", 
                          color: "white", 
                          padding: "2px 6px", 
                          borderRadius: 4,
                          letterSpacing: 0
                        }}>ATUAL</span>
                      )}
                    </span>
                    <div style={{ 
                      fontSize: 11, 
                      color: mutedTextColor,
                      fontWeight: 500
                    }}>
                      {items.length} {items.length === 1 ? 'recorrência' : 'recorrências'}
                    </div>
                  </div>

                  {items.length > 0 && (
                    <div style={{ textAlign: "right" }}>
                      <div style={{ 
                        fontSize: 10, 
                        color: mutedTextColor, 
                        fontWeight: 600, 
                        textTransform: "uppercase" 
                      }}>Fluxo Estimado</div>
                      <div style={{ 
                        fontSize: 14, 
                        fontWeight: 800, 
                        color: isDarkBg ? "white" : totalAmount >= 0 ? "var(--income)" : "var(--expense)" 
                      }}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Itens do Acordeão */}
                {isExpanded && (
                  <div className="fade-down" style={{ display: "grid", gap: 8, padding: "4px 0 16px" }}>
                    {items.length === 0 ? (
                      <div style={{ 
                        marginLeft: 44, 
                        padding: "16px", 
                        border: "1px dashed var(--gray-200)", 
                        borderRadius: 12,
                        fontSize: 13,
                        color: "var(--gray-400)",
                        textAlign: "center"
                      }}>
                        Nenhuma recorrência prevista para este mês.
                      </div>
                    ) : (
                      items.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map((o) => (
                        <div key={o.id} className="card" style={{ 
                          display: "grid", 
                          gridTemplateColumns: "1fr auto auto", 
                          alignItems: "center", 
                          gap: 20,
                          padding: "16px 24px",
                          borderLeft: `4px solid ${o.status === "overdue" ? "var(--expense)" : o.status === "pending" ? "#d97706" : "var(--gray-200)"}`,
                          marginLeft: 12,
                          background: "white",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <div className="transaction-icon" style={{ 
                              background: o.type === "income" ? "var(--green-50)" : "#fef2f2",
                              color: o.type === "income" ? "var(--income)" : "var(--expense)"
                            }}>
                              {o.type === "income" ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                            </div>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontWeight: 700, fontSize: 15, color: "var(--gray-900)" }}>{o.title}</span>
                                {o.status === "overdue" && (
                                  <span style={{ 
                                    background: "#fee2e2", 
                                    color: "#ef4444", 
                                    fontSize: 10, 
                                    fontWeight: 700, 
                                    padding: "2px 6px", 
                                    borderRadius: 4,
                                    textTransform: "uppercase" 
                                  }}>Atrasado</span>
                                )}
                              </div>
                              <div style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 2, display: "flex", alignItems: "center", gap: 12 }}>
                                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                  <Calendar size={13} />
                                  {format(new Date(o.dueDate), "dd 'de' MMMM", { locale: ptBR })}
                                </span>
                                <span style={{ color: "var(--gray-300)" }}>•</span>
                                <span>{o.category}</span>
                              </div>
                            </div>
                          </div>

                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 11, color: "var(--gray-400)", textTransform: "uppercase", fontWeight: 600 }}>Valor</div>
                            <div style={{ 
                              fontSize: 18, 
                              fontWeight: 800, 
                              color: o.type === "income" ? "var(--income)" : "var(--gray-800)" 
                            }}>
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(o.amount)}
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: 8 }}>
                            <button 
                              className="btn-primary" 
                              onClick={() => openQuickConfirm(o)}
                              style={{ background: "var(--sidebar-bg)", padding: "10px 18px" }}
                            >
                              <CheckCircle2 size={16} />
                              Confirmar
                            </button>
                            <button className="btn-outline" style={{ padding: "10px" }} title="Editar valor/data">
                              <Edit3 size={16} />
                            </button>
                            <button 
                              className="btn-outline" 
                              style={{ padding: "10px", borderColor: "var(--gray-200)" }}
                              onClick={() => updateOccurrenceStatus(o.id, "ignored")}
                              title="Ignorar este mês"
                            >
                              <XCircle size={16} style={{ color: "var(--gray-400)" }} />
                            </button>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
