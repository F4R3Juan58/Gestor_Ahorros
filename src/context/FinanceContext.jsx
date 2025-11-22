import React, { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuth } from "./AuthContext";
import { getUserData, saveUserData } from "../services/api";

const STORAGE_KEY = "savings-modern-data-v1";

const defaultReminderSettings = {
  enabled: true,
  cadence: "mensual",
  channel: "email",
  hour: "09:00",
};

export const createDefaultData = () => ({
  incomes: [],
  subscriptions: [],
  expenses: [],
  goals: [],
  reminderSettings: { ...defaultReminderSettings },
});

const defaultData = createDefaultData();

const historyEntry = (action, detail) => ({
  id: crypto.randomUUID(),
  timestamp: new Date().toISOString(),
  action,
  detail,
});

const goalBlueprint = (goal) => {
  const months = Number(goal.months || 6);
  const createdAt = goal.createdAt || new Date().toISOString();
  const deadlineFromMonths = new Date(createdAt);
  deadlineFromMonths.setMonth(deadlineFromMonths.getMonth() + months);
  const resolvedDeadline = goal.deadline || deadlineFromMonths.toISOString();

  const initialHistory =
    goal.history && goal.history.length > 0
      ? goal.history
      : [
          historyEntry(
            "Creación",
            `Meta creada con objetivo de €${goal.cost || 0} en ${months} meses`
          ),
        ];

  return {
    id: crypto.randomUUID(),
    name: goal.name,
    cost: Number(goal.cost) || 0,
    months,
    saved: Number(goal.saved) || 0,
    category: goal.category || "general",
    recurrence: goal.recurrence || "unica",
    reminderCadence: goal.reminderCadence || "mensual",
    reminderChannel: goal.reminderChannel || "email",
    deadline: resolvedDeadline,
    createdAt,
    sharedCode: goal.sharedCode || Math.random().toString(36).slice(2, 8).toUpperCase(),
    collaborators: goal.collaborators || [],
    contributions: goal.contributions || [],
    comments: goal.comments || [],
    history: initialHistory,
    version: goal.version || 1,
    shareUrl:
      goal.shareUrl ||
      `${typeof window !== "undefined" ? window.location.origin : "app"}/meta/${
        goal.sharedCode || Math.random().toString(36).slice(2, 8).toUpperCase()
      }`,
    notes: goal.notes || "",
    status: goal.status || "active",
    completedAt: goal.completedAt || null,
    reminderOptIn:
      goal.reminderOptIn === undefined ? true : Boolean(goal.reminderOptIn),
    autoSchedule:
      goal.autoSchedule ||
      ({ enabled: false, cadence: "mensual", amount: 0, nextRun: resolvedDeadline }),
    isShared: goal.isShared || false,
    lastReminder: goal.lastReminder || null,
  };
};

