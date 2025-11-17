import React from "react";
import { useFinance } from "../context/FinanceContext";
import { SectionTitle } from "../components/SectionTitle";
import { SimpleBarChart } from "../components/SimpleBarChart";
import { motion } from "framer-motion";

export const Analytics = () => {
  const { metrics } = useFinance();

  return (
    <div className="space-y-8">
      <SectionTitle
        title="Analíticas de ahorro"
        subtitle="Visualiza tu evolución mensual y tu proyección anual con claridad."
      />

      <div className="grid gap-8 md:grid-cols-[1.35fr,0.95fr]">

        {/* GRAFICO PRINCIPAL */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-4xl bg-slate-950/70 backdrop-blur-xl p-6 ring-1 ring-white/10 shadow-xl shadow-black/40"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-100 tracking-tight">
              Ahorro mensual (últimos 12 meses)
            </h3>
            <span className="text-xs text-slate-400">
              Verde = ahorro · Rojo = déficit
            </span>
          </div>

          <div className="mt-5">
            <SimpleBarChart data={metrics.history.slice(-12)} />
          </div>
        </motion.div>

        {/* TARJETAS DE DATOS */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="space-y-6 rounded-4xl bg-slate-950/70 backdrop-blur-xl p-6 ring-1 ring-white/10 shadow-xl shadow-black/40 text-sm"
        >
          {/* Media mensual */}
          <div className="space-y-1">
            <p className="text-xs text-slate-300">Media de ahorro mensual</p>
            <p className="text-3xl font-semibold bg-gradient-to-r from-sky-300 to-sky-500 bg-clip-text text-transparent">
              {metrics.avgMonthly.toLocaleString("es-ES", {
                style: "currency",
                currency: "EUR",
              })}
            </p>
            <p className="text-xs text-slate-400">
              Basado en tus últimos movimientos.
            </p>
          </div>

          {/* Ahorro anual estimado */}
          <div className="space-y-1 pt-2">
            <p className="text-xs text-slate-300">Ahorro anual estimado</p>
            <p className="text-3xl font-semibold bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
              {metrics.yearlyEstimate.toLocaleString("es-ES", {
                style: "currency",
                currency: "EUR",
              })}
            </p>
            <p className="text-xs text-slate-400">
              Manteniendo tu ritmo actual de ahorro.
            </p>
          </div>

          {/* Tip consejo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="mt-4 rounded-3xl bg-gradient-to-br from-sky-700/20 via-indigo-700/20 to-fuchsia-700/20 p-4 ring-1 ring-sky-500/40 shadow-md shadow-black/30"
          >
            <h4 className="text-sm font-medium text-sky-200">Consejo útil</h4>
            <p className="mt-1 text-xs text-slate-200/90 leading-relaxed">
              Controla tus gastos variables (comida fuera, ocio, compras impulsivas).
              Reducir pequeñas cantidades cada mes puede elevar mucho tu ahorro anual.
            </p>
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
};
