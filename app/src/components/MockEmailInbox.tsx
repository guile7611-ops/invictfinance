"use client";

import { useAuth } from "@/context/AuthContext";
import { X, Mail, Zap, ExternalLink } from "lucide-react";

export default function MockEmailInbox() {
  const { mockEmail, setMockEmail } = useAuth() as any; // Temporary cast to use the new mock state I'll add

  if (!mockEmail) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      right: 24,
      width: 360,
      background: "white",
      borderRadius: 20,
      boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
      zIndex: 10000,
      border: "1px solid var(--gray-200)",
      overflow: "hidden",
      animation: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
    }}>
      {/* Header */}
      <div style={{ 
        background: "#ea4335", 
        padding: "16px 20px", 
        color: "white", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center" 
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Mail size={18} />
          <span style={{ fontSize: 13, fontWeight: 700 }}>Simulador de E-mail (Ambiente Dev)</span>
        </div>
        <button onClick={() => setMockEmail(null)} style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}>
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: 24 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "var(--gray-400)", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Para:</div>
          <div style={{ fontSize: 14, color: "var(--gray-900)", fontWeight: 600 }}>{mockEmail.to}</div>
        </div>
        
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "var(--gray-400)", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Assunto:</div>
          <div style={{ fontSize: 14, color: "var(--gray-900)", fontWeight: 800 }}>Recuperação de Senha - Emerald Finance</div>
        </div>

        <div style={{ 
          background: "var(--gray-50)", 
          padding: 24, 
          borderRadius: 16, 
          border: "1.5px solid var(--gray-100)",
          textAlign: "center"
        }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            background: "var(--green-500)", 
            borderRadius: 10, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            margin: "0 auto 16px",
            color: "white"
          }}>
            <Zap size={22} />
          </div>
          <h4 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Seu Código de Segurança</h4>
          <p style={{ fontSize: 13, color: "var(--gray-500)", marginBottom: 16 }}>Use o código abaixo para validar sua identidade:</p>
          <div style={{ 
            background: "white", 
            padding: "12px", 
            borderRadius: 12, 
            border: "2px solid var(--green-200)", 
            fontSize: 24, 
            fontWeight: 900, 
            color: "var(--green-700)",
            letterSpacing: 6
          }}>
            {mockEmail.code}
          </div>
        </div>

        <div style={{ marginTop: 24, padding: 12, background: "#fffbeb", border: "1px solid #fef3c7", borderRadius: 10 }}>
          <p style={{ fontSize: 11, color: "#92400e", lineHeight: 1.5 }}>
             <strong>Nota:</strong> Como não foi configurado um servidor de e-mail real (Ex: SendGrid), esta janela simula a chegada do e-mail na sua caixa de entrada.
          </p>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%) scale(0.9); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
