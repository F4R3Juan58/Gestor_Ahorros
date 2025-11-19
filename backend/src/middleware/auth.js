import pool from "../config/db.js";

export const requireAuth = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.replace("Bearer ", "").trim();

  if (!token) {
    return res.status(401).json({ error: "Token de sesión requerido" });
  }

  const sessionQuery = `
    SELECT s.token, s.expires_at, u.id, u.name, u.email, u.sync_code
    FROM sessions s
    JOIN app_users u ON u.id = s.user_id
    WHERE s.token = $1 AND s.expires_at > NOW()
  `;

  const sessionResult = await pool.query(sessionQuery, [token]);
  if (sessionResult.rowCount === 0) {
    return res.status(401).json({ error: "Sesión inválida o expirada" });
  }

  const row = sessionResult.rows[0];
  req.user = {
    token: row.token,
    id: row.id,
    name: row.name,
    email: row.email,
    syncCode: row.sync_code,
  };

  next();
};
