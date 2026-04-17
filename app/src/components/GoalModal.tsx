"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { X, Save, Loader2, Calendar } from "lucide-react";

export default function GoalModal() {
  const { isGoalModalOpen, closeGoalModal, addGoal } = useApp();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    targetAmount: "",
    currentAmount: "",
    category: "Reserva",
    deadline: "",
    emoji: "🎯",
    color: "#2563eb"
  });

  const emojis = ["🎯", "🏠", "🚗", "✈️", "💰", "💍", "👶", "🎓", "🌱", "🏖️"];
  const colors = ["#2563eb", "#16a34a", "#dc2626", "#d97706", "#7c3aed", "#db2777"];

  if (!isGoalModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addGoal({
        ...formData,
        targetAmount: Number(formData.targetAmount),
        currentAmount: Number(formData.currentAmount || 0),
        autoContribute: false,
        createdAt: new Date().toISOString()
      } as any);
      closeGoalModal();
      setFormData({
        title: "",
        targetAmount: "",
        currentAmount: "",
        category: "Reserva",
        deadline: "",
        emoji: "🎯",
        color: "#2563eb"
      });
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar meta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={closeGoalModal}>
      <div 
        className="modal-panel" 
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 500, padding: 0 }}
      >
        {/* Header - Padronizado com TransactionModal */}
        <div style={{ 
          background: formData.color, 
          padding: "24px 32px", 
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          transition: "background 0.3s ease"
        }}>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 800 }}>Nova Meta Financeira</h3>
            <div style={{ fontSize: 13, opacity: 0.8, marginTop: 2 }}>Defina seus objetivos e prazos</div>
          </div>
          <button onClick={closeGoalModal} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", padding: 8, borderRadius: "50%", cursor: "pointer", display: "flex" }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form" style={{ padding: 32 }}>
          <div className="form-group">
            <label className="form-label">Título da Meta</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: Reserva de Emergência, Viagem..."
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Valor Objetivo</label>
              <div style={{ position: "relative" }}>
                <span className="input-prefix">R$</span>
                <input
                  type="number"
                  step="0.01"
                  className="form-input form-input-prefixed"
                  placeholder="0,00"
                  required
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Já tenho guardado</label>
              <div style={{ position: "relative" }}>
                <span className="input-prefix">R$</span>
                <input
                  type="number"
                  step="0.01"
                  className="form-input form-input-prefixed"
                  placeholder="0,00"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Prazo (Opcional)</label>
              <div style={{ position: "relative" }}>
                <Calendar size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
                <input
                  type="date"
                  className="form-input"
                  style={{ paddingLeft: 36 }}
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Categoria</label>
              <select 
                className="form-input form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Reserva">Reserva</option>
                <option value="Sonho">Sonho</option>
                <option value="Bens">Bens</option>
                <option value="Aposentadoria">Aposentadoria</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Emoji e Cor da Meta</label>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <select 
                className="form-input form-select" 
                style={{ width: 85, fontSize: 20, textAlign: "center", paddingRight: 28 }}
                value={formData.emoji}
                onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
              >
                {emojis.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
              <div style={{ display: "flex", gap: 10, flex: 1, justifyContent: "space-between" }}>
                {colors.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: c })}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: c,
                      border: "2px solid white",
                      boxShadow: formData.color === c ? `0 0 0 2px ${c}` : "0 2px 4px rgba(0,0,0,0.1)",
                      cursor: "pointer",
                      padding: 0,
                      transition: "all 0.2s ease"
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ 
              width: "100%", 
              padding: "18px", 
              borderRadius: 14, 
              fontSize: 16,
              fontWeight: 800,
              marginTop: 10,
              background: formData.color,
              borderColor: formData.color,
              boxShadow: `0 10px 20px ${formData.color}33`
            }}
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {loading ? "Salvando..." : "Criar Meta Financeira"}
          </button>
        </form>
      </div>
    </div>
  );
}
