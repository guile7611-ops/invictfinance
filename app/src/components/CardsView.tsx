"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { 
  CreditCard, 
  Calendar, 
  Plus,
  ShoppingBag
} from "lucide-react";
import CardModal from "./CardModal";
import InstallmentModal from "./InstallmentModal";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip as ChartTooltip 
} from "recharts";
import { useMemo } from "react";

export default function CardsView() {
  const { 
    cards, 
    installments, 
    openCardModal, 
    openInstallmentModal,
    payCardBill
  } = useApp();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // Selecionar o primeiro cartão por padrão se nenhum estiver selecionado
  const activeCardId = selectedCardId || (cards.length > 0 ? cards[0].id : null);
  const selectedCard = cards.find(c => c.id === activeCardId);
  const totalBill = cards.reduce((acc, card) => acc + (card.currentBillAmount || 0), 0);

  // Dados para o gráfico de categorias do cartão selecionado
  const categoryData = useMemo(() => {
    if (!activeCardId) return [];
    const cardInst = installments.filter(inst => inst.cardId === activeCardId && inst.status === 'active');
    
    const categories: Record<string, number> = {};
    cardInst.forEach(inst => {
      const cat = inst.category || "Outros";
      categories[cat] = (categories[cat] || 0) + inst.totalAmount;
    });

    return Object.entries(categories).map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [installments, activeCardId]);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#6b7280"];

  return (
    <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--gray-900)" }}>Meus Cartões</h2>
          <p style={{ fontSize: 13, color: "var(--gray-500)" }}>Controle de limites, faturas e compras parceladas</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn-secondary" onClick={openInstallmentModal}>
            <ShoppingBag size={16} />
            Nova Compra
          </button>
          <button className="btn-primary" onClick={openCardModal}>
            <Plus size={16} />
            Novo Cartão
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Lado Esquerdo: Lista de Cartões Visuais */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {cards.length === 0 && (
            <div style={{ 
              padding: 32, 
              textAlign: "center", 
              background: "var(--gray-50)", 
              borderRadius: 20, 
              border: "2px dashed var(--gray-200)",
              color: "var(--gray-400)"
            }}>
              <CreditCard size={40} style={{ marginBottom: 12, opacity: 0.5 }} />
              <p style={{ fontSize: 14, fontWeight: 500 }}>Nenhum cartão cadastrado</p>
              <p style={{ fontSize: 12 }}>Adicione um cartão para começar</p>
            </div>
          )}
          {cards.map((card) => (
            <div 
              key={card.id} 
              className={`card ${activeCardId === card.id ? 'active-card-glow' : ''}`} 
              onClick={() => setSelectedCardId(card.id)}
              style={{ 
                background: `linear-gradient(135deg, ${card.color}, ${card.color}dd)`, 
                color: "white",
                padding: 24,
                borderRadius: 20,
                minHeight: 200,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: activeCardId === card.id ? `0 0 0 3px white, 0 10px 30px -5px ${card.color}88` : "0 10px 25px -10px rgba(0,0,0,0.3)",
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: activeCardId === card.id ? "scale(1.02)" : "scale(1)"
              }}
            >
              <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, background: "rgba(255,255,255,0.1)", borderRadius: "50%" }} />
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>{card.bank || "Banco"}</div>
                  <div style={{ fontSize: 14, opacity: 0.9, fontWeight: 500 }}>{card.name}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, marginTop: 8, letterSpacing: 2 }}>•••• •••• •••• {card.lastFourDigits || "0000"}</div>
                </div>
                <div style={{ fontSize: 24, opacity: 0.9 }}>
                  {card.brand === "visa" && "Visa"}
                  {card.brand === "mastercard" && "MasterCard"}
                  {card.brand === "elo" && "Elo"}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, opacity: 0.7, textTransform: "uppercase", fontWeight: 700 }}>Limite Utilizado</div>
                <div style={{ fontSize: 24, fontWeight: 800 }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(card.usedLimit)}
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.2)", borderRadius: 2, marginTop: 12, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(card.usedLimit / Math.max(1, card.limit)) * 100}%`, background: "white" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, opacity: 0.8 }}>
                  <span>{(card.usedLimit / Math.max(1, card.limit) * 100).toFixed(0)}% do limite</span>
                  <span>Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(card.limit)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lado Direito: Detalhes da Fatura e Parcelamentos */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {cards.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  {selectedCard?.isPaid ? "Resumo da Próxima Fatura" : "Resumo da Fatura Atual"}
                </h3>
                <span 
                  className="status-badge" 
                  style={{ 
                    background: selectedCard?.isPaid ? "var(--green-50)" : "#fef3c7", 
                    color: selectedCard?.isPaid ? "var(--green-600)" : "#92400e" 
                  }}
                >
                  {selectedCard?.isPaid ? "Paga" : "Aberta"}
                </span>
              </div>
              
              <div className="dashboard-grid" style={{ marginTop: 10 }}>
                <div>
                  <div style={{ fontSize: 12, color: "var(--gray-400)", marginBottom: 4 }}>Total a pagar ({selectedCard?.name})</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "var(--gray-900)" }}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedCard?.currentBillAmount || 0)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--gray-400)", marginBottom: 4 }}>Vencimento</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "var(--gray-700)", display: "flex", alignItems: "center", gap: 8 }}>
                    <Calendar size={18} style={{ color: selectedCard?.isPaid ? "var(--green-500)" : "var(--expense)" }} />
                    {selectedCard?.dueDay || 20} de {
                      new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(
                        selectedCard?.isPaid 
                          ? new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
                          : new Date()
                      )
                    }
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <button 
                    className="btn-primary" 
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={() => selectedCard && payCardBill(selectedCard.id)}
                    disabled={!selectedCard || selectedCard.currentBillAmount <= 0}
                  >
                    Pagar Fatura
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Análise de Categorias do Cartão Selecionado */}
          {selectedCard && categoryData.length > 0 && (
            <div className="card fade-up fade-up-2">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Distribuição do Limite ({selectedCard.name})</h3>
                  <div className="card-subtitle">Onde seu limite está comprometido</div>
                </div>
                <ShoppingBag size={18} style={{ color: "var(--gray-400)" }} />
              </div>
              
              <div className="dashboard-grid" style={{ alignItems: "center", padding: "10px 0" }}>
                <div style={{ height: 200, position: "relative" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                        ))}
                      </Pie>
                      <ChartTooltip 
                        contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ 
                    position: "absolute", 
                    top: "50%", 
                    left: "50%", 
                    transform: "translate(-50%, -50%)",
                    textAlign: "center"
                  }}>
                    <div style={{ fontSize: 10, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: 1 }}>Total</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "var(--gray-900)" }}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(selectedCard.usedLimit)}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {categoryData.slice(0, 5).map((cat, i) => (
                    <div key={cat.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS[i % COLORS.length] }} />
                        <span style={{ fontSize: 13, color: "var(--gray-600)", fontWeight: 500 }}>{cat.name}</span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gray-900)" }}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cat.value)}
                        <span style={{ fontSize: 11, color: "var(--gray-400)", fontWeight: 400, marginLeft: 8 }}>
                          ({((cat.value / Math.max(1, selectedCard.usedLimit)) * 100).toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                  {categoryData.length > 5 && (
                    <div style={{ fontSize: 11, color: "var(--gray-400)", textAlign: "center", marginTop: 4 }}>
                      + {categoryData.length - 5} outras categorias
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Compras Parceladas Ativas</h3>
              <button style={{ background: "none", border: "none", color: "var(--green-600)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Ver todas</button>
            </div>
            
            <table style={{ width: "100%", marginTop: 12 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", fontSize: 11, color: "var(--gray-400)", fontWeight: 600, paddingBottom: 10 }}>COMPRA</th>
                  <th style={{ textAlign: "left", fontSize: 11, color: "var(--gray-400)", fontWeight: 600, paddingBottom: 10 }}>PARCELA</th>
                  <th style={{ textAlign: "right", fontSize: 11, color: "var(--gray-400)", fontWeight: 600, paddingBottom: 10 }}>VALOR PARCELA</th>
                </tr>
              </thead>
              <tbody>
                {installments
                  .filter(i => i.status === "active" && (selectedCard ? i.cardId === selectedCard.id : true))
                  .map(i => (
                    <tr key={i.id} style={{ borderBottom: "1px solid var(--gray-50)" }}>
                      <td style={{ padding: "12px 0" }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--gray-800)" }}>{i.description}</div>
                        <div style={{ fontSize: 11, color: "var(--gray-400)" }}>{i.category}</div>
                      </td>
                      <td style={{ fontSize: 13, color: "var(--gray-600)" }}>
                        {i.currentInstallment} / {i.totalInstallments}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 700, color: "var(--gray-900)", fontSize: 14 }}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(i.installmentAmount)}
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
