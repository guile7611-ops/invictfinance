"use client";

import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { categories, months } from "@/lib/mockData";
import type { Transaction } from "@/lib/mockData";
import { Search, Filter, Download, Trash2, Plus } from "lucide-react";

const categoryIcons: Record<string, string> = {
  Renda: "💰",
  Moradia: "🏠",
  Alimentação: "🛒",
  Contas: "📄",
  Transporte: "🚗",
  Saúde: "💊",
  Lazer: "🎬",
  Investimentos: "📈",
  Assinaturas: "📺",
  Tecnologia: "💻",
  Freela: "💻",
  Mesada: "🎁",
  "Recebimento de Dívida": "🤝",
  "Apostas & Métodos": "🎲",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

type Props = {
  mode?: "expenses" | "income" | "all";
  fixedStatus?: "completed" | "pending" | "predicted" | "all";
};

export default function TransactionsTable({ mode = "all", fixedStatus }: Props) {
  const { transactions, occurrences, removeTransaction, openModal, selectedMonth: globalMonth } = useApp();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedStatus, setSelectedStatus] = useState(fixedStatus || "completed");

  const filtered = useMemo(() => {
    // Unir transações reais e ocorrências projetadas (se status for compatível)
    const allData = [...transactions];
    
    // Se estivermos buscando pendentes/previstos, incluir occurrences
    if (selectedStatus === 'pending' || selectedStatus === 'predicted' || selectedStatus === 'all') {
      occurrences.forEach(o => {
        // Evitar duplicar se já existir transação real para esta occurrence
        if (!transactions.some(t => t.id === o.id || (o.recurrenceId && t.recurrenceId === o.recurrenceId && t.date.startsWith(globalMonth)))) {
          allData.push({
            id: o.id,
            description: o.title,
            amount: o.type === 'expense' ? -o.amount : o.amount,
            category: o.category,
            date: o.dueDate,
            type: o.type,
            status: o.status,
            recurrenceId: o.recurrenceId
          } as any);
        }
      });
    }

    return allData.filter((t) => {
      const matchMonth = t.date.startsWith(globalMonth);
      if (!matchMonth) return false;

      const matchSearch =
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase());
      
      const matchType = 
        mode === "all" ? true :
        mode === "expenses" ? t.type === "expense" :
        t.type === "income";

      const matchCat = selectedCategory === "Todas" || t.category === selectedCategory;
      
      const statusToMatch = fixedStatus || selectedStatus;
      const matchStatus = statusToMatch === "all" ? true : t.status === statusToMatch;
      
      return matchSearch && matchType && matchCat && matchStatus;
    });
  }, [transactions, occurrences, globalMonth, search, mode, selectedCategory, selectedStatus, fixedStatus]);

  const statusLabel: Record<string, string> = {
    completed: "Concluído",
    pending: "Pendente",
    cancelled: "Cancelado",
    predicted: "Previsto",
    overdue: "Atrasado",
    ignored: "Ignorado",
  };

  const title = mode === "expenses" ? "Gastos" : mode === "income" ? "Entradas" : "Transações";
  const btnLabel = mode === "expenses" ? "Adicionar Gasto" : mode === "income" ? "Adicionar Entrada" : "Adicionar";
  const btnColor = mode === "income" ? "var(--income)" : mode === "expenses" ? "var(--expense)" : "var(--green-600)";

  return (
    <div className="card fade-up fade-up-4">
      {/* Header */}
      <div className="card-header" style={{ marginBottom: 16 }}>
        <div>
          <div className="card-title">{title}</div>
          <div className="card-subtitle">{filtered.length} {mode === "all" ? "registros" : title.toLowerCase()} encontrados</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-outline" style={{ padding: "7px 12px" }}>
            <Filter size={14} /> filtrar
          </button>
          <button className="btn-outline" style={{ padding: "7px 12px" }}>
            <Download size={14} /> Exportar
          </button>
          <button
            className="btn-primary"
            onClick={() => openModal(mode === "income" ? "income" : "expense")}
            style={{ padding: "7px 14px", background: btnColor, borderColor: btnColor }}
          >
            <Plus size={14} />
            {btnLabel}
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="filters-bar" style={{ marginBottom: 16 }}>
        <div className="search-wrap">
          <Search size={14} className="search-icon" aria-hidden="true" />
          <input
            type="search"
            className="search-input"
            placeholder={`Buscar em ${title.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>



        <select
          className="filter-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        {!fixedStatus && (
          <select
            className="filter-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
          >
            <option value="all">Status</option>
            <option value="completed">Concluído</option>
            <option value="pending">Pendente</option>
            <option value="overdue">Atrasado</option>
          </select>
        )}
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table aria-label={`Lista de ${title}`}>
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Data</th>
              <th>Categoria</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Valor</th>
              <th style={{ width: 40 }} />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "var(--gray-400)", fontSize: 13 }}>
                  Nenhum registro encontrado
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        className="transaction-icon"
                        style={{
                          background: t.type === "income" ? "#dcfce7" : "#fef2f2",
                          fontSize: 16
                        }}
                      >
                        {categoryIcons[t.category] ?? (t.type === "income" ? "💰" : "💳")}
                      </div>
                      <div className="transaction-desc">{t.description}</div>
                    </div>
                  </td>
                  <td style={{ color: "var(--gray-500)", fontSize: 13 }}>
                    {formatDate(t.date)}
                  </td>
                  <td>
                    <span style={{ background: "var(--gray-100)", color: "var(--gray-600)", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
                      {t.category}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${t.status}`}>
                      {statusLabel[t.status]}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <span className={t.type === "income" ? "amount-positive" : "amount-negative"} style={{ fontWeight: 700 }}>
                      {t.type === "income" ? "+" : "-"}
                      R$ {Math.abs(t.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td>
                    <button className="btn-delete" onClick={() => removeTransaction(t.id)}>
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