const nextDeadlineFromRecurrence = (goal) => {
  const current = goal.deadline ? new Date(goal.deadline) : new Date();
  if (goal.recurrence === "mensual") {
    current.setMonth(current.getMonth() + 1);
  } else if (goal.recurrence === "anual") {
    current.setFullYear(current.getFullYear() + 1);
  } else {
    current.setMonth(current.getMonth() + (goal.months || 6));
  }
  return current.toISOString();
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
            goals: [...state.data.goals, goalBlueprint(goal)],
          },
        })),

      updateGoalSaved: (goalId, amount, payload = {}) =>
        get().addGoalContribution(goalId, {
          amount,
          note: payload.note || "Ajuste rápido",
          author: payload.author,
          date: payload.date,
        }),

      addGoalContribution: (goalId, contribution) => {
        let celebration = null;
        set((state) => {
          const goals = state.data.goals.reduce((acc, goal) => {
            if (goal.id !== goalId) return [...acc, goal];
            const amount = Number(contribution.amount || 0);
            if (!amount) return [...acc, goal];

            const updatedSaved = goal.saved + amount;
            const contributions = [
              {
                id: crypto.randomUUID(),
                date: contribution.date || new Date().toISOString(),
                amount,
                note: contribution.note || "",
                author: contribution.author || "Tú",
              },
              ...(goal.contributions || []),
            ];

            const completed = updatedSaved >= goal.cost;
            if (completed && goal.status !== "completed") {
              celebration = { goalId, goalName: goal.name };
            }

            const history = [
              historyEntry(
                "Aporte",
                `${contribution.author || "Tú"} añadió ${amount.toLocaleString("es-ES", {
                  style: "currency",
                  currency: "EUR",
                })}`
              ),
              ...(goal.history || []),
            ];

            const updatedGoal = {
              ...goal,
              saved: updatedSaved,
              contributions,
              status: completed ? "completed" : goal.status,
              completedAt: completed ? new Date().toISOString() : goal.completedAt,
              history,
              version: (goal.version || 1) + 1,
            };

            return [...acc, updatedGoal];
          }, []);

          let extendedGoals = goals;
          if (celebration) {
            const goal = goals.find((g) => g.id === celebration.goalId);
            if (goal && goal.recurrence !== "unica") {
              const nextGoal = goalBlueprint({
                ...goal,
                saved: 0,
                contributions: [],
                status: "active",
                deadline: nextDeadlineFromRecurrence(goal),
                createdAt: new Date().toISOString(),
                notes: `${goal.notes || ""} · Ciclo renovado automáticamente`,
              });
              extendedGoals = [...goals, nextGoal];
            }
          }

          return {
            data: {
              ...state.data,
              goals: extendedGoals,
            },
          };
        });

        return celebration;
      },

      updateGoalReminder: (goalId, reminder) =>
        set((state) => ({
          data: {
            ...state.data,
            goals: state.data.goals.map((goal) =>
              goal.id === goalId
                ? {
                    ...goal,
                    reminderCadence: reminder.cadence || goal.reminderCadence,
                    reminderChannel: reminder.channel || goal.reminderChannel,
                    reminderOptIn:
                      reminder.enabled === undefined
                        ? goal.reminderOptIn
                        : reminder.enabled,
                  }
                : goal
            ),
          },
        })),

      updateReminderSettings: (settings) =>
        set((state) => ({
          data: {
            ...state.data,
            reminderSettings: {
              ...state.data.reminderSettings,
              ...settings,
            },
          },
        })),

      addGoalCollaborator: (goalId, collaborator) =>
        set((state) => ({
          data: {
            ...state.data,
            goals: state.data.goals.map((goal) =>
              goal.id === goalId
                ? {
                    ...goal,
                    collaborators: [
                      ...(goal.collaborators || []),
                      {
                        role: collaborator.role || "editor",
                        joinedAt: new Date().toISOString(),
                        ...collaborator,
                      },
                    ],
                    isShared: true,
                    history: [
                      historyEntry(
                        "Colaboración",
                        `${collaborator.name || "Invitado"} se sumó como ${
                          collaborator.role || "editor"
                        }`
                      ),
                      ...(goal.history || []),
                    ],
                  }
                : goal
            ),
          },
        })),

      updateGoalCollaboratorRole: (goalId, collaboratorId, role) =>
        set((state) => ({
          data: {
            ...state.data,
            goals: state.data.goals.map((goal) =>
              goal.id === goalId
                ? {
                    ...goal,
                    collaborators: (goal.collaborators || []).map((collab) =>
                      collab.id === collaboratorId ? { ...collab, role } : collab
                    ),
                    history: [
                      historyEntry(
                        "Rol actualizado",
                        `Colaborador ${collaboratorId} ahora es ${role}`
                      ),
                      ...(goal.history || []),
                    ],
                  }
                : goal
            ),
          },
        })),

      addGoalComment: (goalId, comment) =>
        set((state) => ({
          data: {
            ...state.data,
            goals: state.data.goals.map((goal) =>
              goal.id === goalId
                ? {
                    ...goal,
                    comments: [
                      {
                        id: crypto.randomUUID(),
                        author: comment.author || "Tú",
                        role: comment.role || "colaborador",
                        text: comment.text,
                        timestamp: comment.timestamp || new Date().toISOString(),
                      },
                      ...(goal.comments || []),
                    ],
                  }
                : goal
            ),
          },
        })),

      updateGoalDetails: (goalId, changes) =>
        set((state) => ({
          data: {
            ...state.data,
            goals: state.data.goals.map((goal) => {
              if (goal.id !== goalId) return goal;

              const diffs = [];
              ["cost", "deadline", "months"].forEach((key) => {
                if (
                  changes[key] !== undefined &&
                  Number(changes[key]) !== Number(goal[key])
                ) {
                  diffs.push(`${key} → ${changes[key]}`);
                }
              });

              const newHistory = diffs.length
                ? [historyEntry("Ajuste", diffs.join(" | ")), ...(goal.history || [])]
                : goal.history || [];

              return {
                ...goal,
                ...changes,
                history: newHistory,
                version:
                  newHistory !== goal.history
                    ? (goal.version || 1) + 1
                    : goal.version,
              };
            }),
          },
        })),

      updateGoalAutomation: (goalId, automation) =>
        set((state) => ({
          data: {
            ...state.data,
            goals: state.data.goals.map((goal) =>
              goal.id === goalId
                ? {
                    ...goal,
                    autoSchedule: {
                      ...goal.autoSchedule,
                      nextRun:
                        automation.nextRun ||
                        goal.autoSchedule?.nextRun ||
                        nextDeadlineFromRecurrence(goal),
                      ...automation,
                    },
                    history: [
                      historyEntry(
                        "Automatización",
                        automation.enabled
                          ? `Aporte automático ${automation.amount || goal.autoSchedule?.amount || 0}€ ${
                              automation.cadence || goal.autoSchedule?.cadence || "mensual"
                            }`
                          : "Automatización pausada"
                      ),
                      ...(goal.history || []),
                    ],
                  }
                : goal
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

      resetData: () => set({ data: createDefaultData() }),
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
    addGoalContribution,
    updateGoalReminder,
    updateReminderSettings,
    addGoalCollaborator,
    updateGoalCollaboratorRole,
    addGoalComment,
    updateGoalDetails,
    updateGoalAutomation,
    deleteIncome,
    deleteExpense,
    deleteSubscription,
    deleteGoal,
    resetData,
  } = useFinanceStore();

  const baseData =
    data && typeof data === "object" ? data : createDefaultData();

  const normalizedGoals = Array.isArray(baseData.goals)
    ? baseData.goals.map((goal) => {
        const createdAt = goal.createdAt || new Date().toISOString();
        const fallbackDeadlineDate = new Date(createdAt);
        fallbackDeadlineDate.setMonth(fallbackDeadlineDate.getMonth() + (goal.months || 6));
        return {
          ...goal,
          category: goal.category || "general",
          recurrence: goal.recurrence || "unica",
          contributions: goal.contributions || [],
          collaborators: goal.collaborators || [],
          comments: goal.comments || [],
          reminderCadence: goal.reminderCadence || "mensual",
          reminderChannel: goal.reminderChannel || "email",
          sharedCode: goal.sharedCode || "SYNC",
          createdAt,
          deadline: goal.deadline || fallbackDeadlineDate.toISOString(),
          history:
            goal.history && goal.history.length
              ? goal.history
              : [
                  historyEntry(
                    "Creación",
                    `Meta creada con objetivo de €${goal.cost || 0}`
                  ),
                ],
          version: goal.version || 1,
          autoSchedule:
            goal.autoSchedule ||
            ({ enabled: false, cadence: "mensual", amount: 0, nextRun: fallbackDeadlineDate.toISOString() }),
          shareUrl:
            goal.shareUrl ||
            `${typeof window !== "undefined" ? window.location.origin : "app"}/meta/${
              goal.sharedCode || "SYNC"
            }`,
        };
      })
    : [];

  const normalizedData = {
    ...createDefaultData(),
    ...baseData,
    goals: normalizedGoals,
    reminderSettings: {
      ...defaultReminderSettings,
      ...baseData.reminderSettings,
    },
  };

  const metrics = computeMetrics(normalizedData);

  return {
    data: normalizedData,
    setData,
    addIncome,
    addSubscription,
    addExpense,
    addGoal,
    updateGoalSaved,
    addGoalContribution,
    updateGoalReminder,
    updateReminderSettings,
    addGoalCollaborator,
    updateGoalCollaboratorRole,
    addGoalComment,
    updateGoalDetails,
    updateGoalAutomation,
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
  const { user } = useAuth();
  const { data, setData, resetData } = useFinanceStore();

  useEffect(() => {
    let mounted = true;
    const hydrate = async () => {
      if (!user) {
        resetData();
        return;
      }

      try {
        const stored = await getUserData(user.token);
        if (mounted) {
          setData(stored || createDefaultData());
        }
      } catch (err) {
        console.error("No se pudo obtener datos remotos", err);
        if (mounted) {
          setData(createDefaultData());
        }
      }
    };

    hydrate();
    return () => {
      mounted = false;
    };
  }, [user, setData, resetData]);

  useEffect(() => {
    if (!user) return;
    saveUserData(user.token, data).catch((err) => {
      console.error("No se pudo guardar en el backend", err);
    });
  }, [user, data]);

  return <>{children}</>;
};
