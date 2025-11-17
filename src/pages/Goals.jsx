import React, { useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { SectionTitle } from "../components/SectionTitle";
import { motion } from "framer-motion";

export const Goals = () => {
  const { data, addGoal, updateGoalSaved } = useFinance();

  const [form, setForm] = useState({
    name: "",
    cost: "",
    months: 6,
  });

  const [savingForm, setSavingForm] = useState({});

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

  // --- Filtrar metas ---
  const activeGoals = data.goals.filter((g) => g.saved < g.cost);
  const completedGoals = data.goals.filter((g) => g.saved >= g.cost);

  return (
    <div className="space-y-10">
      <SectionTitle
        title="Metas de ahorro"
        subtitle="Organiza tus objetivos y sigue tu progreso."
      />

      <div className="grid gap-10 lg:grid-cols-[1.15fr,1fr]">

        {/* FORMULARIO */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-6 rounded-4xl bg-slate-950/70 backdrop-blur-xl p-6 ring-1 ring-white/10 shadow-xl shadow-black/40"
        >
          <h3 className="text-sm font-semibold text-slate-200 tracking-tight">
            Crear nueva meta
          </h3>

          <div className="grid gap-4 md:grid-cols-2">

            {/* Nombre */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs text-slate-300">Nombre</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Viaje, PC nuevo, coche..."
                className="w-full rounded-3xl border border-slate-700/50 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-100 outline-none focus:ring-2 ring-sky-400/40"
              />
            </div>

            {/* Coste */}
            <div className="space-y-1">
              <label className="text-xs text-slate-300">Coste total (€)</label>
              <input
                type="number"
                name="cost"
                value={form.cost}
                onChange={handleChange}
                className="w-full rounded-3xl border border-slate-700/50 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-100 outline-none focus:ring-2 ring-sky-400/40"
                step="1"
                min="0"
              />
            </div>

            {/* Meses */}
            <div className="space-y-1">
              <label className="text-xs text-slate-300">Plazo (meses)</label>
              <input
                type="number"
                name="months"
                value={form.months}
                onChange={handleChange}
                className="w-full rounded-3xl border border-slate-700/50 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-100 outline-none focus:ring-2 ring-sky-400/40"
                min="1"
                max="120"
              />
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            type="submit"
            className="inline-flex items-center justify-center rounded-3xl bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-fuchsia-700/40 transition"
          >
            Guardar meta
          </motion.button>
        </motion.form>

        {/* LISTA DE METAS */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="space-y-6 rounded-4xl bg-slate-950/70 backdrop-blur-xl p-6 ring-1 ring-white/10 shadow-xl shadow-black/40 text-xs"
        >
          <h3 className="text-sm font-medium text-slate-100">Metas activas</h3>

          {activeGoals.length === 0 ? (
            <p className="text-slate-400">
              No tienes metas activas ahora mismo.
            </p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {activeGoals.map((g, idx) => {
                const monthly = g.months > 0 ? g.cost / g.months : 0;
                const progress = g.cost > 0 ? (g.saved / g.cost) * 100 : 0;
                const remaining = Math.max(g.cost - g.saved, 0);

                return (
                  <motion.div
                    key={g.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="space-y-3 rounded-3xl bg-slate-900/80 p-4 ring-1 ring-slate-800 shadow-md shadow-black/30"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-slate-100 font-medium">{g.name}</p>
                      <p className="text-[11px] text-slate-400">
                        {progress.toFixed(0)}%
                      </p>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 to-fuchsia-400 transition-all duration-700"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[11px] text-slate-400">Coste total</p>
                        <p className="font-medium text-slate-100">
                          {g.cost.toLocaleString("es-ES", {
                            style: "currency",
                            currency: "EUR",
                          })}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] text-slate-400">
                          Ahorro mensual ideal
                        </p>
                        <p className="font-medium text-emerald-300">
                          {monthly.toLocaleString("es-ES", {
                            style: "currency",
                            currency: "EUR",
                          })}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] text-slate-400">Ahorrado</p>
                        <p className="font-medium text-sky-300">
                          {g.saved.toLocaleString("es-ES", {
                            style: "currency",
                            currency: "EUR",
                          })}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] text-slate-400">Restante</p>
                        <p className="font-medium text-amber-300">
                          {remaining.toLocaleString("es-ES", {
                            style: "currency",
                            currency: "EUR",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="number"
                        value={savingForm[g.id] ?? ""}
                        onChange={(e) =>
                          handleSavingChange(g.id, e.target.value)
                        }
                        placeholder="Cantidad"
                        className="w-28 rounded-2xl border border-slate-700/70 bg-slate-950/60 px-3 py-1.5 text-[11px] text-slate-100 outline-none focus:ring-2 ring-sky-400/40"
                        step="0.01"
                        min="0"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddSaving(g.id)}
                        className="flex-shrink-0 rounded-2xl bg-sky-500 px-3 py-1.5 text-[11px] font-semibold text-slate-950 shadow-sm shadow-sky-500/40 transition hover:bg-sky-400"
                      >
                        Añadir ahorro
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* METAS COMPLETADAS */}
          {completedGoals.length > 0 && (
            <div className="pt-6 border-t border-white/10">
              <h3 className="text-sm font-medium text-slate-100">
                Metas completadas
              </h3>

              <div className="space-y-4 mt-3">
                {completedGoals.map((g, idx) => (
                  <motion.div
                    key={g.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="rounded-3xl bg-emerald-900/30 p-4 ring-1 ring-emerald-700/40 shadow-md backdrop-blur-xl"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-emerald-300">{g.name}</p>
                      <span className="text-[11px] text-emerald-400">100%</span>
                    </div>

                    <p className="text-[11px] text-emerald-200 mt-1">
                      Objetivo alcanzado 🎉
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
};
