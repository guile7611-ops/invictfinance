"use client";

import { useApp } from "@/context/AppContext";
import { X, CheckCircle2, Zap, Layout, Smartphone, Calendar, History } from "lucide-react";

export default function UpdatesModal() {
  const { isUpdatesModalOpen, closeUpdatesModal } = useApp();

  if (!isUpdatesModalOpen) return null;

  const updates = [
    {
      version: "2.3",
      date: "06 de Maio, 2026",
      time: "14:40",
      type: "feature",
      title: "Exportação de Extratos (PDF/CSV)",
      description: "Agora você pode exportar suas transações com layout profissional de banco, escolhendo o período desejado.",
      items: ["Exportação para PDF com layout Invict", "Exportação para CSV (Excel)", "Seleção de período customizado", "Resumo financeiro no extrato"]
    },
    {
      version: "2.2",
      date: "06 de Maio, 2026",
      time: "14:30",
      type: "feature",
      title: "Gestão de Compras & Reset de Perfil",
      description: "Melhorias no controle de cartões de crédito e nova área de configurações para reset total de dados.",
      items: ["Edição de compras parceladas", "Exclusão de parcelamentos", "Reset total de perfil", "Scroll otimizado no menu lateral"]
    },
    {
      version: "2.1",
      date: "30 de Abril, 2026",
      time: "14:55",
      type: "feature",
      title: "Seção de Atualizações & Log de Mudanças",
      description: "Adicionada esta janela de histórico para acompanhar todas as melhorias e correções no ecossistema Invict.",
      items: ["Novo modal de histórico", "Indicador visual na sidebar (Desktop)"]
    },
    {
      version: "2.0",
      date: "30 de Abril, 2026",
      time: "14:50",
      type: "fix",
      title: "Ajuste de Responsividade & Favicon",
      description: "Corrigida a experiência mobile para eliminar rolagens laterais e travamento de zoom, proporcionando sensação de app nativo.",
      items: ["Fim do scroll lateral no celular", "Favicon oficial configurado", "Grids e Filtros responsivos", "Layout travado contra zoom acidental"]
    },
    {
      version: "1.9",
      date: "30 de Abril, 2026",
      time: "14:45",
      type: "fix",
      title: "Correção na Lógica de Evolução (Mês)",
      description: "O cálculo da evolução agora reflete o lucro real do mês (Realizado + Previsto) em vez de apenas a projeção futura.",
      items: ["Nova fórmula: (Rec. Real + Prev) - (Desp. Real + Prev)", "Exibição correta após adicionar entradas"]
    },
    {
      version: "1.8",
      date: "29 de Abril, 2026",
      time: "18:20",
      type: "feature",
      title: "Gráfico de Saúde Financeira",
      description: "Implementação da projeção visual de fluxo de caixa com Recharts.",
      items: ["Projeção de 6 meses", "Linha de saldo acumulado", "Tooltip detalhado com badges"]
    }
  ];

  return (
    <div 
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 20
      }}
      onClick={closeUpdatesModal}
    >
      <div 
        style={{
          width: "100%",
          maxWidth: 600,
          maxHeight: "85vh",
          background: "white",
          borderRadius: 24,
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "modalFadeIn 0.3s ease-out"
        }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: "24px 32px",
          background: "var(--sidebar-bg)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ padding: 10, background: "rgba(255,255,255,0.1)", borderRadius: 12 }}>
              <History size={24} color="var(--green-400)" />
            </div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Log de Atualizações</h2>
              <p style={{ fontSize: 12, color: "var(--green-300)", margin: 0, opacity: 0.8 }}>O que há de novo no Invict Finance</p>
            </div>
          </div>
          <button 
            onClick={closeUpdatesModal}
            style={{ 
              background: "rgba(255,255,255,0.1)", 
              border: "none", 
              color: "white", 
              padding: 8, 
              borderRadius: 50, 
              cursor: "pointer"
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ 
          padding: "24px 32px", 
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 32
        }}>
          {updates.map((update, idx) => (
            <div key={idx} style={{ position: "relative", paddingLeft: 24, borderLeft: "2px solid var(--gray-100)" }}>
              {/* Dot */}
              <div style={{ 
                position: "absolute", 
                left: -7, 
                top: 0, 
                width: 12, 
                height: 12, 
                borderRadius: "50%", 
                background: update.type === 'feature' ? 'var(--green-500)' : '#3b82f6',
                border: "2px solid white",
                boxShadow: "0 0 0 2px var(--gray-100)"
              }} />

              {/* Meta */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ 
                  fontSize: 10, 
                  fontWeight: 800, 
                  background: "var(--gray-100)", 
                  color: "var(--gray-600)", 
                  padding: "2px 8px", 
                  borderRadius: 6 
                }}>
                  v{update.version}
                </span>
                <span style={{ fontSize: 11, color: "var(--gray-400)", fontWeight: 500 }}>
                   {update.date} às {update.time}
                </span>
              </div>

              {/* Title */}
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--gray-900)", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                {update.title}
                {update.type === 'feature' ? <Zap size={14} color="#f59e0b" fill="#f59e0b" /> : null}
              </h3>

              <p style={{ fontSize: 13, color: "var(--gray-500)", lineHeight: 1.5, marginBottom: 12 }}>
                {update.description}
              </p>

              {/* Items */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {update.items.map((item, i) => (
                  <div key={i} style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 4, 
                    fontSize: 11, 
                    fontWeight: 600, 
                    color: "var(--green-700)",
                    background: "var(--green-50)",
                    padding: "4px 10px",
                    borderRadius: 8
                  }}>
                    <CheckCircle2 size={12} />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ 
          padding: "20px 32px", 
          borderTop: "1px solid var(--gray-100)",
          display: "flex",
          justifyContent: "center",
          background: "var(--gray-50)"
        }}>
          <button 
            onClick={closeUpdatesModal}
            style={{
              padding: "10px 32px",
              background: "var(--sidebar-bg)",
              color: "white",
              border: "none",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer"
            }}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
