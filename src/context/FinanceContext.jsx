import React from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const STORAGE_KEY = "savings-modern-data-v1";

const defaultData = {
  incomes: [],
  subscriptions: [],
  expenses: [],
  goals: [],
};

// --- Cálculo de métricas (igual que tu useMemo, pero como función pura) ---
const computeMetrics = (data) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const filterByMonthYear = (items, dateKey = "date") =>
    items.filter((item) => {
      const d = new Date(item[dateKey]);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

  const monthIncomes = filterByMonthYear(data.incomes);
  const monthExpenses = filterByMonthYear(data.expenses);

  const monthSubs = data.subscriptions.filter((sub) => {
    if (sub.type === "fija") return true;
    if (!sub.endDate) return true;
    const end = new Date(sub.endDate);
    return end >= now;
  });

  const totalIncomes = monthIncomes.reduce(
    (acc, i) => acc + Number(i.amount || 0),
    0
  );
  const totalSubs = monthSubs.reduce(
    (acc, s) => acc + Number(s.cost || 0),
    0
  );
  const totalExpenses = monthExpenses.reduce(
    (acc, e) => acc + Number(e.amount || 0),
    0
  );

  const totalOut = totalSubs + totalExpenses;
  const savings = totalIncomes - totalOut;

  // Historial mensual
  const monthlyMap = new Map();

  const addToMonth = (dateStr, delta) => {
    const d = new Date(dateStr);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    const prev = monthlyMap.get(key) || 0;
    monthlyMap.set(key, prev + delta);
  };

  data.incomes.forEach((i) => addToMonth(i.date, Number(i.amount || 0)));
  data.expenses.forEach((e) =>
    addToMonth(e.date, -Number(e.amount || 0))
  );
  data.subscriptions.forEach((s) => {
    const baseDate = s.startDate || new Date().toISOString();
    addToMonth(baseDate, -Number(s.cost || 0));
  });

  const history = Array.from(monthlyMap.entries())
    .map(([key, value]) => {
      const [y, m] = key.split("-");
      return { key, label: `${m}/${y}`, value };
    })
    .sort((a, b) => (a.key > b.key ? 1 : -1));

  const avgMonthly =
    history.length > 0
      ? history.reduce((acc, h) => acc + h.value, 0) / history.length
      : 0;

  return {
    totalIncomes,
    totalSubs,
    totalExpenses,
    totalOut,
    savings,
    history,
    avgMonthly,
    yearlyEstimate: avgMonthly * 12,
  };
};

// --- Store con Zustand + persist ---
export const useFinanceStore = create(
  persist(
    (set, get) => ({
      data: defaultData,

      // Para compatibilidad (por si algo usa setData directamente)
      setData: (updater) =>
        set((state) => ({
          data:
            typeof updater === "function"
              ? updater(state.data)
              : updater,
        })),

      addIncome: (income) =>
        set((state) => ({
          data: {
            ...state.data,
            incomes: [
              ...state.data.incomes,
              { id: crypto.randomUUID(), ...income },
            ],
          },
        })),

      addSubscription: (sub) =>
        set((state) => ({
          data: {
            ...state.data,
            subscriptions: [
              ...state.data.subscriptions,
              { id: crypto.randomUUID(), ...sub },
            ],
          },
        })),

      addExpense: (expense) =>
        set((state) => ({
          data: {
            ...state.data,
            expenses: [
              ...state.data.expenses,
              { id: crypto.randomUUID(), ...expense },
            ],
          },
        })),

      addGoal: (goal) =>
        set((state) => ({
          data: {
            ...state.data,
            goals: [
              ...state.data.goals,
              { id: crypto.randomUUID(), saved: 0, ...goal },
            ],
          },
        })),

      updateGoalSaved: (goalId, amount) =>
        set((state) => ({
          data: {
            ...state.data,
            goals: state.data.goals.map((g) =>
              g.id === goalId ? { ...g, saved: g.saved + amount } : g
            ),
          },
        })),

      // --- Extra GOD TIER: helpers de borrado y reset ---

      deleteIncome: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            incomes: state.data.incomes.filter((i) => i.id !== id),
          },
        })),

      deleteExpense: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            expenses: state.data.expenses.filter((e) => e.id !== id),
          },
        })),

      deleteSubscription: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            subscriptions: state.data.subscriptions.filter(
              (s) => s.id !== id
            ),
          },
        })),

      deleteGoal: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            goals: state.data.goals.filter((g) => g.id !== id),
          },
        })),

      resetData: () => set({ data: defaultData }),
    }),
    {
      name: STORAGE_KEY,
      // si quieres en el futuro versionar el storage, aquí se puede añadir "version"
    }
  )
);

// --- Hook de alto nivel compatible con tu código actual ---
export const useFinance = () => {
  const {
    data,
    setData,
    addIncome,
    addSubscription,
    addExpense,
    addGoal,
    updateGoalSaved,
    deleteIncome,
    deleteExpense,
    deleteSubscription,
    deleteGoal,
    resetData,
  } = useFinanceStore();

  const metrics = computeMetrics(data);

  return {
    data,
    setData,
    addIncome,
    addSubscription,
    addExpense,
    addGoal,
    updateGoalSaved,
    deleteIncome,
    deleteExpense,
    deleteSubscription,
    deleteGoal,
    resetData,
    metrics,
  };
};

// --- Para mantener compatible tu <FinanceProvider> actual ---
export const FinanceProvider = ({ children }) => {
  // Ya no necesitamos Context, Zustand funciona sin provider.
  return <>{children}</>;
};
