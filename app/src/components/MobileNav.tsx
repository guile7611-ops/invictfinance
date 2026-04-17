"use client";

import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  Users,
  Menu,
  X,
  CreditCard,
  PiggyBank,
  Settings
} from "lucide-react";
import { useState } from "react";
import { useApp } from "@/context/AppContext";

export default function MobileNav() {
  const { activeSection, setActiveSection } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const mainItems = [
    { id: "dashboard", label: "Início", icon: <LayoutDashboard size={20} /> },
    { id: "expenses_view", label: "Gastos", icon: <ArrowLeftRight size={20} /> },
    { id: "friends", label: "Amigos", icon: <Users size={20} /> },
    { id: "cards", label: "Cartões", icon: <CreditCard size={20} /> },
  ];

  const otherItems = [
    { id: "income_view", label: "Entradas", icon: <TrendingUp size={18} /> },
    { id: "recurrences", label: "Recorrências", icon: <Settings size={18} /> },
    { id: "goals", label: "Metas", icon: <PiggyBank size={18} /> },
    { id: "settings", label: "Ajustes", icon: <Settings size={18} /> },
  ];

  const handleNavigate = (id: string) => {
    setActiveSection(id);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Bottom Bar */}
      <nav className="mobile-nav">
        {mainItems.map((item) => (
          <button
            key={item.id}
            className={`mobile-nav-item ${activeSection === item.id ? "active" : ""}`}
            onClick={() => handleNavigate(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
        <button 
          className={`mobile-nav-item ${isMenuOpen ? "active" : ""}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu size={20} />
          <span>Mais</span>
        </button>
      </nav>

      {/* Fullscreen Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="mobile-menu-overlay fade-up" style={{ zIndex: 2000 }}>
          <div className="mobile-menu-content">
            <div className="mobile-menu-header">
              <h3 style={{ fontWeight: 800, fontSize: 20 }}>Menu Geral</h3>
              <button onClick={() => setIsMenuOpen(false)} className="modal-close">
                <X size={20} />
              </button>
            </div>
            <div className="mobile-menu-grid">
              {otherItems.map((item) => (
                <button
                  key={item.id}
                  className={`mobile-menu-item ${activeSection === item.id ? "active" : ""}`}
                  onClick={() => handleNavigate(item.id)}
                >
                  <div className="mobile-menu-icon">{item.icon}</div>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .mobile-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-top: 1px solid var(--gray-100);
          height: 70px;
          padding: 0 16px;
          justify-content: space-around;
          align-items: center;
          z-index: 1000;
          box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
          padding-bottom: env(safe-area-inset-bottom);
        }

        .mobile-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          color: var(--gray-400);
          cursor: pointer;
          padding: 8px;
          transition: all 0.2s;
          min-width: 60px;
        }

        .mobile-nav-item span {
          font-size: 10px;
          font-weight: 600;
        }

        .mobile-nav-item.active {
          color: var(--green-600);
        }

        .mobile-menu-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 43, 30, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: flex-end;
          padding: 16px;
        }

        .mobile-menu-content {
          background: white;
          width: 100%;
          border-radius: 28px;
          padding: 24px;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 -10px 40px rgba(0,0,0,0.2);
        }

        .mobile-menu-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .mobile-menu-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .mobile-menu-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 16px 8px;
          background: var(--gray-50);
          border-radius: 20px;
          border: 1.5px solid transparent;
          color: var(--gray-700);
          transition: all 0.2s;
        }

        .mobile-menu-item.active {
          background: var(--green-50);
          border-color: var(--green-500);
          color: var(--green-700);
        }

        .mobile-menu-icon {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          color: var(--green-600);
        }

        @media (max-width: 768px) {
          .mobile-nav {
            display: flex;
          }
        }
      `}</style>
    </>
  );
}
