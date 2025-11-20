import React, { useMemo, useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { SectionTitle } from "../components/SectionTitle";
import { motion } from "framer-motion";

const categories = ["Comida", "Ocio", "Transporte", "Casa", "Otros"];

const formatCurrency = (value) =>
  (value || 0).toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
  });

export const Expenses = () => {
  const { data, addExpense, metrics } = useFinance();
  const [form, setForm] = useState({
    category: "Comida",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
  });
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredExpenses = useMemo(() => {
    return data.expenses.filter((expense) => {
      const matchesSearch = `${expense.category} ${expense.notes}`
        .toLowerCase()
        .includes(search.toLowerCase());
      if (!matchesSearch) return false;
      if (categoryFilter === "all") return true;
      return expense.category === categoryFilter;
    });
  }, [data.expenses, search, categoryFilter]);

  const categoryTotals = data.expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount || 0);
    return acc;
  }, {});
  const topCategory = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([name, total]) => ({ name, total }))[0];

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
        title="Gastos variables"
        subtitle="Controla con precisión cada salida y localiza patrones de consumo."
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-card grid gap-6 p-6 lg:grid-cols-2"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Gasto del mes</p>
          <p className="mt-2 text-3xl font-semibold text-white">
            {formatCurrency(metrics.totalExpenses)}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Impacto directo en tu ahorro: -{formatCurrency(metrics.totalExpenses)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Categorías</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`rounded-2xl border px-3 py-1 text-xs ${
                categoryFilter === "all"
                  ? "border-white/40 bg-white/10 text-white"
                  : "border-white/10 text-slate-400"
              }`}
            >
              Todas
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`rounded-2xl border px-3 py-1 text-xs ${
                  categoryFilter === category
                    ? "border-white/40 bg-white/10 text-white"
                    : "border-white/10 text-slate-400"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          {topCategory && (
            <p className="mt-3 text-xs text-slate-400">
              Categoría dominante: <span className="text-white">{topCategory.name}</span> con {formatCurrency(topCategory.total)}
            </p>
          )}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar gastos"
            className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400"
          />
        </div>
      </motion.div>

      <div className="grid gap-8 md:grid-cols-[1.1fr,1fr]">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface-card space-y-5 p-6"
        >
          <h3 className="text-sm font-semibold text-white">Registrar gasto</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Categoría</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              >
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Cantidad (€)</label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Fecha</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                required
              />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs text-slate-400">Notas</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={2}
                placeholder="Ej: Cena con amigos, gasolina, regalo..."
                className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="rounded-2xl border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white"
          >
            Guardar gasto
          </motion.button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="surface-card space-y-4 p-6 text-sm"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Listado filtrado</h3>
            <span className="text-xs text-slate-400">{filteredExpenses.length} registros</span>
          </div>

          <div className="max-h-80 space-y-3 overflow-y-auto pr-1 custom-scroll">
            {filteredExpenses.length === 0 ? (
              <p className="text-slate-400">Sin gastos con los filtros aplicados.</p>
            ) : (
              filteredExpenses
                .slice()
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((expense) => (
                  <div
                    key={expense.id}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-white">{expense.category}</p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(expense.date).toLocaleDateString("es-ES")}
                        {expense.notes ? ` · ${expense.notes}` : ""}
                      </p>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-rose-200">
                      -{formatCurrency(expense.amount)}
                    </p>
                  </div>
                ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
