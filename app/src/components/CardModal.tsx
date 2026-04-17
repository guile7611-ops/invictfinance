"use client";

import React, { useState } from "react";
import { X, CreditCard, Wallet, Palette } from "lucide-react";
import { useApp } from "@/context/AppContext";

const COLORS = [
  "#10b981", "#3b82f6", "#ef4444", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"
];

export default function CardModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { addCard } = useApp();
  const [name, setName] = useState("");
  const [bank, setBank] = useState("");
  const [limit, setLimit] = useState("");
  const [balance, setBalance] = useState("0");
  const [isSaving, setIsSaving] = useState(false);
  const [lastFour, setLastFour] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [type, setType] = useState<"credit" | "debit">("credit");
  const [closingDay, setClosingDay] = useState("10");
  const [dueDay, setDueDay] = useState("20");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await addCard({
        name,
        bank,
        limit: parseFloat(limit),
        balance: parseFloat(balance),
        lastFourDigits: lastFour,
        color,
        type,
        closingDay: parseInt(closingDay),
        dueDay: parseInt(dueDay)
      });
      onClose();
      // Reset
      setName("");
      setBank("");
      setLimit("");
      setBalance("0");
      setLastFour("");
    } catch (error) {
      console.error("Erro detalhado ao salvar cartão:", error);
      alert("Erro ao salvar cartão. Verifique o console.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1000 }}>
      <div className="modal-panel fade-up" style={{ maxWidth: 450 }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="icon-container" style={{ background: "var(--green-50)", color: "var(--green-600)" }}>
              <CreditCard size={20} />
            </div>
            <h2 className="modal-title">Novo Cartão</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Nome do Cartão (ex: Nubank, Inter)</label>
            <input 
              className="form-input" 
              placeholder="Ex: Cartão Principal" 
              required 
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Banco</label>
              <input 
                className="form-input" 
                placeholder="Ex: Nubank" 
                value={bank}
                onChange={e => setBank(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Últimos 4 Dígitos</label>
              <input 
                className="form-input" 
                placeholder="Ex: 1234" 
                maxLength={4}
                value={lastFour}
                onChange={e => setLastFour(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Limite Total</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "var(--gray-400)" }}>R$</span>
                <input 
                  type="number" 
                  className="form-input" 
                  style={{ paddingLeft: 35 }} 
                  placeholder="0,00" 
                  step="0.01" 
                  required 
                  value={limit}
                  onChange={e => setLimit(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Saldo Atual (Utilizado)</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "var(--gray-400)" }}>R$</span>
                <input 
                  type="number" 
                  className="form-input" 
                  style={{ paddingLeft: 35 }} 
                  placeholder="0,00" 
                  step="0.01" 
                  value={balance}
                  onChange={e => setBalance(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Fechamento (Dia)</label>
              <input 
                type="number" 
                className="form-input" 
                min="1" max="31"
                value={closingDay}
                onChange={e => setClosingDay(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Vencimento (Dia)</label>
              <input 
                type="number" 
                className="form-input" 
                min="1" max="31"
                value={dueDay}
                onChange={e => setDueDay(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Cor do Cartão</label>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: c,
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    boxShadow: color === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : "none",
                    transform: color === c ? "scale(1.15)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 12 }}>
            <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ flex: 1, justifyContent: "center" }}
              disabled={isSaving}
            >
              {isSaving ? "Salvando..." : "Salvar Cartão"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
