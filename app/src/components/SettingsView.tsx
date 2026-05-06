"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { 
  User, 
  Shield, 
  Bell, 
  Database, 
  Trash2, 
  RefreshCw,
  LogOut
} from "lucide-react";

export default function SettingsView() {
  const { user, logout } = useAuth();
  const { resetAppData } = useApp();

  return (
    <div className="fade-up">
      <div className="section-header" style={{ marginBottom: 24 }}>
        <h2 className="section-title">Configurações</h2>
        <p className="section-subtitle">Gerencie sua conta e preferências do sistema</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Perfil */}
        <div className="card">
          <div className="card-header" style={{ borderBottom: "1px solid var(--gray-100)", paddingBottom: 16, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="icon-container" style={{ background: "var(--green-50)", color: "var(--green-600)" }}>
                <User size={20} />
              </div>
              <h3 className="card-title">Perfil do Usuário</h3>
            </div>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
            <img 
              src={user?.avatar || "https://ui-avatars.com/api/?name=User"} 
              alt={user?.name} 
              style={{ width: 80, height: 80, borderRadius: 20, background: "var(--gray-100)", border: "4px solid white", boxShadow: "var(--shadow-card)" }}
            />
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--gray-900)" }}>{user?.name || "Usuário"}</div>
              <div style={{ fontSize: 14, color: "var(--gray-500)" }}>{user?.email || "email@exemplo.com"}</div>
              <button 
                className="btn-outline" 
                style={{ marginTop: 12, padding: "6px 12px", fontSize: 12 }}
                disabled
              >
                Editar Perfil
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "var(--gray-50)", borderRadius: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Shield size={18} style={{ color: "var(--gray-400)" }} />
                <span style={{ fontSize: 14, fontWeight: 500, color: "var(--gray-700)" }}>Segurança da Conta</span>
              </div>
              <span style={{ fontSize: 12, color: "var(--green-600)", fontWeight: 600 }}>Ativa</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "var(--gray-50)", borderRadius: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Bell size={18} style={{ color: "var(--gray-400)" }} />
                <span style={{ fontSize: 14, fontWeight: 500, color: "var(--gray-700)" }}>Notificações</span>
              </div>
              <span style={{ fontSize: 12, color: "var(--gray-400)" }}>Desativadas</span>
            </div>
          </div>
        </div>

        {/* Dados e Privacidade */}
        <div className="card">
          <div className="card-header" style={{ borderBottom: "1px solid var(--gray-100)", paddingBottom: 16, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="icon-container" style={{ background: "#fee2e2", color: "#dc2626" }}>
                <Database size={20} />
              </div>
              <h3 className="card-title">Dados e Privacidade</h3>
            </div>
          </div>

          <p style={{ fontSize: 14, color: "var(--gray-500)", lineHeight: 1.6, marginBottom: 24 }}>
            Gerencie como suas informações são armazenadas e processadas. Você pode resetar todos os seus dados financeiros para começar do zero.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button 
              onClick={resetAppData}
              className="btn-outline" 
              style={{ 
                width: "100%", 
                justifyContent: "flex-start", 
                gap: 12, 
                padding: 14, 
                borderColor: "#fecaca",
                color: "#dc2626"
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "#fff1f1"}
              onMouseOut={(e) => e.currentTarget.style.background = "white"}
            >
              <Trash2 size={18} />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 600 }}>Resetar todas as informações</div>
                <div style={{ fontSize: 11, opacity: 0.8 }}>Apaga transações, metas e cartões permanentemente</div>
              </div>
            </button>

            <button 
              className="btn-outline" 
              style={{ width: "100%", justifyContent: "flex-start", gap: 12, padding: 14 }}
              disabled
            >
              <RefreshCw size={18} style={{ color: "var(--gray-400)" }} />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 600, color: "var(--gray-700)" }}>Sincronizar Dados</div>
                <div style={{ fontSize: 11, color: "var(--gray-400)" }}>Forçar atualização com o servidor</div>
              </div>
            </button>

            <button 
              onClick={logout}
              className="btn-outline" 
              style={{ 
                width: "100%", 
                justifyContent: "flex-start", 
                gap: 12, 
                padding: 14,
                marginTop: 12
              }}
            >
              <LogOut size={18} style={{ color: "var(--gray-400)" }} />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 600, color: "var(--gray-700)" }}>Encerrar Sessão</div>
                <div style={{ fontSize: 11, color: "var(--gray-400)" }}>Sair da sua conta neste dispositivo</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
