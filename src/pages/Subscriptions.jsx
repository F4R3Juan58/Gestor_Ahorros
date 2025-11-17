import React, { useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { SectionTitle } from "../components/SectionTitle";
import { motion } from "framer-motion";

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

  const fixedSubs = data.subscriptions.filter((s) => s.type === "fija");
  const tempSubs = data.subscriptions.filter((s) => s.type === "temporal");

  const totalFixed = fixedSubs.reduce((acc, s) => acc + Number(s.cost || 0), 0);
  const totalTemp = tempSubs.reduce((acc, s) => acc + Number(s.cost || 0), 0);

  return (
    <div className="space-y-8">
      <SectionTitle
        title="Subscripciones"
        subtitle="Gestiona tus servicios fijos (Netflix, gimnasio...) y temporales."
      />

      {/* RESUMEN */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-to-br from-indigo-500/20 via-sky-500/10 to-slate-900/60 
                   p-6 ring-1 ring-indigo-400/30 backdrop-blur-xl shadow-xl shadow-black/40
                   grid grid-cols-2 gap-6 sm:grid-cols-4 text-xs"
      >
        <div>
          <p className="text-slate-300 uppercase tracking-tight">Fijas</p>
          <p className="mt-1 text-xl font-semibold text-emerald-300">
            {totalFixed.toLocaleString("es-ES", {
              style: "currency",
              currency: "EUR",
            })}
          </p>
        </div>

        <div>
          <p className="text-slate-300 uppercase tracking-tight">Temporales</p>
          <p className="mt-1 text-xl font-semibold text-amber-300">
            {totalTemp.toLocaleString("es-ES", {
              style: "currency",
              currency: "EUR",
            })}
          </p>
        </div>

        <div>
          <p className="text-slate-300 uppercase tracking-tight">Activas</p>
          <p className="mt-1 text-xl font-semibold text-sky-300">
            {data.subscriptions.length}
          </p>
        </div>

        <div>
          <p className="text-slate-300 uppercase tracking-tight">
            Total mensual
          </p>
          <p className="mt-1 text-xl font-semibold text-fuchsia-300">
            {(totalFixed + totalTemp).toLocaleString("es-ES", {
              style: "currency",
              currency: "EUR",
            })}
          </p>
        </div>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-[1.15fr,1fr]">

        {/* FORMULARIO */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-6 rounded-4xl bg-slate-950/70 backdrop-blur-xl p-6 
                     shadow-xl ring-1 ring-white/10 shadow-black/40"
        >
          <h3 className="text-sm font-semibold text-slate-200 tracking-tight">
            Añadir subscripción
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
                placeholder="Netflix, Spotify, Amazon Prime..."
                className="w-full rounded-3xl border border-slate-700/50 bg-slate-900/80 
                           px-4 py-2.5 text-sm text-slate-100 outline-none 
                           focus:ring-2 ring-indigo-400/40"
              />
            </div>

            {/* Coste */}
            <div className="space-y-1">
              <label className="text-xs text-slate-300">Coste mensual (€)</label>
              <input
                type="number"
                name="cost"
                value={form.cost}
                onChange={handleChange}
                className="w-full rounded-3xl border border-slate-700/50 bg-slate-900/80 
                           px-4 py-2.5 text-sm text-slate-100 outline-none 
                           focus:ring-2 ring-indigo-400/40"
                step="0.01"
                min="0"
              />
            </div>

            {/* Tipo */}
            <div className="space-y-1">
              <label className="text-xs text-slate-300">Tipo</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full rounded-3xl border border-slate-700/50 bg-slate-900/80 
                           px-4 py-2.5 text-sm text-slate-100 outline-none 
                           focus:ring-2 ring-indigo-400/40"
              >
                <option value="fija">Fija</option>
                <option value="temporal">Temporal</option>
              </select>
            </div>

            {/* Fecha inicio */}
            <div className="space-y-1">
              <label className="text-xs text-slate-300">Fecha inicio</label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="w-full rounded-3xl border border-slate-700/50 bg-slate-900/80 
                           px-4 py-2.5 text-sm text-slate-100 outline-none 
                           focus:ring-2 ring-indigo-400/40"
              />
            </div>

            {/* Fecha fin */}
            {form.type === "temporal" && (
              <div className="space-y-1">
                <label className="text-xs text-slate-300">Fecha fin</label>
                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  className="w-full rounded-3xl border border-slate-700/50 bg-slate-900/80 
                             px-4 py-2.5 text-sm text-slate-100 outline-none 
                             focus:ring-2 ring-indigo-400/40"
                  required
                />
              </div>
            )}
          </div>

          {/* BOTÓN */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            type="submit"
            className="inline-flex items-center justify-center rounded-3xl bg-gradient-to-r 
                       from-sky-500 via-indigo-500 to-fuchsia-500 px-5 py-2.5 
                       text-sm font-semibold text-slate-950 shadow-lg shadow-fuchsia-700/40 transition"
          >
            Guardar subscripción
          </motion.button>
        </motion.form>

        {/* LISTADOS */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="space-y-6 rounded-4xl bg-slate-950/70 backdrop-blur-xl 
                     p-6 ring-1 ring-white/10 shadow-xl shadow-black/40"
        >
          <div className="grid gap-6 md:grid-cols-2">
            {/* FIJAS */}
            <div>
              <h4 className="mb-2 text-xs font-semibold text-slate-200">Fijas</h4>
              <div className="space-y-3">
                {fixedSubs.length === 0 ? (
                  <p className="text-slate-500">Sin subscripciones fijas.</p>
                ) : (
                  fixedSubs.map((s, idx) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="rounded-3xl bg-slate-900/85 p-3 ring-1 ring-slate-800 
                                 shadow-md shadow-black/30"
                    >
                      <p className="font-medium text-slate-100">{s.name}</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {s.cost.toLocaleString("es-ES", {
                          style: "currency",
                          currency: "EUR",
                        })}{" "}
                        · {s.frequency}
                      </p>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* TEMPORALES */}
            <div>
              <h4 className="mb-2 text-xs font-semibold text-slate-200">Temporales</h4>
              <div className="space-y-3">
                {tempSubs.length === 0 ? (
                  <p className="text-slate-500">Sin subscripciones temporales.</p>
                ) : (
                  tempSubs.map((s, idx) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="rounded-3xl bg-slate-900/85 p-3 ring-1 ring-slate-800 
                                 shadow-md shadow-black/30"
                    >
                      <p className="font-medium text-slate-100">{s.name}</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {s.cost.toLocaleString("es-ES", {
                          style: "currency",
                          currency: "EUR",
                        })}{" "}
                        · hasta{" "}
                        {s.endDate
                          ? new Date(s.endDate).toLocaleDateString("es-ES")
                          : "sin fecha"}
                      </p>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
};
