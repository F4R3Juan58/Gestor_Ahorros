import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionTitle } from "../components/SectionTitle";
import { useFinance } from "../context/FinanceContext";

const formatCurrency = (value) =>
  (value || 0).toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

const goalCategories = [
  { value: "hogar", label: "Hogar" },
  { value: "viajes", label: "Viajes" },
  { value: "emergencias", label: "Emergencias" },
  { value: "compras", label: "Compras" },
  { value: "inversiones", label: "Inversiones" },
  { value: "educacion", label: "Educación" },
  { value: "otros", label: "Otros" },
];

const goalTemplates = [
  {
    id: "viaje-anual",
    name: "Viaje anual",
    cost: 1800,
    months: 12,
    category: "viajes",
    recurrence: "anual",
    reminderCadence: "mensual",
  },
  {
    id: "fondo-emergencia",
    name: "Fondo de emergencia",
    cost: 3000,
    months: 10,
    category: "emergencias",
    recurrence: "mensual",
    reminderCadence: "semanal",
  },
  {
    id: "renovar-equipo",
    name: "Renovar equipo",
    cost: 1200,
    months: 6,
    category: "compras",
    recurrence: "anual",
    reminderCadence: "mensual",
  },
];

const createId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const extendDeadline = (goal, extraMonths = 1) => {
  const base = new Date(goal.deadline || goal.createdAt || new Date());
  base.setMonth(base.getMonth() + extraMonths);
  return base.toISOString();
};

const computeGoalInsights = (goal) => {
  const progress = goal.cost > 0 ? (goal.saved / goal.cost) * 100 : 0;
  const start = new Date(goal.createdAt || new Date());
  const deadline = new Date(goal.deadline || start);
  const totalMs = Math.max(deadline - start, 1);
  const elapsedMs = Math.max(Date.now() - start.getTime(), 0);
  const expectedPct = Math.min((elapsedMs / totalMs) * 100, 100);
  const delta = progress - expectedPct;
  const remainingAmount = Math.max(goal.cost - goal.saved, 0);
  const daysLeft = Math.max(Math.ceil((deadline - Date.now()) / (1000 * 60 * 60 * 24)), 0);
  const autoMonthly = goal.months > 0 ? remainingAmount / goal.months : remainingAmount / 3;
  const autoWeekly = daysLeft > 0 ? remainingAmount / Math.max(daysLeft / 7, 1) : remainingAmount;

  let tone = "onTrack";
  let badge = "Vas en camino";
  if (progress >= 90) {
    tone = "closing";
    badge = "¡Estás cerca!";
  } else if (delta < -10) {
    tone = "delayed";
    badge = "Vas atrasado";
  } else if (delta > 12) {
    tone = "ahead";
    badge = "Adelantado";
  }

  return {
    progress,
    expectedPct,
    delta,
    tone,
    badge,
    remainingAmount,
    daysLeft,
    autoMonthly,
    autoWeekly,
  };
};

const toneStyles = {
  onTrack: {
    badge: "border-emerald-300/40 bg-emerald-500/10 text-emerald-100",
    bar: "from-emerald-200 via-white to-white",
  },
  closing: {
    badge: "border-amber-300/40 bg-amber-500/10 text-amber-100",
    bar: "from-amber-200 via-white to-white",
  },
  delayed: {
    badge: "border-rose-300/40 bg-rose-500/10 text-rose-100",
    bar: "from-rose-200 via-white to-white",
  },
  ahead: {
    badge: "border-sky-300/40 bg-sky-500/10 text-sky-100",
    bar: "from-sky-200 via-white to-white",
  },
};

