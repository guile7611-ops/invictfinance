"use client";

import { useApp } from "@/context/AppContext";
import { 
  AlertCircle, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  ArrowRight
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type AlertLevel = "critical" | "attention" | "info";

type DynamicAlert = {
  id: string;
  level: AlertLevel;
  title: string;
  description: string;
  action?: () => void;
  actionLabel?: string;
};

export default function AlertsPanel() {
  const { occurrences, cards, goals, openQuickConfirm, selectedMonth } = useApp();

  // Gerar alertas dinâmicos baseados no estado real
  const dynamicAlerts: DynamicAlert[] = [
    // 1. Alertas de Atraso (Crítico)
    ...occurrences
      .filter(o => o.status === "overdue" && o.dueDate.startsWith(selectedMonth))
      .map(o => ({
        id: `overdue-${o.id}`,
        level: "critical" as const,
        title: "Lançamento Atrasado",
        description: `${o.title} de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(o.amount)} venceu em ${format(new Date(o.dueDate + 'T12:00:00'), 'dd/MM')}`,
        action: () => openQuickConfirm(o),
        actionLabel: "Resolver"
      })),

    // 2. Alertas de Lançamentos do Mês Selecionado (Atenção/Info)
    ...occurrences
      .filter(o => o.status === "predicted" && o.dueDate.startsWith(selectedMonth))
      .map(o => {
        const todayStr = new Date().toISOString().split('T')[0];
        const isToday = o.dueDate === todayStr;
        const isPast = o.dueDate < todayStr;
        
        const dueDate = new Date(o.dueDate + 'T12:00:00');
        const dayStr = format(dueDate, 'dd/MM');

        return {
          id: `upcoming-${o.id}`,
          level: (isToday || (o as any).isBill) ? "attention" as const : "info" as const,
          title: (o as any).isBill ? "Fatura de Cartão" : `${o.type === "income" ? "Recebimento" : "Pagamento"} previsto`,
          description: `${o.title}: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(o.amount)} para o dia ${dayStr}.`,
          action: () => openQuickConfirm(o),
          actionLabel: isPast ? "Regularizar" : "Confirmar"
        };
      }),

    // 3. Alertas de Metas (Info)
    ...goals
      .filter(g => (g.currentAmount / g.targetAmount) >= 0.85 && (g.currentAmount / g.targetAmount) < 1.0)
      .map(g => ({
        id: `goal-${g.id}`,
        level: "info" as const,
        title: "Meta quase lá!",
        description: `Você atingiu ${(g.currentAmount / g.targetAmount * 100).toFixed(0)}% da meta ${g.title}. Falta pouco!`,
        actionLabel: "Ver Meta"
      }))
  ];

  const levelStyles: Record<AlertLevel, { bg: string; border: string; icon: any; iconColor: string; titleColor: string }> = {
    critical: { 
      bg: "#fef2f2", 
      border: "#fca5a5", 
      icon: AlertTriangle, 
      iconColor: "#dc2626",
      titleColor: "#991b1b"
    },
    attention: { 
      bg: "#fffbeb", 
      border: "#fde68a", 
      icon: AlertCircle, 
      iconColor: "#d97706",
      titleColor: "#92400e"
    },
    info: { 
      bg: "#eff6ff", 
      border: "#bfdbfe", 
      icon: Info, 
      iconColor: "#3b82f6",
      titleColor: "#1e40af"
    }
  };

  return (
    <div className="card fade-up fade-up-3" style={{ display: "flex", flexDirection: "column", gap: 0, minHeight: 400 }}>
      <div className="card-header">
        <div>
          <div className="card-title">Alertas Inteligentes</div>
          <div className="card-subtitle">{dynamicAlerts.length} ações requeridas</div>
        </div>
        <Zap size={16} style={{ color: "var(--green-500)" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {dynamicAlerts.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--gray-400)" }}>
            <CheckCircle2 size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
            <p style={{ fontSize: 13 }}>Nenhum alerta pendente.<br/>Seu financeiro está em dia!</p>
          </div>
        ) : (
          dynamicAlerts.map((alert) => {
            const style = levelStyles[alert.level];
            const Icon = style.icon;
            
            return (
              <div
                key={alert.id}
                style={{
                  background: style.bg,
                  border: `1.5px solid ${style.border}`,
                  borderRadius: 14,
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  transition: "all 0.2s"
                }}
              >
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: "50%", 
                    background: "rgba(255,255,255,0.8)", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    color: style.iconColor,
                    flexShrink: 0
                  }}>
                    <Icon size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: style.titleColor }}>
                      {alert.title}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--gray-600)", marginTop: 2, lineHeight: 1.4 }}>
                      {alert.description}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button 
                    onClick={alert.action}
                    style={{ 
                      background: "white", 
                      border: "1.5px solid", 
                      borderColor: style.border, 
                      color: style.iconColor,
                      padding: "6px 14px",
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6
                    }}
                  >
                    {alert.actionLabel || "Visualizar"}
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function Zap(props: any) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
  );
}
