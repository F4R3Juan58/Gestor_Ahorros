import React from "react";
import { useFinance } from "../context/FinanceContext";
import { SectionTitle } from "../components/SectionTitle";
import { SimpleBarChart } from "../components/SimpleBarChart";
import { motion } from "framer-motion";

const formatCurrency = (value) =>
  (value || 0).toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
  });

export const Analytics = () => {
  const { metrics, data } = useFinance();

  const monthlyTrend = metrics.history.slice(-6);
  const hasData = monthlyTrend.length > 0;

  const commentary = hasData
    ? metrics.avgMonthly > 0
      ? "Tu media mensual es positiva: mantén el hábito y reserva parte para tus metas."
      : "La media mensual es negativa. Revisa gastos recurrentes o incrementa tus ingresos."
    : "Registra movimientos para ver recomendaciones personalizadas.";

  const categoryBreakdown = data.goals.reduce((acc, goal) => {
    if (!acc[goal.category]) acc[goal.category] = { amount: 0, count: 0 };
    acc[goal.category].amount += goal.saved;
    acc[goal.category].count += 1;
    return acc;
  }, {});

  const recurrenceGoals = data.goals.filter((goal) => goal.recurrence !== "unica");

  const monthlyTrend = metrics.history.slice(-6);
  const hasData = monthlyTrend.length > 0;

  const commentary = hasData
    ? metrics.avgMonthly > 0
      ? "Tu media mensual es positiva: mantén el hábito y reserva parte para tus metas."
      : "La media mensual es negativa. Revisa gastos recurrentes o incrementa tus ingresos."
    : "Registra movimientos para ver recomendaciones personalizadas.";

  return (
    <div className="space-y-8">
      <SectionTitle
        title="Analítica avanzada"
        subtitle="Visualiza la evolución mensual, proyecciones y oportunidades de mejora."
      />

      <div className="grid gap-8 lg:grid-cols-[1.35fr,0.95fr]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface-card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Ahorro mensual</p>
              <h3 className="text-lg font-semibold text-white">Últimos 12 meses</h3>
            </div>
            <span className="text-xs text-slate-400">Verde = ahorro · Rojo = déficit</span>
          </div>
          <div className="mt-6">
            <SimpleBarChart data={metrics.history.slice(-12)} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="surface-card space-y-6 p-6 text-sm"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Media mensual</p>
            <p className="text-3xl font-semibold text-white">
              {formatCurrency(metrics.avgMonthly)}
            </p>
            <p className="mt-1 text-slate-400">Basado en todos tus registros.</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Proyección anual</p>
            <p className="text-3xl font-semibold text-emerald-200">
              {formatCurrency(metrics.yearlyEstimate)}
            </p>
            <p className="mt-1 text-slate-400">Manteniendo el ritmo actual.</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Comentario</p>
            <p className="mt-2 text-sm text-white">{commentary}</p>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-card grid gap-6 p-6 md:grid-cols-3"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Mes con mejor ahorro</p>
          <p className="mt-2 text-sm text-white">
            {metrics.history.length > 0
              ? metrics.history.reduce((best, item) => (item.value > best.value ? item : best), metrics.history[0]).label
              : "Registra movimientos"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Mes con mayor gasto</p>
          <p className="mt-2 text-sm text-white">
            {metrics.history.length > 0
              ? metrics.history.reduce((worst, item) => (item.value < worst.value ? item : worst), metrics.history[0]).label
              : "Registra movimientos"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Ahorro actual</p>
          <p className="mt-2 text-sm text-white">{formatCurrency(metrics.savings)}</p>
        </div>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface-card space-y-4 p-6"
        >
          <h3 className="text-sm font-semibold text-white">Categorías de metas</h3>
          {Object.keys(categoryBreakdown).length === 0 ? (
            <p className="text-sm text-slate-400">Crea metas para ver su distribución.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(categoryBreakdown).map(([category, info]) => (
                <div key={category} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">{category}</span>
                    <span className="text-xs text-slate-400">{info.count} metas</span>
                  </div>
                  <p className="text-xs text-slate-400">{formatCurrency(info.amount)} ahorrados</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="surface-card space-y-4 p-6"
        >
          <h3 className="text-sm font-semibold text-white">Metas recurrentes</h3>
          {recurrenceGoals.length === 0 ? (
            <p className="text-sm text-slate-400">Activa la recurrencia al crear una meta para automatizar futuras ediciones.</p>
          ) : (
            <div className="space-y-3 text-sm">
              {recurrenceGoals.map((goal) => (
                <div key={goal.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-medium text-white">{goal.name}</p>
                  <p className="text-[11px] text-slate-400">
                    Recurrencia {goal.recurrence} · próximo ciclo {new Date(goal.deadline).toLocaleDateString("es-ES")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-card grid gap-6 p-6 md:grid-cols-3"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Mes con mejor ahorro</p>
          <p className="mt-2 text-sm text-white">
            {metrics.history.length > 0
              ? metrics.history.reduce((best, item) => (item.value > best.value ? item : best), metrics.history[0]).label
              : "Registra movimientos"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Mes con mayor gasto</p>
          <p className="mt-2 text-sm text-white">
            {metrics.history.length > 0
              ? metrics.history.reduce((worst, item) => (item.value < worst.value ? item : worst), metrics.history[0]).label
              : "Registra movimientos"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Ahorro actual</p>
          <p className="mt-2 text-sm text-white">{formatCurrency(metrics.savings)}</p>
        </div>
      </motion.div>
    </div>
  );
};
