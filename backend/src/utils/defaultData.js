export const defaultReminderSettings = {
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
