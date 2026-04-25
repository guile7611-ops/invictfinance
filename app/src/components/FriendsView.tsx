"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useApp, FriendDebt } from "@/context/AppContext";
import { format, parseISO } from "date-fns";
import { 
  Users, 
  Search, 
  UserPlus, 
  HandCoins, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2,
  MoreVertical,
  X,
  User as UserIcon,
  Check,
  Ban
} from "lucide-react";

type Friend = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  balance: number;
};

type DebtRecord = {
  id: string;
  friendId: string;
  amount: number;
  type: "loan" | "debt";
  status: "pending" | "paid";
  date: string;
  description: string;
};

// Initial records for demo
export default function FriendsView() {
  const { user, sendFriendRequest, acceptFriendRequest, declineFriendRequest, storedUsers } = useAuth();
  const { friendDebts, addFriendDebt, updateFriendDebtStatus, removeFriendDebt } = useApp();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [debtType, setDebtType] = useState<"loan" | "debt">("loan");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);

  const [searchUsername, setSearchUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [friendSearchTerm, setFriendSearchTerm] = useState("");

  const handleAccept = async (id: string) => {
    try {
      await acceptFriendRequest(id);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await declineFriendRequest(id);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Map user data
  const friends: Friend[] = (user?.friendIds || []).map((id: string) => {
    const friendUser = storedUsers.find(u => u.id === id);
    if (!friendUser) return null;
    return {
      id: friendUser.id,
      name: friendUser.name,
      username: `@${friendUser.username}`,
      avatar: friendUser.avatar || `https://ui-avatars.com/api/?name=${friendUser.name}&background=random`,
      balance: 0
    };
  }).filter(Boolean) as Friend[];

  const incomingRequests = (user?.friendRequests || []).map((id: string) => {
    const reqUser = storedUsers.find(u => u.id === id);
    return reqUser ? { id: reqUser.id, name: reqUser.name, username: `@${reqUser.username}`, avatar: reqUser.avatar } : null;
  }).filter(Boolean);

  const outgoingRequestsCount = (user?.outgoingRequests || []).length;

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await sendFriendRequest(searchUsername);
      setSearchUsername("");
      setShowAddModal(false);
      alert("Solicitação enviada com sucesso!");
    } catch (err: any) {
      setError(err.message || "Erro ao enviar solicitação");
    } finally {
      setLoading(false);
    }
  };

  // Calculate balances per friend
  const friendsWithBalance = useMemo(() => {
    return (user?.friendIds || []).map((id: string) => {
      const friendUser = storedUsers.find(u => u.id === id);
      if (!friendUser) return null;
      
      const balance = friendDebts
        .filter(d => d.status === 'pending' && (d.lender_id === id || d.debtor_id === id))
        .reduce((acc, d) => {
          if (d.lender_id === user?.id) return acc + d.amount; // Eu emprestei, saldo +
          if (d.debtor_id === user?.id) return acc - d.amount; // Eu devo, saldo -
          return acc;
        }, 0);

      return {
        id: friendUser.id,
        name: friendUser.name,
        username: `@${friendUser.username}`,
        avatar: friendUser.avatar || `https://ui-avatars.com/api/?name=${friendUser.name}&background=random`,
        balance
      };
    }).filter(Boolean) as Friend[];
  }, [user?.friendIds, storedUsers, friendDebts, user?.id]);

  const totalToReceive = useMemo(() => friendDebts.filter(r => r.lender_id === user?.id && r.status === "pending").reduce((acc, r) => acc + r.amount, 0), [friendDebts, user?.id]);
  const totalToPay = useMemo(() => friendDebts.filter(r => r.debtor_id === user?.id && r.status === "pending").reduce((acc, r) => acc + r.amount, 0), [friendDebts, user?.id]);

  const handleAddDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFriend || !user) return;
    setLoading(true);
    try {
      await addFriendDebt({
        lender_id: debtType === "loan" ? user.id : selectedFriend.id,
        debtor_id: debtType === "debt" ? user.id : selectedFriend.id,
        amount: parseFloat(amount),
        description,
        status: "pending",
        due_date: dueDate
      });
      setShowDebtModal(false);
      setAmount("");
      setDescription("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSettle = async (recordId: string) => {
    if (!window.confirm("Deseja marcar esta cobrança como quitada?")) return;
    try {
      await updateFriendDebtStatus(recordId, "paid");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="view-container" style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 40 }}>
      {/* Header Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card" style={{ borderLeft: "4px solid var(--income)", display: "flex", alignItems: "center", gap: 16, padding: "20px 24px" }}>
          <div style={{ background: "var(--green-50)", color: "var(--income)", padding: 12, borderRadius: 12 }}>
            <ArrowUpRight size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--gray-500)", fontWeight: 500 }}>A Receber de Amigos</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--gray-900)" }}>R$ {totalToReceive.toLocaleString('pt-BR')}</div>
          </div>
        </div>
        <div className="card" style={{ borderLeft: "4px solid var(--expense)", display: "flex", alignItems: "center", gap: 16, padding: "20px 24px" }}>
          <div style={{ background: "#fef2f2", color: "var(--expense)", padding: 12, borderRadius: 12 }}>
            <ArrowDownLeft size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--gray-500)", fontWeight: 500 }}>A Pagar para Amigos</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--gray-900)" }}>R$ {totalToPay.toLocaleString('pt-BR')}</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: 24 }}>
        {/* Left: Friends & Requests List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* Main Friends List */}
          <div className="card" style={{ padding: 0, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800 }}>Meus Amigos</h3>
                <div style={{ display: "flex", gap: 10 }}>
                  <button 
                    onClick={() => setShowRequestsModal(true)}
                    style={{ 
                      padding: "6px 12px", 
                      fontSize: 12, 
                      borderRadius: 10, 
                      border: "1px solid var(--gray-200)", 
                      background: "white", 
                      color: "var(--gray-900)", 
                      fontWeight: 700,
                      display: "flex", 
                      alignItems: "center", 
                      gap: 6,
                      position: "relative",
                      cursor: "pointer"
                    }}
                  >
                    <Users size={14} /> Solicitações
                    {incomingRequests.length > 0 && (
                      <div style={{
                        position: "absolute", top: -6, right: -6, background: "var(--expense)", color: "white", 
                        fontSize: 10, fontWeight: 800, width: 18, height: 18, borderRadius: 9, 
                        display: "flex", alignItems: "center", justifyContent: "center",
                        border: "2px solid white"
                      }}>
                        {incomingRequests.length}
                      </div>
                    )}
                  </button>
                  <button 
                    className="btn-primary" 
                    style={{ padding: "6px 12px", fontSize: 12 }}
                    onClick={() => setShowAddModal(true)}
                  >
                    <UserPlus size={14} /> Novo
                  </button>
                </div>
              </div>
              <div className="search-wrap">
                <Search size={14} className="search-icon" />
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Filtrar por nome..." 
                  value={friendSearchTerm}
                  onChange={(e) => setFriendSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {friendsWithBalance.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: "var(--gray-400)", fontSize: 13 }}>
                  {outgoingRequestsCount > 0 
                    ? `Aguardando aceitação de ${outgoingRequestsCount} convite(s)...` 
                    : "Sua lista de amigos está vazia."}
                </div>
              ) : (
                friendsWithBalance.filter(f => f.name.toLowerCase().includes(friendSearchTerm.toLowerCase()) || f.username.toLowerCase().includes(friendSearchTerm.toLowerCase())).map(friend => (
                  <div 
                    key={friend.id} 
                    onClick={() => {
                      setSelectedFriend(friend);
                      setAmount("");
                      setDescription("");
                      setError("");
                      setDebtType("loan");
                      setShowDebtModal(true);
                    }}
                    style={{ 
                      padding: "16px 24px", 
                      display: "flex", 
                      alignItems: "center", 
                      gap: 12, 
                      borderTop: "1.5px solid var(--gray-50)",
                      cursor: "pointer",
                      transition: "background 0.2s"
                    }} className="hover-item"
                  >
                    <img src={friend.avatar} alt={friend.name} style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--gray-100)" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{friend.name}</div>
                      <div style={{ fontSize: 12, color: "var(--gray-400)" }}>{friend.username}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ 
                        fontSize: 13, 
                        fontWeight: 700, 
                        color: friend.balance > 0 ? "var(--income)" : friend.balance < 0 ? "var(--expense)" : "var(--gray-400)" 
                      }}>
                        {friend.balance === 0 ? "Quitado" : `R$ ${Math.abs(friend.balance).toLocaleString('pt-BR')}`}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Active Records */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: 24, borderBottom: "1.5px solid var(--gray-50)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800 }}>Empréstimos e Cobranças</h3>
              <p style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 4 }}>Controle detalhado de débitos entre amigos</p>
            </div>
            <button 
              className="btn-outline" 
              style={{ display: "flex", alignItems: "center", gap: 8 }}
              onClick={() => {
                setSelectedFriend(null);
                setAmount("");
                setDescription("");
                setError("");
                setDebtType("loan");
                setShowDebtModal(true);
              }}
            >
              <HandCoins size={16} /> Registrar Acerto
            </button>
          </div>

          <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            {friendDebts.filter(d => d.status === 'pending').length === 0 ? (
               <div style={{ padding: 40, textAlign: "center", color: "var(--gray-400)", fontSize: 13 }}>
                  Nenhum empréstimo registrado.
               </div>
            ) : (
              friendDebts.filter(d => d.status === 'pending').map(record => {
                const isLender = record.lender_id === user?.id;
                const friendId = isLender ? record.debtor_id : record.lender_id;
                const friend = friendsWithBalance.find(f => f.id === friendId);
                
                return (
                  <div key={record.id} style={{ 
                    background: "var(--gray-50)", 
                    padding: 16, 
                    borderRadius: 16, 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 16,
                    border: "1.5px solid var(--gray-100)"
                  }}>
                    <div style={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: 12, 
                      background: isLender ? "var(--green-100)" : "#fee2e2",
                      color: isLender ? "var(--income)" : "var(--expense)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      {isLender ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{record.description}</div>
                      <div style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 2 }}>
                        {isLender ? "Emprestado para" : "Devendo para"} <strong>{friend?.name || "Amigo"}</strong>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "var(--gray-900)" }}>
                        R$ {record.amount.toLocaleString('pt-BR')}
                      </div>
                      <div 
                        onClick={() => handleSettle(record.id)}
                        style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end", marginTop: 4, cursor: "pointer" }}
                      >
                        <Clock size={12} style={{ color: "var(--pending)" }} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--pending)" }}>Pendente</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            <div 
              onClick={() => {
                setSelectedFriend(null);
                setAmount("");
                setDescription("");
                setError("");
                setDebtType("loan");
                setShowDebtModal(true);
              }}
              style={{ 
              marginTop: 10,
              padding: 20, 
              border: "2px dashed var(--gray-200)", 
              borderRadius: 16, 
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s"
            }} className="hover-dashed">
              <div style={{ color: "var(--gray-400)", fontSize: 14 }}>
                 Clique para registrar um novo empréstimo ou cobrança
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Friend Modal */}
      {showAddModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: 20
        }}>
          <div className="card fade-up" style={{ width: "100%", maxWidth: 400, padding: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800 }}>Enviar Convite</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: "none", border: "none", color: "var(--gray-400)", cursor: "pointer" }}>
                <X size={24} />
              </button>
            </div>

            {error && (
              <div style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", color: "#dc2626", padding: 12, borderRadius: 12, fontSize: 13, marginBottom: 20, fontWeight: 600 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSendRequest} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", marginBottom: 8, textTransform: "uppercase" }}>Usuário do seu amigo</label>
                <div style={{ position: "relative" }}>
                  <UserIcon size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
                  <input 
                    type="text" 
                    value={searchUsername}
                    onChange={(e) => setSearchUsername(e.target.value)}
                    placeholder="Ex: joao_finance"
                    required
                    autoFocus
                    style={{ width: "100%", padding: "14px 14px 14px 44px", borderRadius: 14, border: "2px solid var(--gray-100)", fontSize: 14, fontFamily: "inherit" }}
                  />
                </div>
                <p style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 8 }}>O vínculo só será formado quando o seu amigo aceitar o convite.</p>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary" 
                style={{ width: "100%", padding: 14, justifyContent: "center", fontWeight: 700 }}
              >
                {loading ? "Processando..." : "Enviar Convite"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Debt Modal */}
      {showDebtModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: 20
        }}>
          <div className="card fade-up" style={{ width: "100%", maxWidth: 450, padding: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800 }}>Novo Registro</h3>
                <p style={{ fontSize: 13, color: "var(--gray-500)" }}>Registrar transação com um amigo</p>
              </div>
              <button onClick={() => setShowDebtModal(false)} style={{ background: "none", border: "none", color: "var(--gray-400)", cursor: "pointer" }}>
                <X size={24} />
              </button>
            </div>

            {error && (
              <div style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", color: "#dc2626", padding: 12, borderRadius: 12, fontSize: 13, marginBottom: 20, fontWeight: 600 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleAddDebt} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, background: "var(--gray-50)", padding: 4, borderRadius: 12 }}>
                <button 
                  type="button"
                  onClick={() => setDebtType("loan")}
                  style={{ 
                    padding: "10px", 
                    borderRadius: 10, 
                    border: "none", 
                    fontSize: 13, 
                    fontWeight: 700,
                    cursor: "pointer",
                    background: debtType === "loan" ? "white" : "transparent",
                    boxShadow: debtType === "loan" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                    color: debtType === "loan" ? "var(--income)" : "var(--gray-400)"
                  }}
                >
                  Eu emprestei
                </button>
                <button 
                  type="button"
                  onClick={() => setDebtType("debt")}
                  style={{ 
                    padding: "10px", 
                    borderRadius: 10, 
                    border: "none", 
                    fontSize: 13, 
                    fontWeight: 700,
                    cursor: "pointer",
                    background: debtType === "debt" ? "white" : "transparent",
                    boxShadow: debtType === "debt" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                    color: debtType === "debt" ? "var(--expense)" : "var(--gray-400)"
                  }}
                >
                  Eu devo
                </button>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", marginBottom: 8 }}>AMIGO</label>
                <select 
                  value={selectedFriend?.id || ""} 
                  onChange={(e) => {
                    const friend = friendsWithBalance.find(f => f.id === e.target.value);
                    setSelectedFriend(friend || null);
                  }}
                  required
                  style={{ width: "100%", padding: 14, borderRadius: 12, border: "2px solid var(--gray-100)", fontSize: 14, fontFamily: "inherit", backgroundColor: "white" }}
                >
                  <option value="" disabled>Selecione um amigo</option>
                  {friendsWithBalance.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", marginBottom: 8 }}>VALOR</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  required
                  style={{ width: "100%", padding: 14, borderRadius: 12, border: "2px solid var(--gray-100)", fontSize: 16, fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", marginBottom: 8 }}>DESCRIÇÃO</label>
                <input 
                  type="text" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Almoço Outback"
                  required
                  style={{ width: "100%", padding: 14, borderRadius: 12, border: "2px solid var(--gray-100)", fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", marginBottom: 8 }}>DATA DE VENCIMENTO</label>
                <input 
                  type="date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  style={{ width: "100%", padding: 14, borderRadius: 12, border: "2px solid var(--gray-100)", fontSize: 14 }}
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary" 
                style={{ width: "100%", padding: 14, justifyContent: "center", fontWeight: 700, marginTop: 10 }}
              >
                {loading ? "Registrando..." : "Confirmar Registro"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Requests Modal */}
      {showRequestsModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20
        }}>
          <div style={{
            background: "white", borderRadius: 24, padding: 32, width: "100%", maxWidth: 440,
            boxShadow: "0 24px 48px rgba(0,0,0,0.1)", position: "relative"
          }}>
            <button 
              onClick={() => setShowRequestsModal(false)}
              style={{ position: "absolute", top: 24, right: 24, background: "none", border: "none", color: "var(--gray-400)", cursor: "pointer" }}
            >
              <X size={24} />
            </button>

            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24, color: "var(--gray-900)" }}>
              Solicitações de Amizade
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {incomingRequests.length === 0 ? (
                <div style={{ padding: 30, textAlign: "center", color: "var(--gray-400)", fontSize: 14 }}>
                  Você não tem nenhuma solicitação no momento.
                </div>
              ) : (
                incomingRequests.map((req: any) => (
                  <div key={req.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--gray-50)", padding: 16, borderRadius: 16, border: "1px solid var(--gray-100)" }}>
                    <img src={req.avatar} style={{ width: 40, height: 40, borderRadius: "50%" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{req.name}</div>
                      <div style={{ fontSize: 12, color: "var(--gray-400)" }}>{req.username}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button 
                        onClick={async () => {
                          await handleAccept(req.id);
                        }}
                        style={{ padding: 8, borderRadius: 10, border: "none", background: "var(--green-500)", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <Check size={18} />
                      </button>
                      <button 
                        onClick={async () => {
                          await handleDecline(req.id);
                        }}
                        style={{ padding: 8, borderRadius: 10, border: "none", background: "#fee2e2", color: "var(--expense)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <Ban size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
