"use client";

import { useState, useEffect } from "react";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { User, Lock, Mail, ArrowRight, Loader2, Zap, ArrowLeft, CheckCircle2, ShieldCheck, Key } from "lucide-react";


type AuthMode = "login" | "register" | "forgot" | "verify";

export default function LoginView() {
  const { login, register, forgotPassword, verifyRecoveryCode } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  
  // Form fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dbStatus, setDbStatus] = useState<"checking" | "ok" | "error">("checking");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const checkDb = async () => {
      try {
        const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true }).limit(1);
        setDbStatus(error ? "error" : "ok");
      } catch {
        setDbStatus("error");
      }
    };
    checkDb();
  }, []);
  const [revealedPassword, setRevealedPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      if (mode === "login") {
        await login((username || email).trim(), password.trim());
      } else if (mode === "register") {
        await register(username.trim(), email.trim(), password.trim());
      } else if (mode === "forgot") {

        await forgotPassword(email);
        setSuccess("Código enviado! Verifique seu e-mail.");
        setTimeout(() => setMode("verify"), 1500);
      } else if (mode === "verify") {
        const pass = await verifyRecoveryCode(email, code);
        setRevealedPassword(pass);
        setSuccess("Código validado com sucesso!");
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError("");
    setSuccess("");
    setRevealedPassword("");
    setCode("");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--sidebar-bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      fontFamily: "inherit"
    }}>
      <div className="card fade-up" style={{ 
        width: "100%", 
        maxWidth: 400, 
        padding: "40px 32px", 
        textAlign: "center",
        boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
        border: "1px solid rgba(255,255,255,0.05)",
        position: "relative"
      }}>
        {/* Logo and Greeting */}
        <div style={{ 
          width: 64, 
          height: 64, 
          margin: "0 auto 24px",
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
        }}>
          <img src="/logo.png" alt="INVICT Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
        
        <h2 style={{ fontSize: 28, fontWeight: 900, color: "var(--gray-900)", marginBottom: 8, letterSpacing: "-1px" }}>
          INVICT FINANCE
        </h2>
        <p style={{ fontSize: 13, color: "var(--gray-500)", marginBottom: 32 }}>
          {revealedPassword ? "Anote sua senha em um local seguro." :
           mode === "login" ? "Entre para gerenciar seu ecossistema financeiro." : 
           mode === "register" ? "Junte-se ao novo padrão de gestão financeira." : 
           mode === "forgot" ? "Recuperação de acesso de alta segurança." : "Digite o código de 6 dígitos enviado para seu e-mail."}
        </p>

        {error && (
          <div style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", color: "#dc2626", padding: "14px", borderRadius: 12, fontSize: 13, marginBottom: 20, fontWeight: 600, display: "flex", alignItems: "center", gap: 10 }}>
            {error}
          </div>
        )}

        {success && !revealedPassword && (
          <div style={{ background: "var(--green-50)", border: "1.5px solid var(--green-200)", color: "var(--green-700)", padding: "14px", borderRadius: 12, fontSize: 13, marginBottom: 20, fontWeight: 600, display: "flex", alignItems: "center", gap: 10 }}>
            <CheckCircle2 size={18} /> {success}
          </div>
        )}

        {revealedPassword ? (
          <div style={{ 
            background: "var(--gray-50)", 
            padding: "32px 24px", 
            borderRadius: 20, 
            border: "2px solid var(--green-200)",
            marginBottom: 24
          }}>
             <div style={{ fontSize: 11, color: "var(--gray-400)", fontWeight: 700, textTransform: "uppercase", marginBottom: 12 }}>Senha Recuperada</div>
             <div style={{ fontSize: 28, fontWeight: 900, color: "var(--green-700)", letterSpacing: 1 }}>{revealedPassword}</div>
             <button 
                onClick={() => toggleMode("login")}
                className="btn-primary"
                style={{ marginTop: 24, width: "100%", padding: 14 }}
             >
                Voltar para o Login
             </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {mode === "login" || mode === "register" ? (
              <div style={{ textAlign: "left" }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-400)", marginLeft: 4, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Usuário</label>
                <div style={{ position: "relative" }}>
                  <User size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Seu @usuário"
                    required
                    style={{ width: "100%", padding: "14px 14px 14px 42px", borderRadius: 14, border: "2px solid var(--gray-100)", fontSize: 14, fontFamily: "inherit", fontWeight: 500 }}
                  />
                </div>
              </div>
            ) : null}

            {mode === "register" || mode === "forgot" || mode === "verify" ? (
              <div style={{ textAlign: "left" }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-400)", marginLeft: 4, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>E-mail</label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@email.com"
                    required
                    disabled={mode === "verify"}
                    style={{ width: "100%", padding: "14px 14px 14px 42px", borderRadius: 14, border: "2px solid var(--gray-100)", fontSize: 14, fontFamily: "inherit", fontWeight: 500, background: mode === "verify" ? "var(--gray-50)" : "white" }}
                  />
                </div>
              </div>
            ) : null}

            {mode === "verify" ? (
              <div style={{ textAlign: "left" }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-400)", marginLeft: 4, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Código de 6 dígitos</label>
                <div style={{ position: "relative" }}>
                  <ShieldCheck size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
                  <input 
                    type="text" 
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="______"
                    required
                    style={{ width: "100%", padding: "16px 14px 16px 42px", borderRadius: 14, border: "2px solid var(--green-200)", fontSize: 20, fontFamily: "inherit", fontWeight: 800, textAlign: "center", letterSpacing: 8 }}
                  />
                </div>
              </div>
            ) : null}

            {(mode === "login" || mode === "register") && (
              <div style={{ textAlign: "left" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-400)", marginLeft: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Senha</label>
                  {mode === "login" && (
                    <span 
                      onClick={() => toggleMode("forgot")}
                      style={{ fontSize: 11, fontWeight: 700, color: "var(--green-600)", cursor: "pointer" }}
                    >Esqueceu a senha?</span>
                  )}
                </div>
                <div style={{ position: "relative" }}>
                  <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{ width: "100%", padding: "14px 14px 14px 42px", borderRadius: 14, border: "2px solid var(--gray-100)", fontSize: 14, fontFamily: "inherit", fontWeight: 500 }}
                  />
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary"
              style={{ 
                marginTop: 10, 
                padding: "16px", 
                justifyContent: "center", 
                fontSize: 15,
                fontWeight: 700,
                borderRadius: 14,
                boxShadow: "0 10px 20px -5px rgba(22, 163, 74, 0.4)"
              }}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                mode === "login" ? <>Entrar agora <ArrowRight size={18} /></> :
                mode === "register" ? <>Criar Minha Conta <ArrowRight size={18} /></> :
                mode === "forgot" ? <>Enviar Código <Mail size={18} /></> :
                <>Verificar Código <ShieldCheck size={18} /></>
              )}
            </button>
          </form>
        )}

        {!revealedPassword && (
          <div style={{ marginTop: 32, fontSize: 13, color: "var(--gray-400)", display: "flex", flexDirection: "column", gap: 16 }}>
            {mode === "login" ? (
              <>Não tem uma conta? <span onClick={() => toggleMode("register")} style={{ color: "var(--green-600)", fontWeight: 700, cursor: "pointer" }}>Cadastrar grátis</span></>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", color: "var(--green-600)", fontWeight: 700 }} onClick={() => toggleMode("login")}>
                <ArrowLeft size={16} /> Voltar para o login
              </div>
            )}

            {/* Botão de Emergência */}
            {/* Botão de Emergência */}
            <div 
              onClick={() => { localStorage.clear(); sessionStorage.clear(); window.location.reload(); }}
              style={{ fontSize: 10, opacity: 0.6, textDecoration: "underline", cursor: "pointer", marginTop: 8 }}
            >
              Problemas para entrar? Clique aqui para limpar o cachê
            </div>

            {/* Status do Banco */}
            <div style={{ 
              marginTop: 16, 
              fontSize: 9, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: 4,
              color: dbStatus === "ok" ? "var(--green-600)" : dbStatus === "error" ? "var(--expense)" : "var(--gray-400)"
            }}>
              <div style={{ 
                width: 6, 
                height: 6, 
                borderRadius: "50%", 
                background: dbStatus === "ok" ? "var(--green-500)" : dbStatus === "error" ? "var(--expense)" : "var(--gray-300)"
              }} />
              {dbStatus === "ok" ? "Conectado ao Servidor" : dbStatus === "error" ? "Falha de Conexão com o Banco" : "Verificando Conexão..."}
            </div>

          </div>
        )}


      </div>
    </div>
  );
}
