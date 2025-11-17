import React, { useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { SectionTitle } from "../components/SectionTitle";
import { motion } from "framer-motion";

const categories = ["Comida", "Ocio", "Transporte", "Casa", "Otros"];

export const Expenses = () => {
  const { data, addExpense, metrics } = useFinance();
  const [form, setForm] = useState({
    category: "Comida",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount) return;

    addExpense({
      ...form,
      amount: Number(form.amount),
    });

    setForm((f) => ({ ...f, amount: "", notes: "" }));
  };

  return (
    <div className="space-y-8">
      <SectionTitle
        title="Gastos extras"
        subtitle="Registra todos los gastos variables del día a día."
      />

      {/* RESUMEN */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-to-br from-rose-600/20 via-fuchsia-500/15 to-slate-900/70 
                   p-5 ring-1 ring-fuchsia-400/40 backdrop-blur-2xl shadow-xl shadow-black/40 
                   flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <p className="text-xs text-rose-200/90 font-medium uppercase tracking-wide">
            Gastos totales este mes
          </p>
          <p className="mt-1 text-3xl font-semibold text-rose-100">
            {metrics.totalExpenses.toLocaleString("es-ES", {
              style: "currency",
              currency: "EUR",
            })}
          </p>
          <p className="mt-1 text-xs text-slate-200/80">
            Gastos variables sumados durante el mes actual.
          </p>
        </div>

        <div className="text-xs text-slate-200/80 space-y-1 sm:text-right">
          <p>
            <span className="text-slate-400">Gastos registrados:</span>{" "}
            <span className="font-medium text-fuchsia-200">
              {data.expenses.length}
            </span>
          </p>
          <p>
            <span className="text-slate-400">Impacto en el ahorro:</span>{" "}
            <span className="font-medium text-fuchsia-200">
              -
              {metrics.totalExpenses.toLocaleString("es-ES", {
                style: "currency",
                currency: "EUR",
              })}
            </span>
          </p>
          <p className="text-[11px] text-slate-400">
            Reducir pequeños gastos ayuda a mejorar tu ahorro mensual.
          </p>
        </div>
      </motion.div>

      <div className="grid gap-8 md:grid-cols-[1.15fr,1fr]">
        {/* FORMULARIO */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-5 rounded-4xl bg-slate-950/75 backdrop-blur-2xl p-6 
                     shadow-xl ring-1 ring-white/10 shadow-slate-950/70"
        >
          <h3 className="text-sm font-semibold text-slate-100 tracking-tight">
            Registrar gasto
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            {/* CATEGORÍA */}
            <div className="space-y-1">
              <label className="text-xs text-slate-300">Categoría</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-3xl border border-slate-700/50 bg-slate-900/80 
                           px-3 py-2.5 text-sm text-slate-100 outline-none 
                           focus:ring-2 ring-fuchsia-400/40"
              >
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* CANTIDAD */}
            <div className="space-y-1">
              <label className="text-xs text-slate-300">Cantidad (€)</label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                className="w-full rounded-3xl border border-slate-700/50 bg-slate-900/80 
                           px-3 py-2.5 text-sm text-slate-100 outline-none 
                           focus:ring-2 ring-fuchsia-400/40"
                step="0.01"
                min="0"
                required
              />
            </div>

            {/* FECHA */}
            <div className="space-y-1">
              <label className="text-xs text-slate-300">Fecha</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full rounded-3xl border border-slate-700/50 bg-slate-900/80 
                           px-3 py-2.5 text-sm text-slate-100 outline-none 
                           focus:ring-2 ring-fuchsia-400/40"
                required
              />
            </div>

            {/* NOTAS */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs text-slate-300">Notas</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={2}
                placeholder="Ej: Cena con amigos, gasolina, regalo..."
                className="w-full resize-none rounded-3xl border border-slate-700/50 
                           bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 
                           outline-none focus:ring-2 ring-fuchsia-400/40"
              />
            </div>
          </div>

          {/* BOTÓN */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            type="submit"
            className="inline-flex items-center justify-center rounded-3xl bg-gradient-to-r 
                       from-fuchsia-500 via-rose-500 to-amber-400 px-5 py-2.5 
                       text-sm font-semibold text-slate-950 shadow-lg shadow-rose-700/40 transition"
          >
            Guardar gasto
          </motion.button>
        </motion.form>

        {/* LISTA DE GASTOS */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="space-y-4 rounded-4xl bg-slate-950/75 backdrop-blur-2xl p-6 
                     shadow-xl ring-1 ring-white/10 shadow-slate-950/70"
        >
          <h3 className="text-sm font-semibold text-slate-100 tracking-tight">
            Gastos recientes
          </h3>

          <div className="max-h-80 overflow-y-auto space-y-3 pr-1 custom-scroll text-xs">
            {data.expenses.length === 0 ? (
              <p className="text-slate-400">
                Todavía no has registrado ningún gasto.
              </p>
            ) : (
              data.expenses
                .slice()
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((g, idx) => (
                  <motion.div
                    key={g.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="flex items-center justify-between rounded-3xl 
                               bg-slate-900/80 px-4 py-3 ring-1 ring-slate-800/70 
                               shadow-md shadow-black/30"
                  >
                    <div>
                      <p className="font-medium text-slate-100">{g.category}</p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(g.date).toLocaleDateString("es-ES")}
                        {g.notes && ` · ${g.notes}`}
                      </p>
                    </div>

                    <p className="font-semibold text-rose-300">
                      -
                      {g.amount.toLocaleString("es-ES", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </p>
                  </motion.div>
                ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
