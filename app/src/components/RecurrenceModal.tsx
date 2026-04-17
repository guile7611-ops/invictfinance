"use client";

import { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { 
  X, 
  Calendar, 
  Tag, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Clock, 
  DollarSign,
  AlertCircle,
  Repeat,
  Check,
  Loader2,
  Save
} from "lucide-react";

export default function RecurrenceModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { addRecurrence, updateRecurrence, editingRecurrence } = useApp();
  const overlayRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("Moradia");
  const [dayOfMonth, setDayOfMonth] = useState(new Date().getDate());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingRecurrence) {
        setTitle(editingRecurrence.title);
        setAmount(editingRecurrence.amount.toString());
        setType(editingRecurrence.type);
        setCategory(editingRecurrence.category);
        setDayOfMonth(editingRecurrence.dayOfMonth || 15);
      } else {
        setTitle("");
        setAmount("");
        setType("expense");
        setCategory("Moradia");
        setDayOfMonth(new Date().getDate());
      }
      setLoading(false);
    }
  }, [isOpen, editingRecurrence]);

  const categories = [
    "Moradia", "Alimentação", "Transporte", "Saúde", "Lazer", "Educação", 
    "Renda", "Investimentos", "Assinaturas", "Outros"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    setLoading(true);
    try {
      const data = {
        title,
        amount: parseFloat(amount),
        type,
        category,
        dayOfMonth,
        frequency: "monthly" as any,
        status: editingRecurrence?.status || "active",
        nextDueDate: new Date(new Date().setDate(dayOfMonth)).toISOString().split('T')[0]
      };

      if (editingRecurrence) {
        await updateRecurrence(editingRecurrence.id, {
          title: data.title,
          amount: data.amount,
          type: data.type,
          category: data.category,
          dayOfMonth: data.dayOfMonth,
          nextDueDate: data.nextDueDate
        });
      } else {
        await addRecurrence(data);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Erro ao salvar recorrência.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === overlayRef.current && onClose()} ref={overlayRef}>
      <div className="modal-panel">
        {/* Header */}
        <div style={{ 
          background: type === "income" ? "var(--income)" : "var(--expense)", 
          padding: "24px 32px", 
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 800 }}>
              {editingRecurrence 
                ? (type === "income" ? "Editar Receita Recorrente" : "Editar Gasto Fixo")
                : (type === "income" ? "Nova Receita Recorrente" : "Novo Gasto Fixo")}
            </h3>
            <div style={{ fontSize: 13, opacity: 0.8, marginTop: 2 }}>
              {editingRecurrence ? "Atualizar configurações do lançamento mensal" : (type === "income" ? "Configurar entrada automática mensal" : "Configurar pagamento automático mensal")}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", padding: 8, borderRadius: "50%", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 32, display: "flex", flexDirection: "column", gap: 20, background: "white" }}>
          {/* Type Selector Toggle (Style Match) */}
          <div style={{ display: "flex", gap: 8, background: "#f8fafc", padding: 4, borderRadius: 12, border: "1px solid #e2e8f0" }}>
            <button 
              type="button" 
              onClick={() => setType("income")} 
              style={{ 
                flex: 1, padding: "12px", borderRadius: 10, border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 14, fontWeight: 700,
                background: type === "income" ? "white" : "transparent",
                color: type === "income" ? "var(--income)" : "#94a3b8",
                boxShadow: type === "income" ? "0 4px 12px rgba(0,0,0,0.05)" : "none",
                transition: "all 0.2s"
              }}
            >
              <ArrowUpCircle size={18} /> Receita
            </button>
            <button 
              type="button" 
              onClick={() => setType("expense")} 
              style={{ 
                flex: 1, padding: "12px", borderRadius: 10, border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 14, fontWeight: 700,
                background: type === "expense" ? "white" : "transparent",
                color: type === "expense" ? "var(--expense)" : "#94a3b8",
                boxShadow: type === "expense" ? "0 4px 12px rgba(0,0,0,0.05)" : "none",
                transition: "all 0.2s"
              }}
            >
              <ArrowDownCircle size={18} /> Gasto Fixo
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginLeft: 4 }}>Descrição</label>
            <input 
              type="text" 
              placeholder="Ex: Aluguel, Salário, Internet..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ width: "100%", padding: "14px", borderRadius: 12, background: "white", border: "1.5px solid #e2e8f0", color: "#1e293b", fontSize: 15 }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginLeft: 4 }}>Valor Mensal</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontWeight: 700, color: "#94a3b8" }}>R$</span>
                <input 
                  type="number" 
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  style={{ width: "100%", padding: "14px 14px 14px 44px", borderRadius: 12, background: "white", border: "1.5px solid #e2e8f0", color: "#1e293b", fontSize: 18, fontWeight: 800 }}
                />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginLeft: 4 }}>
                {type === "income" ? "Dia de Recebimento" : "Dia de Vencimento"}
              </label>
              <select 
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(Number(e.target.value))}
                style={{ width: "100%", padding: "14px", borderRadius: 12, background: "white", border: "1.5px solid #e2e8f0", color: "#1e293b", fontWeight: 600 }}
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>Todo dia {d}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginLeft: 4 }}>Categoria</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: "100%", padding: "14px", borderRadius: 12, background: "white", border: "1.5px solid #e2e8f0", color: "#1e293b", fontWeight: 600 }}
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ 
            background: type === "income" ? "rgba(34, 197, 94, 0.05)" : "rgba(239, 68, 68, 0.05)", 
            padding: 16, 
            borderRadius: 16, 
            display: "flex", 
            gap: 12, 
            border: "1px solid",
            borderColor: type === "income" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)"
          }}>
            <Repeat size={20} style={{ color: type === "income" ? "var(--income)" : "var(--expense)", flexShrink: 0 }} />
            <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>
              {type === "income" 
                ? `Tudo certo! Todo dia ${dayOfMonth} você receberá uma notificação para confirmar a entrada deste valor.`
                : `Beleza! No dia ${dayOfMonth} de cada mês, avisaremos você para confirmar o pagamento deste gasto.`}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary" 
            style={{ 
              width: "100%", 
              padding: 18, 
              borderRadius: 14, 
              fontSize: 16, 
              fontWeight: 800, 
              marginTop: 10,
              background: type === "income" ? "var(--income)" : "var(--expense)",
              boxShadow: `0 10px 20px ${type === "income" ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)"}`
            }}
          >
            {loading ? "Salvando..." : "Salvar Configuração"}
          </button>
        </form>

      </div>
    </div>
  );
}
