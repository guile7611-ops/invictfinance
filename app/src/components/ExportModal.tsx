"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { X, FileText, Download, Calendar, CheckCircle2 } from "lucide-react";

export default function ExportModal() {
  const { isExportModalOpen, closeExportModal, transactions } = useApp();
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [format, setFormat] = useState<"pdf" | "csv">("pdf");

  if (!isExportModalOpen) return null;

  const handleExport = () => {
    const filtered = transactions.filter(t => t.date >= startDate && t.date <= endDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (format === "csv") {
      exportToCSV(filtered);
    } else {
      exportToPDF(filtered);
    }
  };

  const exportToCSV = (data: any[]) => {
    const headers = ["Data", "Descrição", "Categoria", "Tipo", "Valor", "Status"];
    const rows = data.map(t => [
      t.date,
      t.description,
      t.category,
      t.type === 'income' ? 'Entrada' : 'Saída',
      t.amount.toFixed(2),
      t.status
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `extrato_invict_${startDate}_a_${endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    closeExportModal();
  };

  const exportToPDF = (data: any[]) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const totalIncome = data.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const totalExpenses = data.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const balance = totalIncome + totalExpenses;

    const html = `
      <html>
        <head>
          <title>Extrato Invict Finance</title>
          <style>
            body { font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #1e293b; padding: 40px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: 800; color: #10b981; }
            .title { font-size: 18px; font-weight: 600; color: #64748b; }
            .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
            .summary-item { padding: 15px; background: #f8fafc; border-radius: 12px; }
            .summary-label { font-size: 12px; color: #64748b; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.05em; }
            .summary-value { font-size: 18px; font-weight: 700; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 12px; text-transform: uppercase; }
            td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
            .amount-pos { color: #10b981; font-weight: 600; }
            .amount-neg { color: #ef4444; font-weight: 600; }
            .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">INVICT FINANCE</div>
            <div class="title">Extrato de Transações</div>
          </div>
          <div style="margin-bottom: 20px; font-size: 14px; color: #64748b;">
            Período: <strong>${new Date(startDate + "T00:00:00").toLocaleDateString('pt-BR')}</strong> até <strong>${new Date(endDate + "T00:00:00").toLocaleDateString('pt-BR')}</strong>
          </div>
          <div class="summary">
            <div class="summary-item">
              <div class="summary-label">Total Entradas</div>
              <div class="summary-value" style="color: #10b981;">R$ ${totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Saídas</div>
              <div class="summary-value" style="color: #ef4444;">R$ ${Math.abs(totalExpenses).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Saldo do Período</div>
              <div class="summary-value">R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Categoria</th>
                <th style="text-align: right;">Valor</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(t => `
                <tr>
                  <td>${new Date(t.date + "T00:00:00").toLocaleDateString('pt-BR')}</td>
                  <td>${t.description}</td>
                  <td>${t.category}</td>
                  <td style="text-align: right;" class="${t.type === 'income' ? 'amount-pos' : 'amount-neg'}">
                    ${t.type === 'income' ? '+' : '-'} R$ ${Math.abs(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            Gerado em ${new Date().toLocaleString('pt-BR')} • Invict Finance - Sua Inteligência Financeira
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    closeExportModal();
  };

  return (
    <div className="modal-overlay" onClick={closeExportModal} style={{ zIndex: 10000 }}>
      <div className="modal-content fade-up" onClick={e => e.stopPropagation()} style={{ maxWidth: 450 }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="icon-container" style={{ background: "var(--green-50)", color: "var(--green-600)" }}>
              <Download size={20} />
            </div>
            <div>
              <h3 className="modal-title">Exportar Dados</h3>
              <p className="modal-subtitle">Escolha o período e formato do extrato</p>
            </div>
          </div>
          <button className="btn-close" onClick={closeExportModal} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Data Início</label>
              <div style={{ position: "relative" }}>
                <Calendar size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
                <input 
                  type="date" 
                  className="form-input" 
                  style={{ paddingLeft: 36 }}
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Data Fim</label>
              <div style={{ position: "relative" }}>
                <Calendar size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
                <input 
                  type="date" 
                  className="form-input" 
                  style={{ paddingLeft: 36 }}
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Formato do Arquivo</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <button 
                className={`btn-outline ${format === 'pdf' ? 'active' : ''}`}
                onClick={() => setFormat('pdf')}
                style={{ 
                  justifyContent: "center", 
                  gap: 8, 
                  padding: 16,
                  borderColor: format === 'pdf' ? 'var(--green-600)' : 'var(--gray-200)',
                  background: format === 'pdf' ? 'var(--green-50)' : 'white',
                  color: format === 'pdf' ? 'var(--green-700)' : 'var(--gray-600)'
                }}
              >
                <FileText size={20} />
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>PDF</div>
                  <div style={{ fontSize: 10, opacity: 0.8 }}>Layout de Extrato</div>
                </div>
                {format === 'pdf' && <CheckCircle2 size={14} style={{ marginLeft: "auto" }} />}
              </button>

              <button 
                className={`btn-outline ${format === 'csv' ? 'active' : ''}`}
                onClick={() => setFormat('csv')}
                style={{ 
                  justifyContent: "center", 
                  gap: 8, 
                  padding: 16,
                  borderColor: format === 'csv' ? 'var(--green-600)' : 'var(--gray-200)',
                  background: format === 'csv' ? 'var(--green-50)' : 'white',
                  color: format === 'csv' ? 'var(--green-700)' : 'var(--gray-600)'
                }}
              >
                <Download size={20} />
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>CSV</div>
                  <div style={{ fontSize: 10, opacity: 0.8 }}>Planilha Excel</div>
                </div>
                {format === 'csv' && <CheckCircle2 size={14} style={{ marginLeft: "auto" }} />}
              </button>
            </div>
          </div>

          <div style={{ padding: "12px 16px", background: "var(--gray-50)", borderRadius: 12, border: "1px dashed var(--gray-200)" }}>
            <p style={{ margin: 0, fontSize: 12, color: "var(--gray-500)", lineHeight: 1.5 }}>
              O extrato PDF incluirá o logotipo da <strong>Invict Finance</strong>, resumo de totais por período e tabela detalhada de lançamentos.
            </p>
          </div>
        </div>

        <div className="modal-footer" style={{ border: "none", paddingTop: 0 }}>
          <button className="btn-outline" onClick={closeExportModal} style={{ flex: 1, justifyContent: "center" }}>
            Cancelar
          </button>
          <button 
            className="btn-primary" 
            style={{ flex: 2, justifyContent: "center", gap: 8 }}
            onClick={handleExport}
          >
            <Download size={18} />
            Gerar {format.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
}
