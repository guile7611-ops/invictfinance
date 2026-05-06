"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, Calendar, AlertCircle, ArrowRight, X } from 'lucide-react';

export default function MonthlyClosureModal() {
  const { 
    pastPendingItems, 
    isClosureModalOpen, 
    closeClosureModal,
    confirmPastItem,
    rolloverPastItem,
    ignorePastItem,
    selectedMonth
  } = useApp() as any;

  if (!isClosureModalOpen || !pastPendingItems?.length) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 1000 }}>
      <div className="card modal-content animate-in fade-in zoom-in duration-300" style={{ 
        maxWidth: 550, 
        padding: 0, 
        overflow: 'hidden',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.7)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        <div className="modal-header" style={{ 
          padding: '24px 28px', 
          borderBottom: '1px solid var(--gray-100)',
          background: 'rgba(255, 255, 255, 0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="icon-box pulse" style={{ 
              background: 'rgba(217, 119, 6, 0.1)', 
              color: 'var(--pending)',
              width: 48,
              height: 48,
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertCircle size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--gray-900)', margin: 0 }}>Fechamento de Mês</h2>
              <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>Existem pendências anteriores que precisam de atenção.</p>
            </div>
          </div>
        </div>

        <div className="modal-body" style={{ 
          maxHeight: '50vh', 
          overflowY: 'auto', 
          padding: '20px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
          {pastPendingItems.map((t: any) => (
            <div 
              key={t.id} 
              className="kpi-card" 
              style={{ 
                padding: 20, 
                background: 'white',
                border: '1px solid var(--gray-100)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                cursor: 'default'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ 
                      fontSize: 10, 
                      textTransform: 'uppercase', 
                      letterSpacing: '1px', 
                      color: 'var(--gray-400)',
                      fontWeight: 700 
                    }}>
                      {format(parseISO(t.originalDate || t.date || new Date().toISOString()), "MMMM yyyy", { locale: ptBR })}
                    </span>
                    <span className="status-badge" style={{ background: 'rgba(220, 38, 38, 0.1)', color: 'var(--expense)', fontSize: 9 }}>ATRASADO</span>
                  </div>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--gray-900)' }}>{t.title || t.description}</h4>
                  <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{t.category}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontSize: 20, 
                    fontWeight: 800, 
                    color: t.type === 'expense' ? 'var(--expense)' : 'var(--income)' 
                  }}>
                    {t.type === 'expense' ? '-' : '+'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(t.amount))}
                  </div>
                </div>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr 1fr', 
                gap: 10, 
                paddingTop: 4
              }}>
                <button 
                  onClick={() => confirmPastItem(t.id, t.type)}
                  className="btn-outline"
                  style={{ 
                    fontSize: 11, 
                    padding: '10px 8px', 
                    justifyContent: 'center',
                    borderColor: 'rgba(22, 163, 74, 0.2)',
                    color: 'var(--income)',
                    background: 'rgba(22, 163, 74, 0.05)'
                  }}
                >
                  <Check size={14} />
                  Confirmar
                </button>
                <button 
                  onClick={() => rolloverPastItem(t.id, t.type, selectedMonth)}
                  className="btn-primary"
                  style={{ 
                    fontSize: 11, 
                    padding: '10px 8px', 
                    justifyContent: 'center',
                    background: 'var(--sidebar-bg)'
                  }}
                >
                  <ArrowRight size={14} />
                  Mover p/ Hoje
                </button>
                <button 
                  onClick={() => ignorePastItem(t.id, t.type)}
                  className="btn-outline"
                  style={{ 
                    fontSize: 11, 
                    padding: '10px 8px', 
                    justifyContent: 'center',
                    borderColor: 'rgba(220, 38, 38, 0.2)',
                    color: 'var(--expense)',
                    background: 'rgba(220, 38, 38, 0.05)'
                  }}
                >
                  <X size={14} />
                  Ignorar
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="modal-footer" style={{ 
          padding: '20px 28px', 
          background: 'var(--gray-50)',
          borderTop: '1px solid var(--gray-100)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--gray-500)', fontSize: 11, fontWeight: 500, flex: 1 }}>
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            <span>Itens ignorados não afetarão o saldo real.</span>
          </div>
          <button 
            onClick={closeClosureModal} 
            style={{ 
              background: 'transparent',
              border: 'none',
              color: 'var(--gray-400)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              padding: '8px 12px'
            }}
          >
            Resolver depois
          </button>
        </div>
      </div>
    </div>
  );
}
