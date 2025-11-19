const AUTH_STORAGE_KEY = "savings-auth-profile";
const CLOUD_KEY = "savings-cloud-db";

const createId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const createSyncCode = () => Math.random().toString(36).slice(2, 7).toUpperCase();

const hashPassword = (password = "") => {
  const salt = "savings-cloud";
  return btoa(`${salt}:${password}`);
};

const readDB = () => {
  if (typeof window === "undefined") return { users: [], records: {} };
  const raw = window.localStorage.getItem(CLOUD_KEY);
  return raw ? JSON.parse(raw) : { users: [], records: {} };
};

const writeDB = (db) => {
  if (typeof window === "undefined") return db;
  window.localStorage.setItem(CLOUD_KEY, JSON.stringify(db));
  return db;
};

export const registerUser = ({ name, email, password }) => {
  if (!name || !email || !password) {
    return { ok: false, error: "Faltan datos para registrarte." };
  }

  const db = readDB();
  const exists = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return { ok: false, error: "Ya existe una cuenta con este email." };
  }

  const profile = {
    id: createId(),
    name,
    email,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
    syncCode: createSyncCode(),
    lastLoginAt: new Date().toISOString(),
  };

  db.users.push(profile);
  db.records[profile.email] = db.records[profile.email] || null;
  writeDB(db);
  return { ok: true, profile };
};

export const authenticateUser = ({ email, password }) => {
  const db = readDB();
  const user = db.users.find((u) => u.email.toLowerCase() === (email || "").toLowerCase());
  if (!user) return { ok: false, error: "Usuario no encontrado." };

  if (user.passwordHash !== hashPassword(password)) {
    return { ok: false, error: "Contraseña incorrecta." };
  }

  const updatedUser = { ...user, lastLoginAt: new Date().toISOString() };
  writeDB({
    ...db,
    users: db.users.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
  });

  return { ok: true, profile: updatedUser };
};

export const refreshSyncCode = (email) => {
  const db = readDB();
  const user = db.users.find((u) => u.email === email);
  if (!user) return null;

  const updatedUser = { ...user, syncCode: createSyncCode(), refreshedAt: new Date().toISOString() };
  writeDB({
    ...db,
    users: db.users.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
  });
  return updatedUser;
};

export const getUserData = (email) => {
  const db = readDB();
  return db.records[email] || null;
};

export const saveUserData = (email, data) => {
  const db = readDB();
  db.records[email] = data;
  writeDB(db);
};

export const STORAGE_KEY = AUTH_STORAGE_KEY; // re-export for AuthContext local persistence
