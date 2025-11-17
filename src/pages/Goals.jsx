import React, { useMemo, useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { SectionTitle } from "../components/SectionTitle";
import { motion } from "framer-motion";

const formatCurrency = (value) =>
  (value || 0).toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
  });

export const Goals = () => {
  const { data, addGoal, updateGoalSaved, deleteGoal } = useFinance();

  const [form, setForm] = useState({
    name: "",
    cost: "",
    months: 6,
  });

  const [savingForm, setSavingForm] = useState({});

  const activeGoals = data.goals.filter((g) => g.saved < g.cost);
  const completedGoals = data.goals.filter((g) => g.saved >= g.cost);

  const totalToSave = useMemo(
    () => activeGoals.reduce((acc, goal) => acc + Math.max(goal.cost - goal.saved, 0), 0),
    [activeGoals]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.cost || !form.months) return;

    addGoal({
      name: form.name,
      cost: Number(form.cost),
      months: Number(form.months),
    });

    setForm({ name: "", cost: "", months: 6 });
  };

  const handleSavingChange = (goalId, value) => {
    setSavingForm((prev) => ({ ...prev, [goalId]: value }));
  };

  const handleAddSaving = (goalId) => {
    const amount = Number(savingForm[goalId] || 0);
    if (!amount) return;

    updateGoalSaved(goalId, amount);
    setSavingForm((prev) => ({ ...prev, [goalId]: "" }));
  };

  return (
    <div className="space-y-10">
      <SectionTitle
        title="Metas de ahorro"
        subtitle="Organiza tus objetivos con bloques visuales y seguimiento preciso."
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-card grid gap-6 p-6 lg:grid-cols-3"
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
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Capital pendiente</p>
          <p className="mt-2 text-3xl font-semibold text-amber-200">{formatCurrency(totalToSave)}</p>
        </div>
      </motion.div>

      <div className="grid gap-10 lg:grid-cols-[1.1fr,1fr]">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface-card space-y-6 p-6"
        >
          <h3 className="text-sm font-semibold text-white">Crear nueva meta</h3>

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
              <label className="text-xs text-slate-400">Coste total (€)</label>
              <input
                type="number"
                name="cost"
                value={form.cost}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
                step="1"
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
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="rounded-2xl border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white"
          >
            Guardar meta
          </motion.button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="surface-card space-y-6 p-6 text-sm"
        >
          <h3 className="text-sm font-semibold text-white">Metas activas</h3>

          {activeGoals.length === 0 ? (
            <p className="text-slate-400">No tienes metas activas ahora mismo.</p>
          ) : (
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1 custom-scroll">
              {activeGoals.map((goal) => {
                const monthly = goal.months > 0 ? goal.cost / goal.months : 0;
                const progress = goal.cost > 0 ? (goal.saved / goal.cost) * 100 : 0;
                const remaining = Math.max(goal.cost - goal.saved, 0);

                return (
                  <div key={goal.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">{goal.name}</p>
                        <p className="text-[11px] text-slate-400">{goal.months} meses · {formatCurrency(goal.cost)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteGoal(goal.id)}
                        className="text-xs text-slate-400 hover:text-rose-200"
                        aria-label="Eliminar meta"
                      >
                        Eliminar
                      </button>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-200 via-amber-200 to-white"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-[11px] text-slate-300">
                      <div>
                        <p>Ahorrado</p>
                        <p className="text-white">{formatCurrency(goal.saved)}</p>
                      </div>
                      <div>
                        <p>Restante</p>
                        <p className="text-amber-200">{formatCurrency(remaining)}</p>
                      </div>
                      <div>
                        <p>Mensual ideal</p>
                        <p className="text-emerald-200">{formatCurrency(monthly)}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        type="number"
                        value={savingForm[goal.id] ?? ""}
                        onChange={(e) => handleSavingChange(goal.id, e.target.value)}
                        placeholder="Cantidad"
                        className="w-28 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
                        step="0.01"
                        min="0"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddSaving(goal.id)}
                        className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-xs text-white"
                      >
                        Añadir
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {completedGoals.length > 0 && (
            <div className="pt-4 border-t border-white/10">
              <h3 className="text-sm font-semibold text-white">Metas completadas</h3>
              <div className="mt-3 space-y-3">
                {completedGoals.map((goal) => (
                  <div key={goal.id} className="rounded-2xl border border-emerald-300/30 bg-emerald-500/10 p-3 text-xs text-emerald-100">
                    <p className="font-medium text-white">{goal.name}</p>
                    <p className="text-[11px]">Objetivo alcanzado 🎉</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
