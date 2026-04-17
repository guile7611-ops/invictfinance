"use client";

import { Plus, Calendar } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function Topbar() {
  const { openModal } = useApp();

  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const monthName = now.toLocaleDateString("pt-BR", { month: "long" });
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  return (
    <header className="topbar fade-up fade-up-1">
      <div className="topbar-title">
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <h1>Dashboard</h1>
          <span style={{ 
            fontSize: 14, 
            fontWeight: 700, 
            color: "var(--primary)", 
            background: "var(--primary-shadow)", 
            padding: "2px 10px", 
            borderRadius: 20,
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>
            {capitalizedMonth}
          </span>
        </div>
        <p>
          <Calendar size={12} style={{ display: "inline", marginRight: 4 }} aria-hidden="true" />
          {dateStr}
        </p>
      </div>

      <div className="topbar-actions">
      </div>
    </header>
  );
}
