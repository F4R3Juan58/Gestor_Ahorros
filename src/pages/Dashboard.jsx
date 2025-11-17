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
  const createdAt = new Date(goal.createdAt || new Date());
  const deadline = new Date(goal.deadline || createdAt);
  const totalMs = Math.max(deadline - createdAt, 1);
  const elapsed = Math.max(Date.now() - createdAt.getTime(), 0);
  const expectedPct = Math.min((elapsed / totalMs) * 100, 100);
  const delta = progress - expectedPct;
  const daysLeft = Math.max(Math.ceil((deadline - Date.now()) / (1000 * 60 * 60 * 24)), 0);
  const remaining = Math.max(goal.cost - goal.saved, 0);
  const monthly = goal.months ? remaining / goal.months : remaining / 3;
  const tone =
    progress >= 90
      ? "closing"
      : delta < -10
      ? "delayed"
      : delta > 10
      ? "ahead"
      : "onTrack";
  return { ...goal, progress, daysLeft, remaining, monthly, expectedPct, delta, tone };
};

export const Dashboard = () => {
  const { metrics, data } = useFinance();

  const goals = useMemo(() => data.goals.map(expandGoal), [data.goals]);
  const activeGoals = goals.filter((goal) => goal.saved < goal.cost);
  const completedGoals = goals.filter((goal) => goal.saved >= goal.cost);
  const totalGoalSaved = goals.reduce((acc, goal) => acc + Math.min(goal.saved, goal.cost), 0);
  const totalGoalCost = goals.reduce((acc, goal) => acc + goal.cost, 0);
  const globalProgress = totalGoalCost > 0 ? (totalGoalSaved / totalGoalCost) * 100 : 0;
  const nextGoal = activeGoals.sort((a, b) => a.daysLeft - b.daysLeft)[0];
  const recurringGoals = goals.filter((goal) => goal.recurrence !== "unica");
  const autoSchedules = goals.filter((goal) => goal.autoSchedule?.enabled);
  const recentContributions = useMemo(
    () =>
      data.goals
        .flatMap((goal) =>
          goal.contributions.map((contribution) => ({
            ...contribution,
            goal: goal.name,
            category: goal.category,
            author: contribution.author,
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

  const history = metrics.history.slice(-4);
  const lastPoint = history[history.length - 1];
  const prevPoint = history[history.length - 2];
  const trendDelta = lastPoint && prevPoint ? lastPoint.value - prevPoint.value : 0;
  const trendLabel = trendDelta > 0 ? "Tendencia al alza" : trendDelta < 0 ? "Tendencia a la baja" : "Tendencia estable";

  const upcomingGoals = [...data.goals]
    .sort((a, b) => a.saved / a.cost - b.saved / b.cost)
    .slice(0, 3);

  const proactiveAlerts = useMemo(() => {
    const alerts = [];
    goals.forEach((goal) => {
      if (goal.status === "completed" && goal.recurrence !== "unica") {
        alerts.push({
          title: `Renueva ${goal.name}`,
          detail: "Marca el nuevo ciclo o deja que el sistema lo genere automáticamente.",
          tone: "renew",
        });
      }
      if (goal.status !== "completed" && goal.daysLeft <= 30 && goal.delta < -5) {
        alerts.push({
          title: `${goal.name} necesita refuerzo`,
          detail: `Quedan ${goal.daysLeft} días y tu progreso va ${Math.abs(goal.delta).toFixed(0)}% por detrás.`,
          tone: "warning",
        });
      }
      if (goal.status !== "completed" && goal.progress >= 95) {
        alerts.push({
          title: `${goal.name} casi lista`,
          detail: "Activa la celebración y planifica la siguiente meta vinculada.",
          tone: "success",
        });
      }
    });
    return alerts.slice(0, 4);
  }, [goals]);

  const recurrenceAdvisors = recurringGoals.map((goal) => ({
    id: goal.id,
    label: `${goal.name} (${goal.recurrence})`,
    helper:
      goal.status === "completed"
        ? "Se generará una nueva meta en cuanto confirmes la renovación."
        : `Renovará el ${new Date(goal.deadline).toLocaleDateString("es-ES")}`,
  }));

  const milestoneBadges = [25, 50, 75, 100]
    .filter((threshold) => globalProgress >= threshold)
    .map((threshold) => ({
      label: `${threshold}% del plan global`,
      tone: threshold === 100 ? "ultimate" : threshold >= 75 ? "vip" : "progress",
    }));

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

  const mobileTips = [
    "Los formularios detectan el teclado virtual y amplían la zona táctil.",
    "Puedes plegar paneles para ver gráficos en pantalla completa.",
    "Los botones críticos se ubican en la parte inferior para fácil alcance.",
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

        <div className="space-y-4">
          <div className="rounded-[26px] border border-white/5 bg-[#080d18]/80 p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Briefing personalizado</h3>
              <span className="text-[11px] uppercase tracking-[0.3em] text-slate-400">en vivo</span>
            </div>

            <div className="mt-4 grid gap-4 text-sm text-white md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Objetivo global</p>
                <p className="mt-1 text-2xl font-semibold">{formatCurrency(totalGoalSaved)}</p>
                <p className="text-[11px] text-slate-400">de {formatCurrency(totalGoalCost || 0)}</p>
                <div className="mt-3 h-2 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-200 via-emerald-200 to-white"
                    style={{ width: `${Math.min(globalProgress, 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] text-slate-400">{globalProgress.toFixed(0)}% completado</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-3 py-2">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Metas activas</p>
                    <p className="text-lg font-semibold text-white">{activeGoals.length}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Completadas</p>
                    <p className="text-lg font-semibold text-emerald-200">{completedGoals.length}</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/5 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Tendencia</p>
                  <p className="text-sm font-semibold text-white">{trendLabel}</p>
                  {lastPoint && (
                    <p className="text-[11px] text-slate-400">
                      Último mes: {formatCurrency(lastPoint.value)} · Variación {trendDelta >= 0 ? "+" : ""}
                      {formatCurrency(trendDelta)}
                    </p>
                  )}
                </div>
                {nextGoal && (
                  <div className="rounded-2xl border border-white/5 bg-white/5 px-3 py-2">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Próxima fecha límite</p>
                    <p className="text-sm font-semibold text-white">{nextGoal.name}</p>
                    <p className="text-[11px] text-slate-400">
                      {nextGoal.daysLeft} días restantes · falta {formatCurrency(nextGoal.remaining)}
                    </p>
                  </div>
                )}
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
        className="grid gap-6 xl:grid-cols-3"
      >
        <div className="surface-card space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Centro de alertas</h3>
            <span className="text-xs text-slate-400">Proactivas</span>
          </div>
          {proactiveAlerts.length === 0 ? (
            <p className="text-sm text-slate-400">No hay alertas urgentes. Sigue así ✨</p>
          ) : (
            <div className="space-y-3">
              {proactiveAlerts.map((alert) => (
                <div
                  key={alert.title}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                >
                  <p className="font-medium">{alert.title}</p>
                  <p className="text-[11px] text-slate-400">{alert.detail}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="surface-card space-y-4 p-6">
          <h3 className="text-sm font-semibold text-white">Ingresos vs gastos</h3>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm">
            <div className="flex items-center justify-between text-xs text-white">
              <span>Ingresos</span>
              <span>{formatCurrency(metrics.totalIncomes)}</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-200 to-white"
                style={{
                  width: `${Math.min(
                    metrics.totalIncomes ? (metrics.savings / metrics.totalIncomes) * 100 + 20 : 0,
                    100
                  )}%`,
                }}
              />
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-white">
              <span>Gastos + subscripciones</span>
              <span>{formatCurrency(metrics.totalOut)}</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-200 to-amber-200"
                style={{ width: `${Math.min(coverage, 100)}%` }}
              />
            </div>
            <p className="mt-3 text-[11px] text-slate-400">
              Este mes tus gastos representan {coverage.toFixed(0)}% del ingreso. Has reservado {formatCurrency(
                metrics.savings
              )} para ahorro estratégico.
            </p>
          </div>
        </div>

        <div className="surface-card space-y-4 p-6">
          <h3 className="text-sm font-semibold text-white">Gamificación y experiencia móvil</h3>
          {milestoneBadges.length === 0 ? (
            <p className="text-sm text-slate-400">Consigue al menos el 25% del objetivo global para desbloquear insignias.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {milestoneBadges.map((badge) => (
                <span
                  key={badge.label}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    badge.tone === "ultimate"
                      ? "border-yellow-200/60 text-yellow-100"
                      : badge.tone === "vip"
                      ? "border-violet-200/60 text-violet-100"
                      : "border-emerald-200/60 text-emerald-100"
                  }`}
                >
                  {badge.label}
                </span>
              ))}
            </div>
          )}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300">
            <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">UX móvil</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              {mobileTips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
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
                      {entry.author ? ` · ${entry.author}` : ""}
                      {entry.note ? ` · ${entry.note}` : ""}
                    </p>
                  </div>
                  <span className="text-emerald-200">+{formatCurrency(entry.amount)}</span>
                </div>
              ))}
            </div>
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

          <div className="space-y-3 text-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Renovaciones recurrentes</p>
            {recurrenceAdvisors.length === 0 ? (
              <p className="text-xs text-slate-400">No tienes metas recurrentes todavía.</p>
            ) : (
              recurrenceAdvisors.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="font-medium text-white">{item.label}</p>
                  <p className="text-[11px] text-slate-400">{item.helper}</p>
                </div>
              ))
            )}
          </div>

          <div className="space-y-3 text-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Automatizaciones</p>
            {autoSchedules.length === 0 ? (
              <p className="text-xs text-slate-400">Programa un aporte periódico desde la vista de metas.</p>
            ) : (
              autoSchedules.slice(0, 3).map((goal) => (
                <div key={goal.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="font-medium text-white">{goal.name}</p>
                  <p className="text-[11px] text-slate-400">
                    {goal.autoSchedule.cadence} · {formatCurrency(goal.autoSchedule.amount)} · próxima ejecución {goal.autoSchedule.nextRun
                      ? new Date(goal.autoSchedule.nextRun).toLocaleDateString("es-ES")
                      : "por definir"}
                  </p>
                </div>
              ))
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
    </div>
  );
};
