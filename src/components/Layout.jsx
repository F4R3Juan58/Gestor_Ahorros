import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { SettingsPanel } from "../components/SettingsPanel";

const navLinkClass = ({ isActive }) =>
  [
    "flex items-center gap-2 px-3 py-2 rounded-2xl text-sm transition",
    isActive
      ? "bg-gradient-to-r from-sky-500/80 via-indigo-500/70 to-fuchsia-500/70 text-white shadow-md shadow-fuchsia-700/40"
      : "text-slate-300 hover:bg-slate-800/60 hover:text-sky-200",
  ].join(" ");

export const Layout = () => {
  const [openSettings, setOpenSettings] = useState(false);
  const [openMobileNav, setOpenMobileNav] = useState(false); // ✅ FALTABA   // ⭐ SETTINGS

  return (
    <div className="min-h-screen app-gradient-bg text-slate-50">
      {/* Fondo */}
      <div className="pointer-events-none fixed inset-0 bg-grid-slate bg-grid-sm opacity-40 mix-blend-soft-light" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:flex-row md:gap-6 md:py-6">

        {/* TOP BAR MÓVIL */}
        <header className="flex items-center justify-between rounded-3xl bg-slate-950/80 px-4 py-3 ring-1 ring-white/10 shadow-soft-xl md:hidden backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-400 via-emerald-400 to-fuchsia-500 shadow-md shadow-sky-500/40">
              <span className="text-xl font-bold text-slate-950">€</span>
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">Savings Modern</p>
              <p className="text-[11px] text-slate-400">Tu panel de control financiero</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpenMobileNav(v => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900/80 text-slate-100 ring-1 ring-slate-700/70 shadow-sm"
          >
            {openMobileNav ? "✕" : "☰"}
          </button>
        </header>

        {/* SIDEBAR */}
        <aside
  className={[
    // 📌 DESKTOP — comportamiento normal
    "md:sticky md:top-6 md:self-start md:w-72 md:space-y-6 md:static",

    // 📌 MOBILE — evitar huecos con position absolute
    "absolute left-4 right-4 z-40 md:relative",

    // 📌 ANIMACIÓN MOBILE
    openMobileNav
      ? "translate-y-20 opacity-100"
      : "translate-y-[-150%] opacity-0",

    "transition-all duration-300"
  ].join(" ")}
>
          <div className="hidden md:flex items-center gap-3 rounded-3xl bg-white/5 p-3 backdrop-blur-xl ring-1 ring-white/10 shadow-lg shadow-slate-950/60">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-400 via-emerald-400 to-fuchsia-500 shadow-lg shadow-sky-500/40">
              <span className="text-2xl font-bold text-slate-950">€</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Savings Modern</h1>
              <p className="text-xs text-slate-300/80">Tu panel de control financiero</p>
            </div>
          </div>

          <nav className="mt-2 space-y-1 rounded-3xl bg-slate-950/60 p-3 backdrop-blur-xl ring-1 ring-white/10 shadow-xl shadow-slate-950/70">
            <NavLink to="/" end className={navLinkClass} onClick={() => setOpenMobileNav(false)}>
              <span>📊</span> <span>Dashboard</span>
            </NavLink>

            <NavLink to="/ingresos" className={navLinkClass} onClick={() => setOpenMobileNav(false)}>
              <span>💰</span> <span>Ingresos</span>
            </NavLink>

            <NavLink to="/subscripciones" className={navLinkClass} onClick={() => setOpenMobileNav(false)}>
              <span>📺</span> <span>Subscripciones</span>
            </NavLink>

            <NavLink to="/gastos" className={navLinkClass} onClick={() => setOpenMobileNav(false)}>
              <span>🧾</span> <span>Gastos extras</span>
            </NavLink>

            <NavLink to="/analitica" className={navLinkClass} onClick={() => setOpenMobileNav(false)}>
              <span>📈</span> <span>Analíticas</span>
            </NavLink>

            <NavLink to="/metas" className={navLinkClass} onClick={() => setOpenMobileNav(false)}>
              <span>🎯</span> <span>Metas</span>
            </NavLink>
          </nav>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="w-full flex-1 md:py-2">
          <div className="rounded-4xl bg-slate-950/85 p-4 md:p-6 shadow-soft-xl ring-1 ring-white/10 backdrop-blur-2xl">

            {/* BOTÓN SETTINGS */}
            <div className="sticky top-4 z-30 flex justify-end pr-2">
              <button
                onClick={() => setOpenSettings(true)}
                className="rounded-2xl bg-slate-900/80 dark:bg-slate-800 px-3 py-2 ring-1 ring-white/10 shadow-md hover:bg-slate-800 transition"
              >
                ⚙️
              </button>
            </div>

            {/* PANEL DE AJUSTES */}
            <SettingsPanel open={openSettings} onClose={() => setOpenSettings(false)} />

            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
