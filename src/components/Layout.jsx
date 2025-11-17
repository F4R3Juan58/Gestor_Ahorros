import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { SettingsPanel } from "../components/SettingsPanel";
import { useFinance } from "../context/FinanceContext";

const navItems = [
  { to: "/", label: "Dashboard", description: "Visión general", icon: "🏛️" },
  { to: "/ingresos", label: "Ingresos", description: "Lo que entra", icon: "💼" },
  {
    to: "/subscripciones",
    label: "Subscripciones",
    description: "Servicios activos",
    icon: "🧾",
  },
  { to: "/gastos", label: "Gastos", description: "Variables del mes", icon: "📉" },
  {
    to: "/analitica",
    label: "Analítica",
    description: "Histórico y proyección",
    icon: "📈",
  },
  { to: "/metas", label: "Metas", description: "Objetivos de ahorro", icon: "🎯" },
];

const navLinkClass = ({ isActive }) =>
  [
    "group flex flex-col gap-1 rounded-2xl border px-4 py-3 text-sm transition",
    isActive
      ? "border-white/30 bg-white/10 text-white shadow-[0_18px_40px_rgba(2,6,23,0.65)]"
      : "border-white/5 text-slate-400 hover:border-white/15 hover:text-white",
  ].join(" ");

const formatCurrency = (value) =>
  (value || 0).toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

export const Layout = () => {
  const [openSettings, setOpenSettings] = useState(false);
  const [openMobileNav, setOpenMobileNav] = useState(false);
  const { metrics } = useFinance();

  const healthScore = metrics.totalIncomes
    ? Math.max(Math.min((metrics.savings / metrics.totalIncomes) * 100, 120), -120)
    : 0;
  const coverage = metrics.totalIncomes
    ? (metrics.totalOut / metrics.totalIncomes) * 100
    : 0;

  const healthLabel =
    healthScore >= 40
      ? "Excelente"
      : healthScore >= 10
      ? "Sano"
      : healthScore >= -10
      ? "Neutro"
      : "En alerta";

  const coverageLabel = coverage >= 80 ? "Gastos altos" : coverage >= 55 ? "Controlado" : "Ligero";

  const asideClass = [
    "surface-card md:sticky md:top-12 md:h-fit md:w-72 md:self-start",
    "flex flex-col gap-6 p-4 md:p-6",
    "fixed left-4 right-4 z-40 origin-top md:relative",
    openMobileNav
      ? "translate-y-20 opacity-100"
      : "pointer-events-none -translate-y-6 opacity-0 md:pointer-events-auto md:translate-y-0 md:opacity-100",
    "transition-all duration-300",
  ].join(" ");

  return (
    <div className="min-h-screen app-gradient-bg text-slate-50">
      <div className="pointer-events-none fixed inset-x-0 top-10 z-0 h-[340px] bg-gradient-to-b from-white/5 via-transparent to-transparent" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-5 px-4 py-6 md:flex-row md:gap-8 md:py-12">
        {/* MOBILE TOP BAR */}
        <header className="flex items-center justify-between rounded-[26px] border border-white/5 bg-[#0b1220]/80 px-4 py-3 shadow-[0_20px_45px_rgba(3,7,18,0.65)] backdrop-blur-xl md:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 via-amber-100 to-slate-200 text-[#0f172a] font-semibold">
              €
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">Gestor Ahorros</p>
              <p className="text-[11px] text-slate-400">Panel financiero personal</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpenMobileNav((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg"
            aria-label="Abrir navegación"
          >
            {openMobileNav ? "✕" : "☰"}
          </button>
        </header>

        {openMobileNav && (
          <div
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setOpenMobileNav(false)}
          />
        )}

        {/* SIDEBAR */}
        <aside className={asideClass}>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-white via-amber-100 to-white text-[#0f172a] text-xl font-semibold">
              €
            </div>
            <div>
              <p className="text-base font-semibold">Gestor Ahorros</p>
              <p className="text-xs text-slate-400">Control fino de tus finanzas</p>
            </div>
          </div>

          <nav className="space-y-2 text-sm">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={navLinkClass}
                onClick={() => setOpenMobileNav(false)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <p className="font-medium leading-tight">{item.label}</p>
                    <p className="text-[11px] text-slate-400">{item.description}</p>
                  </div>
                </div>
              </NavLink>
            ))}
          </nav>

          <div className="space-y-3 rounded-[22px] border border-white/5 bg-white/5 p-4 text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <span>Salud financiera</span>
              <span className="font-semibold text-white">{healthLabel}</span>
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-200 via-amber-200 to-slate-200"
                style={{ width: `${Math.min(Math.max(healthScore + 50, 5), 100)}%` }}
              />
            </div>
            <div className="flex flex-col gap-1 text-[11px]">
              <p>
                Cobertura gastos: <span className="font-semibold text-white">{coverageLabel}</span>
              </p>
              <p>Ingreso mensual: {formatCurrency(metrics.totalIncomes)}</p>
              <p>Egresos del mes: {formatCurrency(metrics.totalOut)}</p>
            </div>
          </div>

          <NavLink
            to="/ingresos"
            onClick={() => setOpenMobileNav(false)}
            className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white"
          >
            Registrar un movimiento
          </NavLink>
        </aside>

        {/* MAIN AREA */}
        <main className="relative w-full flex-1 space-y-5 md:space-y-6">
          <div className="hidden items-center justify-between gap-4 rounded-[28px] border border-white/5 bg-[#0a1120]/70 px-6 py-5 shadow-[0_20px_55px_rgba(3,7,18,0.55)] backdrop-blur-xl md:flex">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Panel maestro</p>
              <h1 className="text-2xl font-semibold text-white">Tu resumen financiero a medida</h1>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div>
                <p className="text-[11px] text-slate-400">Ahorro estimado</p>
                <p className="text-lg font-semibold text-emerald-200">{formatCurrency(metrics.savings)}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Gasto mensual</p>
                <p className="text-lg font-semibold text-amber-200">{formatCurrency(metrics.totalOut)}</p>
              </div>
              <button
                onClick={() => setOpenSettings(true)}
                className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white"
              >
                Ajustes
              </button>
            </div>
          </div>

          <div className="rounded-[34px] border border-white/5 bg-[#05070d]/60 p-4 shadow-[0_30px_80px_rgba(2,6,23,0.75)] backdrop-blur-3xl md:p-8">
            <div className="flex justify-end md:hidden">
              <button
                onClick={() => setOpenSettings(true)}
                className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
              >
                Ajustes
              </button>
            </div>
            <Outlet />
          </div>
        </main>
      </div>

      <SettingsPanel open={openSettings} onClose={() => setOpenSettings(false)} />
    </div>
  );
};
