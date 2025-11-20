import React, { useMemo, useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { SectionTitle } from "../components/SectionTitle";
import { motion } from "framer-motion";

const formatCurrency = (value) =>
  (value || 0).toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
  });

const periodFilters = [
  { value: "month", label: "Mes actual" },
  { value: "year", label: "Año" },
  { value: "all", label: "Todo" },
];

export const Incomes = () => {
  const { data, addIncome, metrics } = useFinance();
  const [form, setForm] = useState({
    type: "Sueldo",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
  });
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("month");

  const filteredIncomes = useMemo(() => {
    return data.incomes.filter((income) => {
      const matchesSearch = `${income.type} ${income.notes}`
        .toLowerCase()
        .includes(search.toLowerCase());
      if (!matchesSearch) return false;

      if (period === "all") return true;
      const date = new Date(income.date);
      const now = new Date();
      if (period === "month") {
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }
      if (period === "year") {
        return date.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [data.incomes, search, period]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount) return;

    addIncome({
      ...form,
      amount: Number(form.amount),
    });

    setForm((f) => ({ ...f, amount: "", notes: "" }));
  };

  return (
    <div className="space-y-8">
      <SectionTitle
        title="Ingresos"
        subtitle="Registra sueldos, ayudas y entradas extraordinarias con una vista cuidada."
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-card grid gap-6 p-6 lg:grid-cols-2"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Ingresos del mes</p>
          <p className="mt-2 text-3xl font-semibold text-white">
            {formatCurrency(metrics.totalIncomes)}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Promedio mensual: {formatCurrency(metrics.avgMonthly)} · Ahorro estimado: {formatCurrency(metrics.savings)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Filtros rápidos</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {periodFilters.map((option) => (
              <button
                key={option.value}
                onClick={() => setPeriod(option.value)}
                className={`rounded-2xl border px-4 py-1.5 text-xs ${
                  period === option.value
                    ? "border-white/40 bg-white/10 text-white"
                    : "border-white/10 text-slate-400"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por tipo o nota"
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
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Añadir nuevo ingreso</h3>
            <span className="text-[11px] text-slate-400">Sueldos, ayudas, pagas extra...</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Tipo</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              >
                <option>Sueldo</option>
                <option>Ayuda</option>
                <option>Paga</option>
                <option>Ingreso extra</option>
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
                placeholder="Ej: Sueldo mensual, paga extra, ayuda estatal..."
                className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="rounded-2xl border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white"
          >
            Guardar ingreso
          </motion.button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="surface-card space-y-4 p-6 text-sm"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Ingresos filtrados</h3>
            <span className="text-xs text-slate-400">{filteredIncomes.length} registros</span>
          </div>

          <div className="max-h-80 space-y-3 overflow-y-auto pr-1 custom-scroll">
            {filteredIncomes.length === 0 ? (
              <p className="text-slate-400">No se encontraron ingresos con los filtros aplicados.</p>
            ) : (
              filteredIncomes
                .slice()
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((income) => (
                  <div
                    key={income.id}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-white">{income.type}</p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(income.date).toLocaleDateString("es-ES")}
                        {income.notes ? ` · ${income.notes}` : ""}
                      </p>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-emerald-200">
                      {formatCurrency(income.amount)}
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
