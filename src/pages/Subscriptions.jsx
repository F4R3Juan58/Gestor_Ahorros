import React, { useMemo, useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { SectionTitle } from "../components/SectionTitle";
import { motion } from "framer-motion";

const formatCurrency = (value) =>
  (value || 0).toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
  });

export const Subscriptions = () => {
  const { data, addSubscription } = useFinance();

  const [form, setForm] = useState({
    name: "",
    cost: "",
    type: "fija",
    frequency: "mensual",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: "",
  });
  const [filterType, setFilterType] = useState("all");

  const filteredSubscriptions = useMemo(() => {
    return data.subscriptions
      .filter((sub) => (filterType === "all" ? true : sub.type === filterType))
      .sort((a, b) => b.cost - a.cost);
  }, [data.subscriptions, filterType]);

  const totalCost = data.subscriptions.reduce(
    (acc, sub) => acc + Number(sub.cost || 0),
    0
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.cost) return;

    addSubscription({
      ...form,
      cost: Number(form.cost),
      endDate: form.type === "temporal" ? form.endDate : "",
    });

    setForm((f) => ({
      ...f,
      name: "",
      cost: "",
      endDate: "",
    }));
  };

  return (
    <div className="space-y-8">
      <SectionTitle
        title="Subscripciones"
        subtitle="Gestiona servicios digitales con visión premium y controla su impacto mensual."
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-card grid gap-6 p-6 lg:grid-cols-2"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Gasto recurrente</p>
          <p className="mt-2 text-3xl font-semibold text-white">
            {formatCurrency(totalCost)} / mes
          </p>
          <p className="mt-2 text-sm text-slate-400">
            {data.subscriptions.length} servicios activos
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Filtrar por tipo</p>
          <div className="mt-3 flex gap-2">
            {["all", "fija", "temporal"].map((option) => (
              <button
                key={option}
                onClick={() => setFilterType(option)}
                className={`rounded-2xl border px-4 py-1 text-xs capitalize ${
                  filterType === option
                    ? "border-white/40 bg-white/10 text-white"
                    : "border-white/10 text-slate-400"
                }`}
              >
                {option === "all" ? "Todas" : option}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-[1.15fr,1fr]">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface-card space-y-6 p-6"
        >
          <h3 className="text-sm font-semibold text-white">Añadir subscripción</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs text-slate-400">Nombre</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Netflix, Spotify, gimnasio..."
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Coste mensual (€)</label>
              <input
                type="number"
                name="cost"
                value={form.cost}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
                step="0.01"
                min="0"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Tipo</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
              >
                <option value="fija">Fija</option>
                <option value="temporal">Temporal</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Fecha inicio</label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
              />
            </div>

            {form.type === "temporal" && (
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Fecha fin</label>
                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
                  required
                />
              </div>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="rounded-2xl border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white"
          >
            Guardar subscripción
          </motion.button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="surface-card space-y-4 p-6 text-sm"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Subscripciones filtradas</h3>
            <span className="text-xs text-slate-400">{filteredSubscriptions.length} registros</span>
          </div>

          {filteredSubscriptions.length === 0 ? (
            <p className="text-slate-400">No hay subscripciones en este filtro.</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1 custom-scroll">
              {filteredSubscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-white">{sub.name}</p>
                    <p className="text-[11px] text-slate-400">
                      {sub.frequency} · {sub.type === "fija" ? "Fija" : `Hasta ${sub.endDate ? new Date(sub.endDate).toLocaleDateString("es-ES") : "sin fecha"}`}
                    </p>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-amber-200">
                    -{formatCurrency(sub.cost)} / mes
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
