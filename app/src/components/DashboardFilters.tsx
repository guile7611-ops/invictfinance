"use client";

import { useApp } from "@/context/AppContext";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

export default function DashboardFilters() {
  const { selectedMonth, setSelectedMonth, viewMode, setViewMode, displayMode, setDisplayMode } = useApp();

  const changeMonth = (offset: number) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + offset, 1);
    setSelectedMonth(date.toISOString().slice(0, 7));
  };

  const formatDisplayDate = (monthStr: string) => {
    const [year, month] = monthStr.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    const label = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  return (
    <div className="fade-up dashboard-filters" style={{ 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "space-between",
      background: "rgba(255, 255, 255, 0.6)",
      backdropFilter: "blur(10px)",
      padding: "12px 20px",
      borderRadius: "16px",
      border: "1px solid rgba(255, 255, 255, 0.5)",
      boxShadow: "var(--shadow-card)",
      marginBottom: 24,
      flexWrap: "wrap",
      gap: 16
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div className="hide-mobile" style={{ 
          background: "var(--sidebar-bg)", 
          color: "white", 
          padding: 8, 
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <Calendar size={18} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: "var(--gray-400)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Período de Visualização</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--gray-900)" }}>{formatDisplayDate(selectedMonth)}</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", width: "100%", justifyContent: "space-between" }}>
        <div className="hide-mobile" style={{ display: "flex", background: "rgba(0,0,0,0.05)", padding: "4px", borderRadius: "12px" }}>
          {[
            { id: 'grid', label: 'Dashboard' },
            { id: 'timeline', label: 'Timeline' }
          ].map((mode) => (
            <button 
              key={mode.id}
              onClick={() => setDisplayMode(mode.id as any)}
              style={{ 
                padding: "6px 14px", 
                borderRadius: "8px", 
                border: "none",
                fontSize: "12px",
                fontWeight: 600,
                background: displayMode === mode.id ? "white" : "transparent",
                color: displayMode === mode.id ? "var(--gray-900)" : "var(--gray-500)",
                boxShadow: displayMode === mode.id ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <div className="hide-mobile" style={{ height: 24, width: 1, background: "var(--gray-200)" }} />

        <div style={{ display: "flex", background: "rgba(0,0,0,0.05)", padding: "4px", borderRadius: "12px" }}>
          {['Mês', 'Trimestre', 'Ano'].map((p) => (
            <button 
              key={p}
              onClick={() => setViewMode(p as any)}
              style={{ 
                padding: "6px 12px", 
                borderRadius: "8px", 
                border: "none",
                fontSize: "12px",
                fontWeight: 600,
                background: viewMode === p ? "white" : "transparent",
                color: viewMode === p ? "var(--gray-900)" : "var(--gray-500)",
                boxShadow: viewMode === p ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="hide-mobile" style={{ height: 24, width: 1, background: "var(--gray-200)" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button 
            onClick={() => changeMonth(-1)}
            style={{ 
              background: "white", 
              border: "1px solid var(--gray-200)", 
              padding: "8px", 
              borderRadius: "10px",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <ChevronLeft size={18} color="var(--gray-600)" />
          </button>
          
          <button 
            onClick={() => setSelectedMonth(new Date().toISOString().slice(0, 7))}
            style={{ 
              background: "white", 
              border: "1px solid var(--gray-200)", 
              padding: "8px 16px", 
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--gray-700)",
              cursor: "pointer"
            }}
          >
            Hoje
          </button>

          <button 
            onClick={() => changeMonth(1)}
            style={{ 
              background: "white", 
              border: "1px solid var(--gray-200)", 
              padding: "8px", 
              borderRadius: "10px",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <ChevronRight size={18} color="var(--gray-600)" />
          </button>
        </div>
      </div>
    </div>
  );
}
