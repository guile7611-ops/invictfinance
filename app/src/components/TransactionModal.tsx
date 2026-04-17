"use client";

import { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { 
  X, 
  Calendar, 
  Tag, 
  FileText, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Check,
  CheckCircle2,
  AlertCircle,
  Repeat,
  Layers
} from "lucide-react";

import { categories } from "@/lib/mockData";

export default function TransactionModal() {
  const { modalMode, closeModal, addTransaction } = useApp();
  const overlayRef = useRef<HTMLDivElement>(null);
  
  const isOpen = modalMode !== null;
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Alimentação");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [type, setType] = useState<"income" | "expense">("expense");
  const [isRecurring, setIsRecurring] = useState(false);
  const [status, setStatus] = useState<"completed" | "pending">("completed");
  const [installments, setInstallments] = useState(1);

  useEffect(() => {
    if (modalMode === "income") {
      setType("income");
      setCategory("Renda");
    } else {
      setType("expense");
      setCategory("Alimentação");
    }
    
    // Reset other fields
    setDescription("");
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setIsRecurring(false);
    setStatus("completed");
    setInstallments(1);
  }, [modalMode]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    setIsSubmitting(true);
    try {
      await addTransaction({
        description,
        amount: type === "expense" ? -Math.abs(Number(amount.toString().replace(',', '.'))) : Math.abs(Number(amount.toString().replace(',', '.'))),
        category,
        date,
        type,
        status: isRecurring ? "predicted" : status,
        isRecurring
      });
      closeModal();
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar transação: " + (error.message || "Tente novamente"));
    } finally {
      setIsSubmitting(false);
    }
  };



  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === overlayRef.current && closeModal()} ref={overlayRef}>
      <div className="modal-panel" style={{ width: "100%", maxWidth: 520, padding: 0 }}>
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
              {type === "income" ? "Nova Receita" : "Novo Gasto"}
            </h3>
            <div style={{ fontSize: 13, opacity: 0.8, marginTop: 2 }}>
              {type === "income" ? "Registrar entrada de capital" : "Registrar saída ou pagamento"}
            </div>
          </div>
          <button onClick={closeModal} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", padding: 8, borderRadius: "50%", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 32, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Type Selector Toggle */}
          <div style={{ display: "flex", gap: 8, background: "var(--gray-50)", padding: 4, borderRadius: 12 }}>
            <button 
              type="button" 
              onClick={() => setType("income")} 
              style={{ 
                flex: 1, padding: "10px", borderRadius: 10, border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13, fontWeight: 700,
                background: type === "income" ? "white" : "transparent",
                color: type === "income" ? "var(--income)" : "var(--gray-400)",
                boxShadow: type === "income" ? "0 2px 4px rgba(0,0,0,0.05)" : "none"
              }}
            >
              <ArrowUpCircle size={16} /> Receita
            </button>
            <button 
              type="button" 
              onClick={() => setType("expense")} 
              style={{ 
                flex: 1, padding: "10px", borderRadius: 10, border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13, fontWeight: 700,
                background: type === "expense" ? "white" : "transparent",
                color: type === "expense" ? "var(--expense)" : "var(--gray-400)",
                boxShadow: type === "expense" ? "0 2px 4px rgba(0,0,0,0.05)" : "none"
              }}
            >
              <ArrowDownCircle size={16} /> Despesa
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-500)", marginLeft: 4 }}>Descrição</label>
            <div style={{ position: "relative" }}>
              <FileText size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-300)" }} />
              <input 
                type="text" 
                placeholder="Ex: Supermercado, Aluguel..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                style={{ width: "100%", padding: "12px 14px 12px 42px", borderRadius: 12, border: "1.5px solid var(--gray-200)", fontSize: 15, fontFamily: "inherit" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-500)", marginLeft: 4 }}>Valor</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontWeight: 700, color: "var(--gray-400)" }}>R$</span>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  style={{ width: "100%", padding: "12px 14px 12px 44px", borderRadius: 12, border: "1.5px solid var(--gray-200)", fontSize: 18, fontWeight: 800, fontFamily: "inherit" }}
                />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-500)", marginLeft: 4 }}>Data</label>
              <div style={{ position: "relative" }}>
                <Calendar size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-300)" }} />
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{ width: "100%", padding: "12px 14px 12px 42px", borderRadius: 12, border: "1.5px solid var(--gray-200)", fontSize: 14, fontFamily: "inherit" }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-500)", marginLeft: 4 }}>Categoria</label>
            <div style={{ position: "relative" }}>
              <Tag size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-300)" }} />
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: "100%", padding: "12px 14px 12px 42px", borderRadius: 12, border: "1.5px solid var(--gray-200)", fontSize: 14, fontFamily: "inherit", appearance: "none", background: "white" }}
              >
                {categories
                  .filter(c => c !== "Todas")
                  .filter(c => {
                    const incomeCats = ["Renda", "Freela", "Mesada", "Investimentos", "Recebimento de Dívida", "Apostas & Métodos"];
                    if (type === "income") return incomeCats.includes(c);
                    return !incomeCats.includes(c) || c === "Investimentos"; // Investimentos can be both in some cases, but focusing on expense for now
                  })
                  .map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
             <button 
              type="button"
              onClick={() => setIsRecurring(!isRecurring)}
              style={{ 
                padding: "12px", border: "1.5px solid", borderRadius: 12, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600,
                background: isRecurring ? "var(--green-50)" : "white",
                borderColor: isRecurring ? "var(--green-200)" : "var(--gray-200)",
                color: isRecurring ? "var(--green-700)" : "var(--gray-600)"
              }}
             >
               <Repeat size={16} /> {isRecurring ? "Recorrente ON" : "Lançamento Único"}
             </button>
             
             {!isRecurring ? (
               <button 
                type="button"
                onClick={() => setStatus(status === "completed" ? "pending" : "completed")}
                style={{ 
                  padding: "12px", border: "1.5px solid", borderRadius: 12, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600,
                  background: status === "pending" ? "#fffbeb" : "#f0fdf4",
                  borderColor: status === "pending" ? "#fcd34d" : "#86efac",
                  color: status === "pending" ? "#b45309" : "#15803d"
                }}
               >
                 {status === "pending" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                 {status === "pending" ? "Pendente" : "Confirmado"}
               </button>
             ) : (
               <div style={{ position: "relative" }}>
                  <Layers size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--gray-200)" }} />
                  <select 
                    disabled={true}
                    value={installments}
                    style={{ 
                      width: "100%", padding: "12px 12px 12px 36px", borderRadius: 12, border: "1.5px solid var(--gray-200)", fontSize: 13, fontFamily: "inherit", background: "var(--gray-50)", color: "var(--gray-300)" 
                    }}
                  >
                    <option value={1}>Recorrência Mensal</option>
                  </select>
               </div>
             )}
          </div>


          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{ 
              background: type === "income" ? "var(--income)" : "var(--expense)", 
              color: "white", padding: "16px", borderRadius: 14, border: "none", fontSize: 15, fontWeight: 700, 
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.7 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 10,
              boxShadow: `0 10px 20px -5px ${type === "income" ? "rgba(22,163,74,0.3)" : "rgba(220,38,38,0.3)"}`
            }}
          >
            {isSubmitting ? (
              "Salvando..."
            ) : (
              <>
                <Check size={20} />
                {type === "income" ? "Salvar Receita" : "Confirmar Gasto"}
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}
