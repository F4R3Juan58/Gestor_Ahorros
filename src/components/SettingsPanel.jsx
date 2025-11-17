import React, { useState } from "react";
import { motion } from "framer-motion";
import { useSettings } from "../context/SettingsContext";
import { useFinance } from "../context/FinanceContext";

export const SettingsPanel = ({ open, onClose }) => {
  const { theme, setTheme, language, setLanguage } = useSettings();
  const { data, metrics, resetData } = useFinance();
  const [copied, setCopied] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const exportCSV = () => {
    const rows = [
      ["Tipo", "Nombre", "Cantidad", "Fecha"],
      ...data.incomes.map((i) => ["Ingreso", i.name, i.amount, i.date]),
      ...data.expenses.map((e) => ["Gasto", e.name, e.amount, e.date]),
      ...data.subscriptions.map((s) => ["Subscripción", s.name, s.cost, s.startDate]),
      ...data.goals.map((g) => ["Meta", g.name, g.cost, g.months]),
    ];

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "finanzas.csv";
    link.click();
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "finanzas.json";
    link.click();
  };

  const copySummary = async () => {
    const summary = `Ingresos: ${metrics.totalIncomes.toFixed(2)} € | Gastos: ${metrics.totalOut.toFixed(
      2
    )} € | Ahorro estimado: ${metrics.savings.toFixed(2)} €`;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error(error);
    }
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 4000);
      return;
    }
    resetData();
    setConfirmReset(false);
    onClose?.();
  };

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-40 flex items-start justify-center bg-black/50 px-4 py-10 backdrop-blur-sm md:items-center"
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="surface-card w-full max-w-md space-y-6 p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.4em] text-slate-400">Centro</p>
            <h2 className="text-xl font-semibold text-white">Ajustes rápidos</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-sm text-white"
          >
            Cerrar
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Tema</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {["light", "dark", "system"].map((option) => (
                <button
                  key={option}
                  onClick={() => setTheme(option)}
                  className={`rounded-2xl border px-3 py-2 capitalize ${
                    theme === option
                      ? "border-white/40 bg-white/10 text-white"
                      : "border-white/10 text-slate-400"
                  }`}
                >
                  {option === "light" ? "Claro" : option === "dark" ? "Oscuro" : "Auto"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Idioma</p>
            <select
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="es">Español</option>
              <option value="en">Inglés</option>
            </select>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Acciones rápidas</p>
          <div className="grid gap-3">
            <button
              onClick={exportCSV}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-white"
            >
              Exportar datos en CSV
              <span className="block text-[11px] text-slate-400">Ideal para hojas de cálculo</span>
            </button>
            <button
              onClick={exportJSON}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-white"
            >
              Exportar respaldo JSON
              <span className="block text-[11px] text-slate-400">Perfecto para compartir o migrar</span>
            </button>
            <button
              onClick={copySummary}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-white"
            >
              {copied ? "Copiado ✅" : "Copiar resumen mensual"}
              <span className="block text-[11px] text-slate-400">Ingresos vs gastos del mes</span>
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-rose-300/20 bg-rose-500/10 p-4 text-sm text-rose-100">
          <p className="text-xs uppercase tracking-[0.3em] text-rose-200">Zona segura</p>
          <p className="mt-1 text-base font-semibold text-white">Restablecer información</p>
          <p className="mt-1 text-xs text-rose-100/80">
            {confirmReset
              ? "Confirma de nuevo para borrar todos tus registros."
              : "Esta acción eliminará tus datos guardados en este dispositivo."}
          </p>
          <button
            onClick={handleReset}
            className="mt-3 inline-flex items-center justify-center rounded-2xl border border-rose-200/40 bg-rose-500/20 px-4 py-2 text-sm font-semibold text-white"
          >
            {confirmReset ? "Confirmar eliminación" : "Vaciar gestor"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
