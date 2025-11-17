import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useFinance } from "../context/FinanceContext";
import { StatCard } from "../components/StatCard";
import { SimpleBarChart } from "../components/SimpleBarChart";
import { SectionTitle } from "../components/SectionTitle";

const formatCurrency = (value) =>
  (value || 0).toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

const getHealthLabel = (rate) => {
  if (rate > 45) return "Excelente";
  if (rate > 15) return "Sano";
  if (rate > 0) return "Estable";
  return "En alerta";
};

const expandGoal = (goal) => {
  const progress = goal.cost > 0 ? (goal.saved / goal.cost) * 100 : 0;
  const deadline = new Date(goal.deadline || goal.createdAt || new Date());
  const daysLeft = Math.max(Math.ceil((deadline - Date.now()) / (1000 * 60 * 60 * 24)), 0);
  const remaining = Math.max(goal.cost - goal.saved, 0);
  const monthly = goal.months ? remaining / goal.months : remaining / 3;
  return { ...goal, progress, daysLeft, remaining, monthly };
};

export const Dashboard = () => {
  const { metrics, data } = useFinance();

  const goals = useMemo(() => data.goals.map(expandGoal), [data.goals]);
  const activeGoals = goals.filter((goal) => goal.saved < goal.cost);
  const completedGoals = goals.filter((goal) => goal.saved >= goal.cost);
  const totalGoalSaved = goals.reduce((acc, goal) => acc + Math.min(goal.saved, goal.cost), 0);
  const totalGoalCost = goals.reduce((acc, goal) => acc + goal.cost, 0);
  const nextGoal = activeGoals.sort((a, b) => a.daysLeft - b.daysLeft)[0];
  const recentContributions = useMemo(
    () =>
      data.goals
        .flatMap((goal) =>
          goal.contributions.map((contribution) => ({
            ...contribution,
            goal: goal.name,
            category: goal.category,
          }))
        )
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 6),
    [data.goals]
  );

  const savingsRate = metrics.totalIncomes
    ? (metrics.savings / metrics.totalIncomes) * 100
    : 0;
  const coverage = metrics.totalIncomes
    ? (metrics.totalOut / metrics.totalIncomes) * 100
    : 0;

  const upcomingGoals = [...data.goals]
    .sort((a, b) => a.saved / a.cost - b.saved / b.cost)
    .slice(0, 3);

  const recentActivity = [
    ...data.incomes.map((i) => ({
      id: i.id,
      label: i.type || "Ingreso",
      note: i.notes,
      amount: i.amount,
      date: i.date,
      tone: "positive",
    })),
    ...data.expenses.map((e) => ({
      id: e.id,
      label: e.category,
      note: e.notes,
      amount: -e.amount,
      date: e.date,
      tone: "negative",
    })),
    ...data.subscriptions.map((s) => ({
      id: s.id,
      label: s.name,
      note: s.type === "fija" ? "Subscripción fija" : "Subscripción temporal",
      amount: -s.cost,
      date: s.startDate,
      tone: "neutral",
    })),
  ]
    .filter((item) => !!item.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  const insights = [];
  if (coverage > 70) {
    insights.push({
      title: "Reduce gastos variables",
      detail: "Tus egresos consumen más del 70% de los ingresos. Revisa ocio y compras impulsivas.",
    });
  }
  if (data.subscriptions.length > 5) {
    insights.push({
      title: "Audita subscripciones",
      detail: "Tienes más de 5 servicios activos. Cancela los que no uses a menudo.",
    });
  }
  if (metrics.avgMonthly < 0) {
    insights.push({
      title: "Ajusta tu ritmo de ahorro",
      detail: "Tu media mensual es negativa. Prioriza crear un colchón de emergencia.",
    });
  }

  const globalGoalStats = [
    {
      label: "Total ahorrado en metas",
      value: formatCurrency(totalGoalSaved),
      helper: "Suma colaborativa + tus aportes.",
    },
    {
      label: "Capital necesario",
      value: formatCurrency(Math.max(totalGoalCost - totalGoalSaved, 0)),
      helper: `${activeGoals.length} metas activas`,
    },
    {
      label: "Metas completadas",
      value: completedGoals.length,
      helper: "Se pueden archivar o duplicar.",
    },
    {
      label: "Recordatorios activos",
      value: activeGoals.length,
      helper: "Se envían según la cadencia seleccionada.",
    },
  ];

  const statCards = [
    {
      label: "Ingresos mes",
      value: metrics.totalIncomes,
      highlight: "positive",
      helper: "Suma total registrada durante el mes en curso.",
    },
    {
      label: "Egresos del mes",
      value: -metrics.totalOut,
      highlight: "negative",
      helper: "Subscripciones activas + gastos variables.",
    },
    {
      label: "Ahorro anual estimado",
      value: metrics.yearlyEstimate,
      highlight: metrics.yearlyEstimate > 0 ? "positive" : "negative",
      helper: "Proyección manteniendo tu ritmo actual.",
    },
    {
      label: "Metas activas",
      value: activeGoals.length,
      highlight: activeGoals.length > 0 ? "neutral" : "negative",
      helper: `Objetivos con recordatorios automáticos (${completedGoals.length} completados).`,
    },
  ];

  return (
    <div className="space-y-10">
      <SectionTitle
        title="Panel principal"
        subtitle="Supervisa tus finanzas con una mirada elegante y estratégica."
      />

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="surface-card grid gap-8 p-6 lg:grid-cols-[1.3fr,0.9fr]"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Salud financiera</p>
            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm text-white">
              {getHealthLabel(savingsRate)}
            </span>
          </div>
          <p className="text-4xl font-semibold text-white">
            {formatCurrency(metrics.savings)}
          </p>
          <p className="text-sm text-slate-300">
            Balance estimado del mes tras ingresos, subscripciones y gastos variables.
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Cobertura gastos</p>
              <div className="mt-2 flex items-center justify-between text-sm text-white">
                <span>{coverage.toFixed(0)}%</span>
                <span className="text-slate-400">de tus ingresos</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-200 to-white"
                  style={{ width: `${Math.min(coverage, 100)}%` }}
                />
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Tasa de ahorro</p>
              <div className="mt-2 flex items-center justify-between text-sm text-white">
                <span>{savingsRate.toFixed(0)}%</span>
                <span className="text-slate-400">del ingreso</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-200 to-white"
                  style={{ width: `${Math.min(Math.max(savingsRate + 20, 5), 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[26px] border border-white/5 bg-[#080d18]/70 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Evolución mensual</h3>
            <span className="text-[11px] uppercase tracking-[0.3em] text-slate-400">12 meses</span>
          </div>
          <div className="mt-6">
            <SimpleBarChart data={metrics.history.slice(-12)} />
          </div>
        </div>
      </motion.section>

      <div className="grid gap-6 md:grid-cols-3">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="surface-card grid gap-4 p-6 md:grid-cols-4"
      >
        {globalGoalStats.map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{item.label}</p>
            <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
            <p className="text-[11px] text-slate-400">{item.helper}</p>
          </div>
        ))}
      </motion.section>

      <div className="grid gap-8 lg:grid-cols-[1.3fr,0.9fr]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="surface-card space-y-4 p-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Actividad reciente</h3>
            <span className="text-xs text-slate-400">Últimos movimientos</span>
          </div>

          {recentActivity.length === 0 ? (
            <p className="text-sm text-slate-400">
              Registra ingresos, subscripciones o gastos para ver el historial aquí.
            </p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                >
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-[11px] text-slate-400">
                      {new Date(item.date).toLocaleDateString("es-ES")}
                      {item.note ? ` · ${item.note}` : ""}
                    </p>
                  </div>
                  <span
                    className={
                      item.amount >= 0
                        ? "text-emerald-200"
                        : item.tone === "negative"
                        ? "text-rose-200"
                        : "text-amber-200"
                    }
                  >
                    {item.amount >= 0 ? "+" : ""}
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="surface-card space-y-5 p-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Metas destacadas</h3>
            <span className="text-xs text-slate-400">Top 3</span>
          </div>

          {upcomingGoals.length === 0 ? (
            <p className="text-sm text-slate-400">
              Aún no tienes objetivos activos. Crea una meta para ver su progreso.
            </p>
          ) : (
            <div className="space-y-4">
              {upcomingGoals.map((goal) => {
                const progress = goal.cost > 0 ? (goal.saved / goal.cost) * 100 : 0;
                const monthly = goal.months ? goal.cost / goal.months : 0;
                return (
                  <div key={goal.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{goal.name}</p>
                      <span className="text-xs text-slate-300">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-200 via-amber-200 to-white"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-300">
                      <span>Mensual ideal: {formatCurrency(monthly)}</span>
                      <span>Restante: {formatCurrency(Math.max(goal.cost - goal.saved, 0))}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="surface-card space-y-4 p-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Aportes recientes a metas</h3>
            <span className="text-xs text-slate-400">Colaborativos + personales</span>
          </div>
          {recentContributions.length === 0 ? (
            <p className="text-sm text-slate-400">Registra un aporte desde la sección de metas.</p>
          ) : (
            <div className="space-y-3">
              {recentContributions.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-white">{entry.goal}</p>
                    <p className="text-[11px] text-slate-400">
                      {new Date(entry.date).toLocaleDateString("es-ES")} · {entry.category}
                      {entry.note ? ` · ${entry.note}` : ""}
                    </p>
                  </div>
                  <span className="text-emerald-200">+{formatCurrency(entry.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="surface-card space-y-5 p-6"
        >
          <h3 className="text-sm font-semibold text-white">Objetivos automáticos</h3>
          {nextGoal ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Próxima meta</p>
              <p className="mt-1 text-lg font-semibold text-white">{nextGoal.name}</p>
              <p className="text-[11px] text-slate-400">
                {nextGoal.daysLeft} días restantes · necesitas ahorrar {formatCurrency(
                  nextGoal.remaining
                )}
              </p>
              <p className="mt-3 text-sm text-emerald-200">
                Para cumplir esta meta en {nextGoal.months} meses necesitas ahorrar {formatCurrency(
                  nextGoal.monthly
                )}
                /mes
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Crea una meta para activar la planificación automática.</p>
          )}

          <div className="space-y-3 text-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Recordatorios programados</p>
            {activeGoals.slice(0, 3).map((goal) => (
              <div key={goal.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center justify-between text-xs text-white">
                  <span>{goal.name}</span>
                  <span className="text-slate-400">{goal.reminderCadence || "mensual"}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Próximo aporte sugerido: {formatCurrency(goal.monthly)} · Canal {goal.reminderChannel}
                </p>
              </div>
            ))}
            {activeGoals.length === 0 && (
              <p className="text-xs text-slate-400">Sin metas activas.</p>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-card space-y-4 p-6"
      >
        <h3 className="text-sm font-semibold text-white">Metas compartidas</h3>
        {goals.filter((goal) => goal.collaborators?.length).length === 0 ? (
          <p className="text-sm text-slate-400">Comparte una meta desde la sección correspondiente para coordinar aportes familiares.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {goals
              .filter((goal) => goal.collaborators?.length)
              .map((goal) => (
                <div key={goal.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                  <p className="font-medium text-white">{goal.name}</p>
                  <p className="text-[11px] text-slate-400">
                    Código: {goal.sharedCode} · {goal.collaborators.length} participantes
                  </p>
                  <p className="mt-2 text-xs text-slate-300">
                    {goal.collaborators.map((c) => c.name).join(", ")}
                  </p>
                </div>
              ))}
          </div>
        )}
      </motion.div>

      {insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="surface-card space-y-4 p-6"
        >
          <h3 className="text-sm font-semibold text-white">Recomendaciones inteligentes</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {insights.map((tip, idx) => (
              <div key={`${tip.title}-${idx}`} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white">
                <p className="font-medium">{tip.title}</p>
                <p className="mt-2 text-slate-300">{tip.detail}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
