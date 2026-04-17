"use client";

import { useApp } from "@/context/AppContext";
import { 
  Calendar, 
  MoreVertical, 
  Trash2, 
  Edit2, 
  Pause, 
  Play, 
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function RecurrencesView() {
  const { recurrences, removeRecurrence, updateRecurrence, openRecurrenceModal } = useApp();


  return (
    <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--gray-900)" }}>Recorrências</h2>
          <p style={{ fontSize: 13, color: "var(--gray-500)" }}>Gerencie seus pagamentos e recebimentos automáticos</p>
        </div>
        <button className="btn-primary" onClick={() => openRecurrenceModal()}>
          <Plus size={16} />
          Nova Recorrência
        </button>

      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ padding: "16px 24px" }}>Nome / Categoria</th>
              <th>Valor</th>
              <th>Frequência</th>
              <th>Próximo</th>
              <th>Status</th>
              <th style={{ textAlign: "right", paddingRight: 24 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {recurrences.map((r) => (
              <tr key={r.id} style={{ borderBottom: "1px solid var(--gray-50)" }}>
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div className="transaction-icon" style={{ 
                      background: r.type === "income" ? "var(--green-50)" : "#fef2f2",
                      color: r.type === "income" ? "var(--income)" : "var(--expense)"
                    }}>
                      {r.type === "income" ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--gray-900)", fontSize: 13 }}>{r.title}</div>
                      <div style={{ fontSize: 11, color: "var(--gray-400)" }}>{r.category}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span style={{ 
                    fontWeight: 700, 
                    color: r.type === "income" ? "var(--income)" : "var(--expense)",
                    fontSize: 14
                  }}>
                    {r.type === "income" ? "+" : "-"} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(r.amount))}
                  </span>
                </td>
                <td style={{ fontSize: 13, color: "var(--gray-600)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Clock size={14} style={{ color: "var(--gray-400)" }} />
                    {r.frequency === "monthly" ? `Mensal (Dia ${r.dayOfMonth})` : r.frequency}
                  </div>
                </td>
                <td style={{ fontSize: 13, color: "var(--gray-600)" }}>
                  {format(new Date(r.nextDueDate), "dd 'de' MMM", { locale: ptBR })}
                </td>
                <td>
                  <span className={`status-badge ${r.status === "active" ? "status-completed" : "status-pending"}`}>
                    {r.status === "active" ? "Ativo" : "Pausado"}
                  </span>
                </td>
                <td style={{ textAlign: "right", paddingRight: 24 }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    <button 
                      onClick={() => updateRecurrence(r.id, { status: r.status === "active" ? "paused" : "active" })}
                      style={{ background: "none", border: "none", color: "var(--gray-400)", cursor: "pointer", padding: 4 }}
                      title={r.status === "active" ? "Pausar" : "Ativar"}
                    >
                      {r.status === "active" ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button 
                      onClick={() => openRecurrenceModal(r)}
                      style={{ background: "none", border: "none", color: "var(--gray-400)", cursor: "pointer", padding: 4 }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => removeRecurrence(r.id)}
                      style={{ background: "none", border: "none", color: "var(--expense)", cursor: "pointer", padding: 4 }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
