import bcrypt from "bcrypt";
import express from "express";
import pool from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import { createDefaultData } from "../utils/defaultData.js";
import { createId, createSyncCode } from "../utils/syncCodes.js";

const router = express.Router();

const TOKEN_TTL_DAYS = Number(process.env.TOKEN_TTL_DAYS || 30);

const createSession = async (userId) => {
  const token = createId();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + TOKEN_TTL_DAYS);

  await pool.query(
    "INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3) ON CONFLICT (token) DO NOTHING",
    [token, userId, expiresAt.toISOString()]
  );
  return { token, expiresAt };
};

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Faltan datos para registrarte." });
  }

  const existing = await pool.query("SELECT id FROM app_users WHERE LOWER(email) = LOWER($1)", [email]);
  if (existing.rowCount > 0) {
    return res.status(409).json({ error: "Ya existe una cuenta con este email." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const syncCode = createSyncCode();
  const userId = createId();

  const insertUserQuery = `
    INSERT INTO app_users (id, name, email, password_hash, sync_code)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, name, email, sync_code, created_at
  `;

  const userResult = await pool.query(insertUserQuery, [userId, name, email, passwordHash, syncCode]);
  const user = userResult.rows[0];

  await pool.query(
    "INSERT INTO user_records (user_id, payload) VALUES ($1, $2) ON CONFLICT (user_id) DO NOTHING",
    [userId, JSON.stringify(createDefaultData())]
  );

  const session = await createSession(userId);

  res.status(201).json({
    profile: {
      token: session.token,
      id: user.id,
      name: user.name,
      email: user.email,
      syncCode: user.sync_code,
      createdAt: user.created_at,
    },
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};

  const userResult = await pool.query(
    "SELECT id, name, email, password_hash, sync_code FROM app_users WHERE LOWER(email) = LOWER($1)",
    [email]
  );

  if (userResult.rowCount === 0) {
    return res.status(404).json({ error: "Usuario no encontrado." });
  }

  const user = userResult.rows[0];
  const match = await bcrypt.compare(password || "", user.password_hash);
  if (!match) {
    return res.status(401).json({ error: "Contraseña incorrecta." });
  }

  await pool.query("UPDATE app_users SET last_login_at = NOW() WHERE id = $1", [user.id]);
  const session = await createSession(user.id);

  res.json({
    profile: {
      token: session.token,
      id: user.id,
      name: user.name,
      email: user.email,
      syncCode: user.sync_code,
    },
  });
});

router.post("/sync-code", requireAuth, async (req, res) => {
  const newCode = createSyncCode();
  const updateResult = await pool.query(
    "UPDATE app_users SET sync_code = $1 WHERE id = $2 RETURNING id, name, email, sync_code",
    [newCode, req.user.id]
  );

  if (updateResult.rowCount === 0) {
    return res.status(404).json({ error: "Usuario no encontrado." });
  }

  res.json({
    profile: {
      ...updateResult.rows[0],
      token: req.user.token,
    },
  });
});

export default router;
