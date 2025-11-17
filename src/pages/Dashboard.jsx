import React from "react";
import { motion } from "framer-motion";
import { useFinance } from "../context/FinanceContext";
import { StatCard } from "../components/StatCard";
import { SimpleBarChart } from "../components/SimpleBarChart";
import { SectionTitle } from "../components/SectionTitle";

export const Dashboard = () => {
  const { metrics, data } = useFinance();
  const upcomingGoals = data.goals.slice(0, 3);

  const totalGoals = data.goals.length;
  const completedGoals = data.goals.filter(
    (g) => g.cost > 0 && g.saved >= g.cost
  ).length;

  return (
    <div className="space-y-8 md:space-y-10">
      <SectionTitle
        title="Dashboard"
        subtitle="Resumen rápido de tu situación actual de ahorro."
      />

      {/* HERO PRINCIPAL */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-3xl bg-gradient-to-br from-slate-900/80 via-slate-950/80 to-slate-900/80 p-6 md:p-8 ring-1 ring-white/10 backdrop-blur-2xl shadow-2xl shadow-black/40"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          {/* Izquierda: saludo + ahorro del mes */}
          <div className="space-y-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-white">
                Bienvenido 👋
              </h1>
              <p className="text-slate-400 mt-1 text-sm md:text-base">
                Aquí tienes una visión clara de tu salud financiera.
              </p>
            </div>

            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wide">
                Ahorro estimado este mes
              </p>
              <p className="text-4xl font-bold bg-gradient-to-r from-sky-300 to-fuchsia-400 bg-clip-text text-transparent mt-1">
                {metrics.savings.toLocaleString("es-ES", {
                  style: "currency",
                  currency: "EUR",
                })}
              </p>
            </div>
          </div>

          {/* Derecha: datos rápidos */}
          <div className="w-full md:w-auto md:min-w-[260px] space-y-3">
            {/* Barra del mes */}
            <div>
              <p className="text-slate-400 text-xs mb-1">
                Evolución del ahorro del mes
              </p>
              <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-700 rounded-full ${
                    metrics.savings >= 0
                      ? "bg-gradient-to-r from-emerald-400 to-sky-400"
                      : "bg-gradient-to-r from-rose-500 to-amber-400"
                  }`}
                  style={{
                    width: `${Math.min(
                      Math.abs(metrics.savings) / 10,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Mini stats */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-2xl bg-slate-900/70 p-3 ring-1 ring-slate-700/60 shadow-md shadow-black/30">
                <p className="text-slate-400 text-[11px]">
                  Media ahorro mensual
                </p>
                <p className="mt-1 text-sm font-semibold text-sky-300">
                  {metrics.avgMonthly.toLocaleString("es-ES", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-900/70 p-3 ring-1 ring-slate-700/60 shadow-md shadow-black/30">
                <p className="text-slate-400 text-[11px]">
                  Ahorro anual estimado
                </p>
                <p className="mt-1 text-sm font-semibold text-emerald-300">
                  {metrics.yearlyEstimate.toLocaleString("es-ES", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-900/70 p-3 ring-1 ring-slate-700/60 shadow-md shadow-black/30">
                <p className="text-slate-400 text-[11px]">Metas activas</p>
                <p className="mt-1 text-sm font-semibold text-fuchsia-300">
                  {totalGoals - completedGoals}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-900/70 p-3 ring-1 ring-slate-700/60 shadow-md shadow-black/30">
                <p className="text-slate-400 text-[11px]">
                  Metas completadas
                </p>
                <p className="mt-1 text-sm font-semibold text-emerald-300">
                  {completedGoals}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ESTADÍSTICAS PRINCIPALES */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="grid gap-5 md:grid-cols-4"
      >
        <StatCard
          label="Ingresos este mes"
          value={metrics.totalIncomes}
          highlight="positive"
          helper="Todo el dinero que ha entrado en tu cuenta."
        />

        <StatCard
          label="Subscripciones"
          value={-metrics.totalSubs}
          highlight="negative"
          helper="Servicios activos y sus costes mensuales."
        />

        <StatCard
          label="Gastos extras"
          value={-metrics.totalExpenses}
          highlight="negative"
          helper="Gastos variables como ocio, comida, etc."
        />

        <StatCard
          label="Ahorro estimado del mes"
          value={metrics.savings}
          highlight={metrics.savings >= 0 ? "positive" : "negative"}
          helper={
            metrics.savings >= 0
              ? "Buen trabajo. Vas generando ahorro."
              : "Este mes vas en negativo."
          }
        />
      </motion.section>

      {/* GRAFICA + METAS */}
      <section className="grid gap-7 md:grid-cols-3">
        {/* Gráfica */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="md:col-span-2 rounded-3xl bg-slate-950/70 p-6 ring-1 ring-white/10 backdrop-blur-xl shadow-xl shadow-black/40"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-100">
              Evolución del ahorro (últimos 6 meses)
            </h3>
            <span className="text-xs text-slate-400">Ingresos - Gastos</span>
          </div>

          <div className="mt-6">
            <SimpleBarChart data={metrics.history.slice(-6)} />
          </div>
        </motion.div>

        {/* Metas */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="rounded-3xl bg-slate-950/70 p-6 ring-1 ring-white/10 backdrop-blur-xl shadow-xl shadow-black/40 space-y-4"
        >
          <h3 className="text-base font-semibold text-slate-100">
            Metas en curso
          </h3>

          {upcomingGoals.length === 0 ? (
            <p className="text-xs text-slate-400">
              No tienes metas activas. Puedes crear una desde la sección
              &quot;Metas&quot;.
            </p>
          ) : (
            <ul className="space-y-4">
              {upcomingGoals.map((g, idx) => {
                const progress = g.cost > 0 ? (g.saved / g.cost) * 100 : 0;

                return (
                  <motion.li
                    key={g.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="rounded-2xl bg-slate-900/80 p-4 ring-1 ring-slate-800 shadow-md shadow-black/30 hover:ring-sky-500/40 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-100">
                        {g.name}
                      </span>
                      <span className="text-xs text-slate-400">
                        {progress.toFixed(0)}%
                      </span>
                    </div>

                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 to-fuchsia-400 transition-all duration-700"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>

                    <p className="mt-3 text-[11px] text-slate-400">
                      Ahorrado:{" "}
                      {g.saved.toLocaleString("es-ES", {
                        style: "currency",
                        currency: "EUR",
                      })}{" "}
                      /{" "}
                      {g.cost.toLocaleString("es-ES", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </p>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </motion.div>
      </section>
    </div>
  );
};
