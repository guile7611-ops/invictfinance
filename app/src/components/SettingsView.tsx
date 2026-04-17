"use client";

import { useApp } from "@/context/AppContext";
import { Trash2, ShieldAlert, Database, Github, Globe } from "lucide-react";

export default function SettingsView() {
  const { resetAllData } = useApp();

  return (
    <div className="view-container animate-fade-in">
      <header className="view-header">
        <div>
          <h1 className="view-title">Configurações</h1>
          <p className="view-subtitle">Gerencie suas preferências e dados da conta</p>
        </div>
      </header>

      <div className="settings-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginTop: "24px" }}>
        
        {/* Card de Dados */}
        <div className="card" style={{ borderTop: "4px solid var(--danger)" }}>
          <div className="card-header" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "var(--danger)", padding: "10px", borderRadius: "12px" }}>
              <Database size={20} />
            </div>
            <div>
              <h3 className="card-title">Gerenciamento de Dados</h3>
              <p className="card-subtitle">Cuidado: estas ações são permanentes</p>
            </div>
          </div>
          
          <div className="card-body" style={{ padding: "20px" }}>
            <p style={{ fontSize: "14px", color: "var(--gray-400)", marginBottom: "20px" }}>
              Se você deseja começar do zero, pode resetar todos os seus dados. Isso apagará todas as transações, cartões, metas e recorrências vinculadas à sua conta.
            </p>
            
            <button 
              className="btn btn-danger" 
              onClick={resetAllData}
              style={{ 
                width: "100%", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                gap: "8px",
                padding: "12px",
                borderRadius: "10px",
                fontWeight: "600"
              }}
            >
              <Trash2 size={18} />
              Resetar Todos os Dados
            </button>
          </div>
        </div>

        {/* Card de Sistema */}
        <div className="card">
          <div className="card-header" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ background: "rgba(59, 130, 246, 0.1)", color: "var(--primary)", padding: "10px", borderRadius: "12px" }}>
              <Globe size={20} />
            </div>
            <div>
              <h3 className="card-title">Status do Sistema</h3>
              <p className="card-subtitle">Informações de deploy e versão</p>
            </div>
          </div>
          
          <div className="card-body" style={{ padding: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px solid var(--border-color)" }}>
                <span style={{ color: "var(--gray-400)", fontSize: "14px" }}>Versão</span>
                <span style={{ fontWeight: "600", fontSize: "14px" }}>v1.2.0-stable</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px solid var(--border-color)" }}>
                <span style={{ color: "var(--gray-400)", fontSize: "14px" }}>Deploy</span>
                <div style={{ display: "flex", gap: "8px" }}>
                   <div style={{ background: "var(--bg-main)", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Globe size={12} /> Vercel
                   </div>
                   <div style={{ background: "var(--bg-main)", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Github size={12} /> GitHub
                   </div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--gray-400)", fontSize: "14px" }}>Ambiente</span>
                <span style={{ color: "var(--success)", fontWeight: "600", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                   <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--success)" }}></div>
                   Produção
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card de Segurança */}
        <div className="card">
           <div className="card-header" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ background: "rgba(139, 92, 246, 0.1)", color: "var(--secondary)", padding: "10px", borderRadius: "12px" }}>
                 <ShieldAlert size={20} />
              </div>
              <div>
                 <h3 className="card-title">Segurança</h3>
                 <p className="card-subtitle">Sua privacidade em primeiro lugar</p>
              </div>
           </div>
           <div className="card-body" style={{ padding: "20px" }}>
              <p style={{ fontSize: "14px", color: "var(--gray-400)" }}>
                 Seus dados são protegidos por criptografia de ponta e armazenados de forma segura no Supabase. O INVICT FINANCE não tem acesso à sua senha de banco ou dados sensíveis de terceiros.
              </p>
           </div>
        </div>

      </div>

      <style jsx>{`
        .btn-danger {
          background: var(--danger);
          color: white;
          border: none;
          transition: all 0.2s ease;
        }
        .btn-danger:hover {
          filter: brightness(0.9);
          transform: translateY(-1px);
        }
        .btn-danger:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