export const Goals = () => {
  const {
    data,
    addGoal,
    addGoalContribution,
    deleteGoal,
    updateGoalReminder,
    addGoalCollaborator,
    addGoalComment,
    updateGoalAutomation,
    updateGoalCollaboratorRole,
    updateGoalDetails,
  } = useFinance();

  const [form, setForm] = useState({
    name: "",
    cost: "",
    months: 6,
    category: "viajes",
    deadline: "",
    recurrence: "unica",
    reminderCadence: "mensual",
    reminderChannel: "email",
    notes: "",
  });
  const [savingForm, setSavingForm] = useState({});
  const [collabForm, setCollabForm] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [filterCategory, setFilterCategory] = useState("todas");
  const [celebration, setCelebration] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [projectionGoalId, setProjectionGoalId] = useState("");
  const [projectionMonthly, setProjectionMonthly] = useState(150);
  const [projectionBoost, setProjectionBoost] = useState(10);

  useEffect(() => {
    if (!projectionGoalId && data.goals.length > 0) {
      setProjectionGoalId(data.goals[0].id);
      const base = data.goals[0].months
        ? data.goals[0].cost / Math.max(data.goals[0].months, 1)
        : data.goals[0].cost / 6;
      setProjectionMonthly(Math.max(Math.round(base), 50));
    }
  }, [data.goals, projectionGoalId]);

  const goalsWithInsights = useMemo(
    () =>
      data.goals.map((goal) => ({
        ...goal,
        insights: computeGoalInsights(goal),
      })),
    [data.goals]
  );

  const projectionGoal = goalsWithInsights.find((goal) => goal.id === projectionGoalId);
  const projectionRemaining = projectionGoal?.insights.remainingAmount || 0;
  const sanitizedMonthly = Math.max(projectionMonthly, 10);
  const monthsNeeded = projectionRemaining > 0 ? Math.ceil(projectionRemaining / sanitizedMonthly) : 0;
  const boostedMonthly = sanitizedMonthly * (1 + projectionBoost / 100);
  const boostedMonths = projectionRemaining > 0 ? Math.ceil(projectionRemaining / boostedMonthly) : 0;
  const projectedFinish = (() => {
    if (!projectionGoal) return null;
    const date = new Date();
    date.setMonth(date.getMonth() + monthsNeeded);
    return date;
  })();

  const filteredGoals = goalsWithInsights.filter((goal) =>
    filterCategory === "todas" ? true : goal.category === filterCategory
  );

  const activeGoals = filteredGoals.filter((goal) => goal.saved < goal.cost);
  const completedGoals = filteredGoals.filter((goal) => goal.saved >= goal.cost);

  const totalSaved = activeGoals.reduce((acc, goal) => acc + goal.saved, 0);
  const totalNeeded = activeGoals.reduce((acc, goal) => acc + Math.max(goal.cost - goal.saved, 0), 0);

  const contributionsHistory = useMemo(() => {
    return data.goals
      .flatMap((goal) =>
        goal.contributions.map((contribution) => ({
          ...contribution,
          goalName: goal.name,
          category: goal.category,
        }))
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [data.goals]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name || !form.cost) return;

    addGoal({
      name: form.name,
      cost: Number(form.cost),
      months: Number(form.months || 6),
      category: form.category,
      deadline: form.deadline || undefined,
      recurrence: form.recurrence,
      reminderCadence: form.reminderCadence,
      reminderChannel: form.reminderChannel,
      notes: form.notes,
    });

    setForm({
      name: "",
      cost: "",
      months: 6,
      category: form.category,
      deadline: "",
      recurrence: form.recurrence,
      reminderCadence: form.reminderCadence,
      reminderChannel: form.reminderChannel,
      notes: "",
    });
    setSelectedTemplate(null);
  };

  const handleApplyTemplate = (template) => {
    setForm((prev) => ({
      ...prev,
      name: template.name,
      cost: template.cost,
      months: template.months,
      category: template.category,
      recurrence: template.recurrence,
      reminderCadence: template.reminderCadence,
    }));
    setSelectedTemplate(template.id);
  };

  const handleAddContribution = (goalId) => {
    const entry = savingForm[goalId];
    if (!entry?.amount) return;

    const result = addGoalContribution(goalId, {
      amount: Number(entry.amount),
      note: entry.note,
    });

    if (result) {
      setCelebration({ goal: result.goalName, timestamp: Date.now() });
      setTimeout(() => setCelebration(null), 4000);
    }

    setSavingForm((prev) => ({
      ...prev,
      [goalId]: { amount: "", note: "" },
    }));
  };

  const handleAddCollaborator = (goalId) => {
    const payload = collabForm[goalId];
    if (!payload?.name) return;

    addGoalCollaborator(goalId, {
      id: createId(),
      ...payload,
    });

    setCollabForm((prev) => ({
      ...prev,
      [goalId]: { name: "", email: "" },
    }));
  };

  const handleCollaboratorRole = (goalId, collaboratorId, role) => {
    updateGoalCollaboratorRole(goalId, collaboratorId, role);
  };

  const handleAddComment = (goalId) => {
    const draft = commentDrafts[goalId];
    if (!draft) return;
    addGoalComment(goalId, { text: draft });
    setCommentDrafts((prev) => ({ ...prev, [goalId]: "" }));
  };

  const handleAutomationSave = (goalId, overrides = {}) => {
    updateGoalAutomation(goalId, overrides);
  };

  const handleGoalAdjustment = (goalId, changes) => {
    updateGoalDetails(goalId, changes);
  };

  const handleExportGoal = (goal) => {
    const lines = [
      `Meta: ${goal.name}`,
      `Objetivo: ${goal.cost}€`,
      `Ahorrado: ${goal.saved}€`,
      `Colaboradores: ${goal.collaborators.length}`,
      `Recordatorios: ${goal.reminderCadence} · ${goal.reminderChannel}`,
      `Historial: ${goal.history.length} eventos`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${goal.name}-reporte.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShareGoal = async (goal) => {
    const sharePayload = {
      title: `Meta compartida: ${goal.name}`,
      text: `Llevamos ${formatCurrency(goal.saved)} de ${formatCurrency(goal.cost)}. Súmate al enlace seguro.`,
      url: goal.shareUrl,
    };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(sharePayload);
        return;
      } catch (error) {
        // usuario canceló
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(goal.shareUrl);
      if (typeof window !== "undefined") {
        window.alert("Enlace copiado para compartir");
      }
    }
  };

  const celebrationParticles = Array.from({ length: 14 });

  return (
    <div className="space-y-10">
      <SectionTitle
        title="Metas inteligentes"
        subtitle="Controla tu progreso con recordatorios automáticos, aportes colaborativos y renovaciones recurrentes."
      />

      <AnimatePresence>
        {celebration && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative overflow-hidden rounded-[28px] border border-emerald-300/30 bg-emerald-500/10 p-5 text-emerald-50"
          >
            <p className="text-sm font-semibold">Meta completada 🎉</p>
            <p className="text-xs text-emerald-100/70">
              {celebration.goal} está lista. Puedes archivarla o dejar que el ciclo recurrente genere la siguiente.
            </p>
            <div className="pointer-events-none absolute inset-0">
              {celebrationParticles.map((_, idx) => (
                <span
                  key={idx}
                  className="absolute h-2 w-2 rounded-full bg-white/70"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animation: `float ${2 + Math.random() * 2}s linear infinite`,
                    animationDelay: `${idx * 0.1}s`,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-card grid gap-6 p-6 lg:grid-cols-4"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Metas activas</p>
          <p className="mt-2 text-3xl font-semibold text-white">{activeGoals.length}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Completadas</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-200">{completedGoals.length}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Capital ahorrado</p>
          <p className="mt-2 text-3xl font-semibold text-white">{formatCurrency(totalSaved)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Capital pendiente</p>
          <p className="mt-2 text-3xl font-semibold text-amber-200">{formatCurrency(totalNeeded)}</p>
        </div>
      </motion.div>

      <div className="grid gap-10 lg:grid-cols-[1.1fr,1fr]">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface-card space-y-6 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Nueva meta</p>
              <h3 className="text-sm font-semibold text-white">Planifica un objetivo recurrente o puntual</h3>
            </div>
            <select
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="todas">Todas las categorías</option>
              {goalCategories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-white">
            {goalTemplates.map((template) => (
              <button
                type="button"
                key={template.id}
                onClick={() => handleApplyTemplate(template)}
                className={`rounded-2xl border px-3 py-1 ${
                  selectedTemplate === template.id
                    ? "border-emerald-300 bg-emerald-500/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                {template.name}
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs text-slate-400">Nombre</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Viaje, fondo de emergencia, coche..."
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Coste objetivo (€)</label>
              <input
                type="number"
                name="cost"
                value={form.cost}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
                min="0"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Plazo (meses)</label>
              <input
                type="number"
                name="months"
                value={form.months}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
                min="1"
                max="120"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Categoría</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
              >
                {goalCategories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Fecha límite (opcional)</label>
              <input
                type="date"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Recurrencia</label>
              <select
                name="recurrence"
                value={form.recurrence}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
              >
                <option value="unica">Única</option>
                <option value="mensual">Mensual</option>
                <option value="anual">Anual</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs text-slate-400">Notas</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
                rows={2}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-xs text-slate-400">Recordatorio</label>
              <select
                name="reminderCadence"
                value={form.reminderCadence}
                onChange={handleChange}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
              >
                <option value="semanal">Semanal</option>
                <option value="mensual">Mensual</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400">Canal</label>
              <select
                name="reminderChannel"
                value={form.reminderChannel}
                onChange={handleChange}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
              >
                <option value="email">Email</option>
                <option value="push">Push (PWA)</option>
              </select>
            </div>
            <div className="flex items-end">
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="w-full rounded-2xl border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white"
              >
                Guardar meta
              </motion.button>
            </div>
          </div>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="surface-card space-y-6 p-6 text-sm"
        >
          <h3 className="text-sm font-semibold text-white">Recordatorios automáticos</h3>
          <p className="text-xs text-slate-400">
            Programa avisos semanales o mensuales. Las metas colaborativas envían copia a todos los miembros.
          </p>
          <div className="space-y-3">
            {activeGoals.slice(0, 4).map((goal) => (
              <div key={goal.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-white">{goal.name}</p>
                  <span className="text-[11px] text-slate-400">{goal.reminderCadence}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Canal: {goal.reminderChannel} · Próximo aporte sugerido {formatCurrency(goal.insights.autoWeekly)}
                </p>
                <div className="mt-2 flex gap-2 text-[11px]">
                  <button
                    onClick={() =>
                      updateGoalReminder(goal.id, {
                        cadence: goal.reminderCadence === "mensual" ? "semanal" : "mensual",
                      })
                    }
                    className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-white"
                  >
                    Cambiar ritmo
                  </button>
                  <button
                    onClick={() =>
                      updateGoalReminder(goal.id, {
                        channel: goal.reminderChannel === "email" ? "push" : "email",
                      })
                    }
                    className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-white"
                  >
                    Canal: {goal.reminderChannel}
                  </button>
                </div>
              </div>
            ))}
            {activeGoals.length === 0 && (
              <p className="text-slate-400">Crea metas para activar los recordatorios inteligentes.</p>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-card space-y-4 p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-white">Simulador automático</h3>
          <p className="text-xs text-slate-400">Proyecta cuánto tardas si ajustas tu aporte mensual</p>
        </div>
        {goalsWithInsights.length === 0 ? (
          <p className="text-sm text-slate-400">Crea una meta para activar el simulador.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4 text-sm">
              <div>
                <label className="text-xs text-slate-400">Meta a simular</label>
                <select
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
                  value={projectionGoalId}
                  onChange={(event) => setProjectionGoalId(event.target.value)}
                >
                  {goalsWithInsights.map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400">Aporte mensual simulado</label>
                <input
                  type="range"
                  min="25"
                  max="1000"
                  value={projectionMonthly}
                  onChange={(event) => setProjectionMonthly(Number(event.target.value))}
                  className="mt-2 w-full"
                />
                <p className="text-xs text-white">{formatCurrency(projectionMonthly)} / mes</p>
              </div>
              <div>
                <label className="text-xs text-slate-400">Y si aportas +{projectionBoost}%</label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={projectionBoost}
                  onChange={(event) => setProjectionBoost(Number(event.target.value))}
                  className="mt-2 w-full"
                />
                <p className="text-xs text-white">{projectionBoost}% extra ({formatCurrency(boostedMonthly)} / mes)</p>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white">
              {projectionGoal ? (
                <>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Resultado</p>
                  <p className="mt-2 text-lg font-semibold">{projectionGoal.name}</p>
                  <p className="text-[11px] text-slate-300">
                    Restan {formatCurrency(projectionRemaining)} · ritmo actual sugerido {formatCurrency(
                      projectionGoal.insights.autoMonthly
                    )}
                  </p>
                  <div className="mt-4 grid gap-4 text-xs">
                    <div>
                      <p className="text-slate-400">Con tu aporte simulado</p>
                      <p className="text-white">{monthsNeeded || 0} meses · fin estimado {projectedFinish?.toLocaleDateString("es-ES")}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Con +{projectionBoost}%</p>
                      <p className="text-emerald-200">{boostedMonths || 0} meses · ahorras {monthsNeeded - boostedMonths} meses</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-400">Selecciona una meta para simular.</p>
              )}
            </div>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-card space-y-6 p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-white">Panel de metas</h3>
          <div className="flex gap-2 text-[11px]">
            <span className="chip-muted">{activeGoals.length} activas</span>
            <span className="chip-muted">{completedGoals.length} completadas</span>
          </div>
        </div>

        {filteredGoals.length === 0 ? (
          <p className="text-sm text-slate-400">No hay metas para la categoría seleccionada.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredGoals.map((goal) => {
              const tone = toneStyles[goal.insights.tone];
              return (
                <div key={goal.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-white">{goal.name}</p>
                      <p className="text-[11px] text-slate-400">
                        {goal.months} meses · {formatCurrency(goal.cost)} · {goal.category}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`rounded-full border px-3 py-1 text-[11px] ${tone.badge}`}>
                        {goal.insights.badge}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {goal.collaborators.length > 0 ? "Meta compartida" : "Meta individual"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${tone.bar}`}
                      style={{ width: `${Math.min(goal.insights.progress, 100)}%` }}
                    />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-[11px] text-slate-300">
                    <div>
                      <p>Ahorrado</p>
                      <p className="text-white">{formatCurrency(goal.saved)}</p>
                    </div>
                    <div>
                      <p>Restante</p>
                      <p className="text-amber-200">{formatCurrency(goal.insights.remainingAmount)}</p>
                    </div>
                    <div>
                      <p>Automático mensual</p>
                      <p className="text-emerald-200">{formatCurrency(goal.insights.autoMonthly)}</p>
                    </div>
                    <div>
                      <p>Días restantes</p>
                      <p className="text-white">{goal.insights.daysLeft}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Cantidad"
                      className="w-28 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
                      value={savingForm[goal.id]?.amount || ""}
                      onChange={(e) =>
                        setSavingForm((prev) => ({
                          ...prev,
                          [goal.id]: { ...prev[goal.id], amount: e.target.value },
                        }))
                      }
                    />
                    <input
                      type="text"
                      placeholder="Nota"
                      className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
                      value={savingForm[goal.id]?.note || ""}
                      onChange={(e) =>
                        setSavingForm((prev) => ({
                          ...prev,
                          [goal.id]: { ...prev[goal.id], note: e.target.value },
                        }))
                      }
                    />
                    <button
                      type="button"
                      onClick={() => handleAddContribution(goal.id)}
                      className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-xs text-white"
                    >
                      Añadir
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                    <input
                      type="text"
                      placeholder="Nombre colaborador"
                      className="w-36 rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-white"
                      value={collabForm[goal.id]?.name || ""}
                      onChange={(e) =>
                        setCollabForm((prev) => ({
                          ...prev,
                          [goal.id]: { ...prev[goal.id], name: e.target.value },
                        }))
                      }
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-white"
                      value={collabForm[goal.id]?.email || ""}
                      onChange={(e) =>
                        setCollabForm((prev) => ({
                          ...prev,
                          [goal.id]: { ...prev[goal.id], email: e.target.value },
                        }))
                      }
                    />
                    <button
                      type="button"
                      onClick={() => handleAddCollaborator(goal.id)}
                      className="rounded-2xl border border-white/15 bg-white/5 px-3 py-1"
                    >
                      Compartir
                    </button>
                  </div>

                  {goal.collaborators.length > 0 && (
                    <div className="mt-3 space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-[11px] text-white">
                      {goal.collaborators.map((collaborator) => (
                        <div key={collaborator.id} className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-medium">{collaborator.name}</p>
                            <p className="text-[10px] text-slate-400">{collaborator.email}</p>
                          </div>
                          <select
                            value={collaborator.role || "editor"}
                            onChange={(event) =>
                              handleCollaboratorRole(goal.id, collaborator.id, event.target.value)
                            }
                            className="rounded-2xl border border-white/10 bg-white/5 px-2 py-1"
                          >
                            <option value="viewer">Solo ver</option>
                            <option value="editor">Puede aportar</option>
                            <option value="admin">Administrador</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 grid gap-3 text-[11px] text-slate-400 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <p className="text-[11px] uppercase tracking-[0.3em]">Automatización</p>
                      <p className="text-white">{goal.autoSchedule?.enabled ? "Activa" : "Pausada"}</p>
                      <p className="text-[10px] text-slate-400">
                        {goal.autoSchedule?.cadence || "mensual"} · {formatCurrency(goal.autoSchedule?.amount || goal.insights.autoMonthly)}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleAutomationSave(goal.id, {
                              enabled: !goal.autoSchedule?.enabled,
                              amount: goal.autoSchedule?.amount || goal.insights.autoMonthly,
                              cadence: goal.autoSchedule?.cadence || "mensual",
                            })
                          }
                          className="rounded-2xl border border-white/15 bg-white/5 px-3 py-1 text-white"
                        >
                          {goal.autoSchedule?.enabled ? "Pausar" : "Activar"}
                        </button>
                        <input
                          type="number"
                          min="10"
                          defaultValue={Math.round(goal.autoSchedule?.amount || goal.insights.autoMonthly)}
                          className="w-24 rounded-2xl border border-white/10 bg-white/5 px-2 py-1 text-white"
                          onBlur={(event) =>
                            handleAutomationSave(goal.id, { amount: Number(event.target.value) || goal.insights.autoMonthly })
                          }
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <p className="text-[11px] uppercase tracking-[0.3em]">Historial y versión</p>
                      <p className="text-xs text-white">v{goal.version}</p>
                      <ul className="mt-2 space-y-1 text-[10px] text-slate-300">
                        {(goal.history || []).slice(0, 3).map((entry) => (
                          <li key={entry.id}>
                            {new Date(entry.timestamp).toLocaleDateString("es-ES")}: {entry.action} — {entry.detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-400">
                    <button
                      type="button"
                      onClick={() => handleShareGoal(goal)}
                      className="rounded-2xl border border-white/15 bg-white/5 px-3 py-1"
                    >
                      Compartir vista
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportGoal(goal)}
                      className="rounded-2xl border border-white/15 bg-white/5 px-3 py-1"
                    >
                      Exportar resumen
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleGoalAdjustment(goal.id, {
                          months: (goal.months || 0) + 1,
                          deadline: extendDeadline(goal, 1),
                        })
                      }
                      className="rounded-2xl border border-white/15 bg-white/5 px-3 py-1"
                    >
                      +1 mes
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGoalAdjustment(goal.id, { cost: goal.cost + 100 })}
                      className="rounded-2xl border border-white/15 bg-white/5 px-3 py-1"
                    >
                      +100€ objetivo
                    </button>
                  </div>

                  <div className="mt-4 space-y-2 text-[11px] text-slate-400">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Chat interno</p>
                    <div className="space-y-1">
                      {(goal.comments || []).slice(0, 3).map((comment) => (
                        <div key={comment.id} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white">
                          <p className="text-xs font-semibold">{comment.author}</p>
                          <p className="text-[10px] text-slate-300">{comment.text}</p>
                        </div>
                      ))}
                      {(goal.comments || []).length === 0 && <p>No hay comentarios aún.</p>}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Escribe una nota"
                        className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                        value={commentDrafts[goal.id] || ""}
                        onChange={(event) =>
                          setCommentDrafts((prev) => ({ ...prev, [goal.id]: event.target.value }))
                        }
                      />
                      <button
                        type="button"
                        onClick={() => handleAddComment(goal.id)}
                        className="rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-white"
                      >
                        Enviar
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                    <span className="chip-muted">{goal.recurrence} · código {goal.sharedCode}</span>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="rounded-2xl border border-white/15 bg-white/5 px-3 py-1 text-rose-200"
                    >
                      Archivar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-card space-y-4 p-6"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Historial de aportes</h3>
          <button
            onClick={() => {
              const rows = [["Fecha", "Meta", "Categoría", "Aporte", "Nota"]];
              contributionsHistory.forEach((entry) =>
                rows.push([
                  new Date(entry.date).toLocaleDateString("es-ES"),
                  entry.goalName,
                  entry.category,
                  entry.amount,
                  entry.note || "",
                ])
              );
              const csv = rows.map((row) => row.join(",")).join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = "historial-aportes.csv";
              link.click();
            }}
            className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-xs text-white"
          >
            Exportar CSV
          </button>
        </div>
        {contributionsHistory.length === 0 ? (
          <p className="text-sm text-slate-400">Añade aportes para construir el historial detallado.</p>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full text-left text-xs text-slate-300">
              <thead className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                <tr>
                  <th className="pb-2 pr-4">Fecha</th>
                  <th className="pb-2 pr-4">Meta</th>
                  <th className="pb-2 pr-4">Categoría</th>
                  <th className="pb-2 pr-4">Aporte</th>
                  <th className="pb-2">Nota</th>
                </tr>
              </thead>
              <tbody>
                {contributionsHistory.slice(0, 10).map((entry) => (
                  <tr key={entry.id} className="border-t border-white/5">
                    <td className="py-2 pr-4">{new Date(entry.date).toLocaleDateString("es-ES")}</td>
                    <td className="py-2 pr-4 text-white">{entry.goalName}</td>
                    <td className="py-2 pr-4">{entry.category}</td>
                    <td className="py-2 pr-4 text-emerald-200">{formatCurrency(entry.amount)}</td>
                    <td className="py-2">{entry.note || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};
