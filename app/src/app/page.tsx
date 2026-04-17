"use client";

import { useState } from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import DashboardFilters from "@/components/DashboardFilters";
import KpiCards from "@/components/KpiCards";
import CashflowChart from "@/components/CashflowChart";
import GlobalCategoryChart from "@/components/GlobalCategoryChart";
import SavingsPanel from "@/components/SavingsPanel";
import TransactionsTable from "@/components/TransactionsTable";
import AlertsPanel from "@/components/AlertsPanel";
import TransactionModal from "@/components/TransactionModal";
import RecurrenceModal from "@/components/RecurrenceModal";
import QuickConfirmModal from "@/components/QuickConfirmModal";
import GoalModal from "@/components/GoalModal";
import LoginView from "@/components/LoginView";
import MockEmailInbox from "@/components/MockEmailInbox";



// Views
import RecurrencesView from "@/components/RecurrencesView";
import PendingView from "@/components/PendingView";
import GoalsView from "@/components/GoalsView";
import CardsView from "@/components/CardsView";
import FriendsView from "@/components/FriendsView";
import CardModal from "@/components/CardModal";
import InstallmentModal from "@/components/InstallmentModal";
import MobileNav from "@/components/MobileNav";
import SettingsPage from "@/components/SettingsPage";


function DashboardContent() {
  const { activeSection, pendenciasCount } = useApp();


  const renderSection = () => {
    const { activeSection, displayMode } = useApp();

    switch (activeSection) {
      case "dashboard":
        return (
          <>
            <DashboardFilters />
            
            {displayMode === 'grid' ? (
              <>
                <KpiCards />
                <div className="dashboard-grid" style={{ marginBottom: 24 }}>
                  <CashflowChart />
                  <GlobalCategoryChart />
                </div>
                <div className="dashboard-grid">
                  <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    <TransactionsTable mode="all" fixedStatus="completed" />
                    <SavingsPanel />
                  </div>
                  <AlertsPanel />
                </div>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div className="card" style={{ height: 500 }}>
                   <div className="card-header">
                      <h3 className="card-title">Timeline de Fluxo de Caixa</h3>
                      <p className="card-subtitle">Análise detalhada de projeções e histórico</p>
                   </div>
                   <CashflowChart fullWidth />
                </div>
                <TransactionsTable mode="all" fixedStatus="completed" />
              </div>
            )}
          </>
        );
      case "expenses_view":
        return <TransactionsTable mode="expenses" />;
      case "income_view":
        return <TransactionsTable mode="income" />;
      case "recurrences":
        return <RecurrencesView />;
      case "pending":
        return <PendingView />;
      case "goals":
        return <GoalsView />;
      case "cards":
        return <CardsView />;
      case "friends":
        return <FriendsView />;
      case "settings":
        return <SettingsPage />;
      default:
        return (
          <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--gray-400)" }}>
            A seção <strong>{activeSection}</strong> ainda está em desenvolvimento.
          </div>
        );
    }
  };

  return (
    <main className="main-content" id="main-content" tabIndex={-1}>
      <Topbar />
      {renderSection()}
    </main>
  );
}

function MainLayout() {
  const { isAuthenticated, isLoaded } = useAuth();


  if (!isLoaded) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-main)" }}>
        <div className="loader"></div> {/* Presumindo que exista um loader no globals.css ou usar algo simples */}
        <div style={{ color: "var(--primary)", fontWeight: 800, fontSize: 18 }}>Carregando sua sessão...</div>
      </div>
    );
  }

  if (!isAuthenticated) return <LoginView />;

  return (
    <AppProvider>
      <LayoutContent />
    </AppProvider>

  );
}

function LayoutContent() {
  const { 
    activeSection, 
    setActiveSection, 
    isRecurrenceModalOpen, 
    closeRecurrenceModal,
    isCardModalOpen,
    closeCardModal,
    isInstallmentModalOpen,
    closeInstallmentModal
  } = useApp();

  return (
    <div className="layout">
      <Sidebar activeSection={activeSection} onNavigate={setActiveSection} />
      <DashboardContent />

      
      {/* Modais Globais */}
      <TransactionModal />
      <QuickConfirmModal />
      <GoalModal />
      <CardModal 
        isOpen={isCardModalOpen} 
        onClose={closeCardModal} 
      />
      <InstallmentModal 
        isOpen={isInstallmentModalOpen} 
        onClose={closeInstallmentModal} 
      />
      <RecurrenceModal 
        isOpen={isRecurrenceModalOpen} 
        onClose={closeRecurrenceModal} 
      />
      <MobileNav />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthProvider>
      <MainLayout />
      <MockEmailInbox />
    </AuthProvider>
  );
}

