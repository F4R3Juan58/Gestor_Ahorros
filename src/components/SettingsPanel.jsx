import React from "react";
import { motion } from "framer-motion";
import { useSettings } from "../context/SettingsContext";
import { useFinance } from "../context/FinanceContext";



export const SettingsPanel = ({ open, onClose }) => {
  const { theme, setTheme, language, setLanguage } = useSettings();
  const { data } = useFinance();

  // Exportar CSV
  const exportCSV = () => {
    const rows = [
      ["Tipo", "Nombre", "Cantidad", "Fecha"],
      ...data.incomes.map(i => ["Ingreso", i.name, i.amount, i.date]),
      ...data.expenses.map(e => ["Gasto", e.name, e.amount, e.date]),
      ...data.subscriptions.map(s => ["Subscripción", s.name, s.cost, s.startDate]),
      ...data.goals.map(g => ["Meta", g.name, g.cost, g.months]),
    ];

    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "finanzas.csv";
    link.click();
  };

  return open ? (
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  className="
    fixed inset-0 z-40 bg-black/40 backdrop-blur-sm
    flex justify-center
    md:items-center          /* solo centrado vertical en desktop */
    items-start pt-20        /* móvil: arriba con padding */
  "
  onClick={onClose}
>
  <motion.div
    onClick={(e) => e.stopPropagation()}
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className="
      rounded-3xl p-6 w-80
      bg-white dark:bg-slate-900
      shadow-2xl ring-1 ring-black/10 dark:ring-white/10
    "
  >
        <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">
          Ajustes
        </h2>

        {/* Tema */}
        <div className="mb-4">
          <p className="text-sm mb-1 text-slate-700 dark:text-slate-300">Tema</p>
          <select
            className="w-full rounded-xl p-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            <option value="light">Claro</option>
            <option value="dark">Oscuro</option>
            <option value="system">Automático</option>
          </select>
        </div>

        {/* Idioma */}
        <div className="mb-4">
          <p className="text-sm mb-1 text-slate-700 dark:text-slate-300">Idioma</p>
          <select
            className="w-full rounded-xl p-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="es">Español</option>
            <option value="en">Inglés</option>
          </select>
        </div>

        {/* CSV */}
        <button
          onClick={exportCSV}
          className="w-full rounded-xl py-2 bg-gradient-to-r from-sky-500 to-fuchsia-500 text-white font-semibold shadow-lg"
        >
          Exportar datos (CSV)
        </button>
      </motion.div>
    </motion.div>
  ) : null;
};
