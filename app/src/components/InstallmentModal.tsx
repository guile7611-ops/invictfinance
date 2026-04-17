"use client";

import React, { useState } from "react";
import { X, CreditCard, ShoppingBag, Calendar, DollarSign } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function InstallmentModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { cards, addInstallment } = useApp();
  const [description, setDescription] = useState("");
  const [totalAmount, setTotalAmount] = useState<number | "">("");
  const [installmentAmount, setInstallmentAmount] = useState<number | "">("");
  const [totalInstallments, setTotalInstallments] = useState<number>(12);
  const [cardId, setCardId] = useState(cards[0]?.id || "");
  const [category, setCategory] = useState("Shopping");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Selecionar primeiro cartão automaticamente se disponível
  React.useEffect(() => {
    if (cards.length > 0 && !cardId) {
      setCardId(cards[0].id);
    }
  }, [cards, cardId]);

  if (!isOpen) return null;

  // Lógica de Recálculo
  const handleTotalChange = (val: string) => {
    const num = parseFloat(val) || 0;
    setTotalAmount(num || "");
    if (totalInstallments > 0) {
      setInstallmentAmount(parseFloat((num / totalInstallments).toFixed(2)));
    }
  };

  const handleInstallmentValueChange = (val: string) => {
    const num = parseFloat(val) || 0;
    setInstallmentAmount(num || "");
    setTotalAmount(parseFloat((num * totalInstallments).toFixed(2)));
  };

  const handleInstallmentsCountChange = (val: string) => {
    const count = parseInt(val) || 1;
    setTotalInstallments(count);
    if (installmentAmount) {
      setTotalAmount(parseFloat((Number(installmentAmount) * count).toFixed(2)));
    } else if (totalAmount) {
      setInstallmentAmount(parseFloat((Number(totalAmount) / count).toFixed(2)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totalAmount || !installmentAmount || !cardId) {
      alert("Por favor, preencha todos os campos e selecione um cartão.");
      return;
    }
    setIsSaving(true);
    try {
      await addInstallment({
        description,
        totalAmount: Number(totalAmount),
        installmentAmount: Number(installmentAmount),
        totalInstallments: totalInstallments,
        currentInstallment: 1,
        cardId,
        category,
        startDate,
        status: 'active'
      });
      onClose();
      setDescription("");
      setTotalAmount("");
      setInstallmentAmount("");
      setTotalInstallments(1);
    } catch (error) {
      console.error("Erro ao salvar parcelamento:", error);
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
              <ShoppingBag size={20} />
            </div>
            <h2 className="modal-title">Nova Compra</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Descrição da Compra</label>
            <input 
              className="form-input" 
              placeholder="Ex: iPhone 15 Pro" 
              required 
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Cartão Utilizado</label>
            <select 
              className="form-input" 
              required 
              value={cardId}
              onChange={e => setCardId(e.target.value)}
            >
              <option value="">Selecione um cartão</option>
              {cards.map(card => (
                <option key={card.id} value={card.id}>{card.name} (•••• {card.lastFourDigits})</option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Nº de Parcelas</label>
              <input 
                type="number" 
                className="form-input" 
                min="1" max="99" 
                required 
                value={totalInstallments}
                onChange={e => handleInstallmentsCountChange(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Valor de cada parcela</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "var(--gray-400)" }}>R$</span>
                <input 
                  type="number" 
                  className="form-input" 
                  style={{ paddingLeft: 35 }} 
                  placeholder="0,00" 
                  step="0.01" 
                  required 
                  value={installmentAmount}
                  onChange={e => handleInstallmentValueChange(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Valor Total {totalInstallments > 1 && "(com juros se houver)"}</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "var(--gray-400)" }}>R$</span>
              <input 
                type="number" 
                className="form-input" 
                style={{ paddingLeft: 35, fontWeight: 700, background: "var(--gray-50)" }} 
                placeholder="0,00" 
                step="0.01" 
                required 
                value={totalAmount}
                onChange={e => handleTotalChange(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Data da Compra</label>
              <input 
                type="date" 
                className="form-input" 
                required 
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Categoria</label>
              <select 
                className="form-input"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option value="Shopping">Shopping</option>
                <option value="Eletrônicos">Eletrônicos</option>
                <option value="Alimentação">Alimentação</option>
                <option value="Saúde">Saúde</option>
                <option value="Serviços">Serviços</option>
                <option value="Lazer">Lazer</option>
                <option value="Casa">Casa</option>
                <option value="Outros">Outros</option>
              </select>
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
              {isSaving ? "Salvando..." : "Salvar Compra"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
