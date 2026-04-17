"use client";

import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import AnimatedCounter from "./AnimatedCounter";
import { useState, useEffect } from "react";

import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowUpRight,
  Plus,
  Clock,
  CalendarCheck,
  Zap,
  ArrowRight,
  Settings,
  X,
  Check,
  AlertCircle
} from "lucide-react";



export default function KpiCards() {
  const { 
    balance, 
    monthlyIncome,
    monthlyExpenses,
    predictedIncome,
    predictedExpenses,
    recurrenceTodayCount,
    pendenciasCount,
    projectedBalance,
    monthlyEconomy,
    viewMode,
    setActiveSection,
    openModal 
  } = useApp();

  const { user, updateInitialBalance } = useAuth();

  const totalBalance = balance;
  const totalSavings = monthlyEconomy;




  const calcPercentage = (val: number) => {
    const denominator = monthlyIncome > 0 ? monthlyIncome : (totalBalance !== 0 ? totalBalance : 1);
    return `${((Math.abs(val) / denominator) * 100).toFixed(1)}%`;
  };

  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [newBalance, setNewBalance] = useState("0");

  // Sincronizar input com o saldo real do usuário quando carregar
  useEffect(() => {
    if (user?.initialBalance !== undefined) {
      setNewBalance(user.initialBalance.toString());
    }
  }, [user?.initialBalance]);

  const saveBalance = async () => {
    try {
      // Tratar vírgula brasileira para ponto decimal
      const sanitizedValue = newBalance.replace(',', '.');
      const amount = parseFloat(sanitizedValue);
      
      if (isNaN(amount)) return;

      await updateInitialBalance(amount);
      setIsEditingBalance(false);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar saldo.");
    }
  };

  const cards = [
    {
      id: "balance",
      label: (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          Saldo Atual (Real)
          <button 
            onClick={() => setIsEditingBalance(!isEditingBalance)}
            style={{ 
              background: "none", 
              border: "none", 
              padding: 0, 
              cursor: "pointer", 
              color: "var(--gray-400)",
              display: "flex"
            }}
            title="Ajustar saldo inicial"
          >
            <Settings size={14} />
          </button>
        </div>
      ),
      value: isEditingBalance ? (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
          <input 
            type="text"
            value={newBalance}
            onChange={(e) => setNewBalance(e.target.value)}
            style={{ 
              width: 150, 
              background: "rgba(255,255,255,0.05)", 
              border: "1px solid var(--primary)", 
              color: "white",
              padding: "4px 12px",
              borderRadius: 8,
              fontSize: 28,
              fontWeight: 700,
              outline: "none",
              boxShadow: "0 0 15px var(--primary-shadow)"
            }}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveBalance();
              if (e.key === 'Escape') setIsEditingBalance(false);
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <button 
              onClick={saveBalance} 
              style={{ 
                background: "var(--primary)", 
                border: "none", 
                borderRadius: 4, 
                padding: "4px 8px", 
                color: "white", 
                cursor: "pointer",
                display: "flex"
              }}
              title="Salvar (Enter)"
            >
              <Check size={16} />
            </button>
            <button 
              onClick={() => setIsEditingBalance(false)} 
              style={{ 
                background: "var(--gray-700)", 
                border: "none", 
                borderRadius: 4, 
                padding: "4px 8px", 
                color: "white", 
                cursor: "pointer",
                display: "flex"
              }}
              title="Cancelar (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : totalBalance,
      prefix: isEditingBalance ? "" : "R$ ",
      decimals: 2,
      change: `Saldo inicial: R$ ${user?.initialBalance || 0}`,
      changeType: "neutral" as const,
      icon: <Wallet size={18} />,
      iconBg: "#22c55e22",
      iconColor: "#22c55e",
      primary: true,
    },
    {
      id: "projected",
      label: `Saldo Projetado (${viewMode === 'Mês' ? 'Fim do mês' : 'Fim do período'})`,
      value: projectedBalance,
      prefix: "R$ ",
      decimals: 2,
      change: viewMode === 'Mês' ? "Fim do mês" : "Projeção final",
      changeType: "neutral" as const,
      icon: <Clock size={18} />,
      iconBg: "#eff6ff",
      iconColor: "#3b82f6",
      primary: false,
    },
    {
      id: "income",
      label: `Receita (${viewMode === 'Mês' ? 'Realizada' : 'Total Período'})`,
      value: Math.abs(monthlyIncome),
      prefix: "R$ ",
      decimals: 2,
      change: `+${calcPercentage(monthlyIncome)}`,
      changeType: "positive" as const,
      icon: <TrendingUp size={18} />,
      iconBg: "#dcfce7",
      iconColor: "#16a34a",
      primary: false,
      action: () => openModal("income"),
      actionLabel: "Add Receita",
    },
    {
      id: "income_pred",
      label: `Receita (${viewMode === 'Mês' ? 'Prevista' : 'Prev. Período'})`,
      value: predictedIncome,
      prefix: "R$ ",
      decimals: 2,
      change: "Pendente",
      changeType: "neutral" as const,
      icon: <CalendarCheck size={18} />,
      iconBg: "#f0fdf4",
      iconColor: "#10b981",
      primary: false,
    },
    {
      id: "expenses",
      label: `Despesa (${viewMode === 'Mês' ? 'Realizada' : 'Total Período'})`,
      value: Math.abs(monthlyExpenses),
      prefix: "R$ ",
      decimals: 2,
      change: `-${calcPercentage(monthlyExpenses)}`,
      border: "1px solid var(--expense-light)",
      changeType: "negative" as const,
      icon: <TrendingDown size={18} />,
      iconBg: "#fef2f2",
      iconColor: "#dc2626",
      primary: false,
      action: () => openModal("expense"),
      actionLabel: "Add Despesa",
    },
    {
      id: "expenses_pred",
      label: `Despesa (${viewMode === 'Mês' ? 'Prevista' : 'Prev. Período'})`,
      value: predictedExpenses,
      prefix: "R$ ",
      decimals: 2,
      change: "A vencer",
      changeType: "neutral" as const,
      icon: <Zap size={18} />,
      iconBg: "#fff7ed",
      iconColor: "#f97316",
      primary: false,
    },
    {
      id: "recurrence_count",
      label: `Pendências (${viewMode === 'Mês' ? 'Mês' : 'Período'})`,
      value: pendenciasCount,
      prefix: "",
      decimals: 0,
      change: pendenciasCount > 0 ? "Aguardando ação" : "Tudo em dia",
      changeType: (pendenciasCount > 0 ? "negative" : "positive") as "negative" | "positive",
      icon: <AlertCircle size={18} style={{ color: pendenciasCount > 0 ? "#f59e0b" : "#059669" }} />,
      iconBg: pendenciasCount > 0 ? "#fffbeb" : "#f0fdf4",
      iconColor: pendenciasCount > 0 ? "#f59e0b" : "#059669",
      primary: false,
      action: () => setActiveSection("pending"),
      actionLabel: "Ver Pendências",
    },
    {
      id: "economy",
      label: `Evolução (${viewMode === 'Mês' ? 'Mês' : 'Período'})`,
      value: projectedBalance - (user?.initialBalance || 0),
      prefix: "R$ ",
      decimals: 2,
      change: `${(((projectedBalance - (user?.initialBalance || 0)) / (Math.abs(user?.initialBalance || 1))) * 100).toFixed(1)}%`,
      changeType: (projectedBalance >= (user?.initialBalance || 0) ? "positive" : "negative") as "positive" | "negative",
      icon: projectedBalance >= (user?.initialBalance || 0) ? <TrendingUp size={18} /> : <TrendingDown size={18} />,
      iconBg: projectedBalance >= (user?.initialBalance || 0) ? "#f0fdf4" : "#fef2f2",
      iconColor: projectedBalance >= (user?.initialBalance || 0) ? "#16a34a" : "#dc2626",
      primary: false,
    },
  ];

  return (
    <div className="kpi-grid" role="region" aria-label="Resumo financeiro">
      {cards.map((card, i) => (
        <div
          key={card.id}
          className={`kpi-card fade-up fade-up-${i + 1} ${card.primary ? "kpi-primary" : ""}`}
        >
          <div
            className="kpi-icon"
            style={{
              background: card.primary ? "rgba(255,255,255,0.1)" : card.iconBg,
            }}
            aria-hidden="true"
          >
            <span style={{ color: card.primary ? "#22c55e" : card.iconColor }}>
              {card.icon}
            </span>
          </div>

          <div className="kpi-label">{card.label}</div>

          <div className="kpi-value">
            {typeof card.value === "number" ? (
              <AnimatedCounter
                value={card.value}
                prefix={card.prefix}
                decimals={card.decimals}
              />
            ) : (
              card.value
            )}
          </div>


          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div className={`kpi-change ${card.changeType}`}>
              {card.change}
            </div>

            {card.action && (
              <button
                onClick={card.action}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  fontSize: 11,
                  fontWeight: 600,
                  color: card.primary ? "var(--green-300)" : card.iconColor,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "2px 4px",
                  borderRadius: 6,
                  transition: "opacity 0.15s",
                  fontFamily: "inherit",
                }}
              >
                <Plus size={11} />
                {card.actionLabel}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

