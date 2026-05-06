"use client";

import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  PiggyBank,
  CreditCard,
  Users,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";

type NavItem = {
  label: string;
  icon: React.ReactNode;
  id: string;
};

const menuItems: NavItem[] = [
  { label: "Dashboard", icon: <LayoutDashboard size={17} />, id: "dashboard" },
  { label: "Gastos", icon: <ArrowLeftRight size={17} />, id: "expenses_view" },
  { label: "Entradas", icon: <TrendingUp size={17} />, id: "income_view" },
  { label: "Contas Recorrentes", icon: <Settings size={17} />, id: "recurrences" },
  { label: "Recorrências Anuais", icon: <ArrowLeftRight size={17} />, id: "pending" },
  { label: "Metas", icon: <PiggyBank size={17} />, id: "goals" },
  { label: "Cartões", icon: <CreditCard size={17} />, id: "cards" },
  { label: "Amizades", icon: <Users size={17} />, id: "friends" },
  { label: "Investimentos", icon: <TrendingUp size={17} />, id: "investments" },
];

const generalItems: NavItem[] = [
  { label: "Configurações", icon: <Settings size={17} />, id: "settings" },
  { label: "Ajuda", icon: <HelpCircle size={17} />, id: "help" },
];


type Props = {
  activeSection: string;
  onNavigate: (id: string) => void;
};

export default function Sidebar({ activeSection, onNavigate }: Props) {
  const { user, logout } = useAuth();
  const { openUpdatesModal } = useApp();

  return (
    <nav className="sidebar" aria-label="Menu principal">
      {/* Logo */}
      <div className="sidebar-logo" style={{ marginBottom: 12 }}>
        <img src="/logo.png" alt="INVICT Logo" style={{ width: 32, height: 32, objectFit: "contain", borderRadius: 8 }} />
        <span className="sidebar-logo-text" style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.5px" }}>INVICT FINANCE</span>
      </div>

      {/* Seção de Atualizações - Somente Desktop */}
      <div className="desktop-only" style={{ padding: "0 8px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 16 }}>
        <button 
          onClick={openUpdatesModal}
          style={{
            width: "100%",
            background: "rgba(34, 197, 94, 0.1)",
            border: "1px border var(--green-500)",
            borderRadius: "10px",
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            transition: "all 0.2s"
          }}
          className="update-button"
        >
          <div style={{ 
            width: 8, 
            height: 8, 
            borderRadius: "50%", 
            background: "var(--green-400)",
            boxShadow: "0 0 8px var(--green-400)" 
          }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--green-300)" }}>Atualizações</span>
          <span style={{ fontSize: 10, background: "var(--green-500)", color: "white", padding: "1px 6px", borderRadius: 6, marginLeft: "auto" }}>v2.3</span>
        </button>
      </div>

      {/* Menu */}
      <span className="sidebar-section-label">Menu</span>
      {menuItems.map((item) => (
        <button
          key={item.id}
          className={`sidebar-item ${activeSection === item.id ? "active" : ""}`}
          onClick={() => onNavigate(item.id)}
          aria-current={activeSection === item.id ? "page" : undefined}
          style={{ background: "none", border: "none", width: "100%", textAlign: "left" }}
        >
          {item.icon}
          {item.label}
        </button>
      ))}

      {/* General */}
      <span className="sidebar-section-label" style={{ marginTop: 8 }}>Geral</span>
      {generalItems.map((item) => (
        <button
          key={item.id}
          className={`sidebar-item ${activeSection === item.id ? "active" : ""}`}
          style={{ background: "none", border: "none", width: "100%", textAlign: "left" }}
          onClick={() => onNavigate(item.id)}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
      
      <button
        className="sidebar-item"
        style={{ background: "none", border: "none", width: "100%", textAlign: "left" }}
        onClick={() => logout()}
      >
        <LogOut size={17} />
        Sair
      </button>

      {/* User */}
      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <img 
            src={user?.avatar || "https://ui-avatars.com/api/?name=User"} 
            alt={user?.name} 
            style={{ width: 34, height: 34, borderRadius: 10, background: "var(--sidebar-active)" }} 
          />
          <div>
            <div className="sidebar-user-name" style={{ fontSize: 13 }}>{user?.name || "Meu Perfil"}</div>
            <div className="sidebar-user-role" style={{ fontSize: 11 }}>{user?.username || "@usuario"}</div>
          </div>
        </div>
      </div>
    </nav>
  );
}
