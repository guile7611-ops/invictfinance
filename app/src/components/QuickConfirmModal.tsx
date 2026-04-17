"use client";

import { useApp } from "@/context/AppContext";
import { CheckCircle2, Calendar, AlertTriangle, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function QuickConfirmModal() {
  const { quickConfirmTarget, closeQuickConfirm, confirmOccurrence } = useApp();
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    if (quickConfirmTarget) {
      setAmount(quickConfirmTarget.occurrence.amount);
      setDate(new Date().toISOString().split("T")[0]);
    }
  }, [quickConfirmTarget]);

  if (!quickConfirmTarget) return null;

  const { occurrence } = quickConfirmTarget;

  const handleConfirm = () => {
    confirmOccurrence(occurrence.id, amount, date);
    closeQuickConfirm();
  };

  return (
    <div className="modal-overlay" onClick={closeQuickConfirm}>
      <div className="modal-panel fade-up" style={{ maxWidth: 440, padding: 32 }}>
        <button 
          onClick={closeQuickConfirm}
          style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", color: "var(--gray-400)", cursor: "pointer" }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ 
            width: 64, 
            height: 64, 
            background: occurrence.type === "income" ? "var(--green-50)" : "#fef2f2",
            color: occurrence.type === "income" ? "var(--income)" : "var(--expense)",
            borderRadius: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px"
          }}>
            <Calendar size={32} />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--gray-900)" }}>Confirmação de Evento</h3>
          <p style={{ fontSize: 14, color: "var(--gray-500)", marginTop: 6 }}>
            Seu lançamento de <span style={{ fontWeight: 700 }}>{occurrence.title}</span> está previsto para hoje.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ 
            background: "var(--gray-50)", 
            padding: 16, 
            borderRadius: 12, 
            border: "1.5px solid var(--gray-100)" 
          }}>
            <div style={{ fontSize: 11, color: "var(--gray-400)", textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>
              Questão
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--gray-800)", lineHeight: 1.4 }}>
              {occurrence.type === "income" 
                ? `O valor de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(occurrence.amount)} foi recebido corretamente?`
                : `O pagamento de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(occurrence.amount)} foi realizado hoje?`}

            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-500)", display: "block", marginBottom: 6 }}>Valor Real</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, fontWeight: 600, color: "var(--gray-400)" }}>R$</span>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  style={{ 
                    width: "100%", 
                    padding: "10px 12px 10px 36px", 
                    borderRadius: 10, 
                    border: "1.5px solid var(--gray-200)", 
                    fontFamily: "inherit",
                    fontWeight: 700,
                    fontSize: 15
                  }}
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-500)", display: "block", marginBottom: 6 }}>Data</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ 
                  width: "100%", 
                  padding: "10px 12px", 
                  borderRadius: 10, 
                  border: "1.5px solid var(--gray-200)", 
                  fontFamily: "inherit",
                  fontSize: 14
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
            <button 
              className="btn-primary" 
              onClick={handleConfirm}
              style={{ 
                padding: "14px", 
                justifyContent: "center", 
                fontSize: 14,
                background: occurrence.type === "income" ? "var(--income)" : "var(--expense)"
              }}
            >
              <CheckCircle2 size={18} />
              {occurrence.type === "income" ? "Confirmar Recebimento" : "Confirmar Pagamento"}
            </button>
            <button 
              className="btn-outline" 
              onClick={closeQuickConfirm}
              style={{ padding: "14px", justifyContent: "center", fontSize: 14 }}
            >
              {occurrence.type === "income" ? "Ainda não recebi" : "Ainda não paguei"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
