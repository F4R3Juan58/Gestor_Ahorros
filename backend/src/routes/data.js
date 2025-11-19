import express from "express";
import pool from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import { createDefaultData } from "../utils/defaultData.js";

const router = express.Router();

router.get("/records", requireAuth, async (req, res) => {
  const recordResult = await pool.query("SELECT payload FROM user_records WHERE user_id = $1", [req.user.id]);
  if (recordResult.rowCount === 0) {
    return res.json({ data: createDefaultData() });
  }
  res.json({ data: recordResult.rows[0].payload });
});

router.put("/records", requireAuth, async (req, res) => {
  const payload = req.body || createDefaultData();
  const upsertQuery = `
    INSERT INTO user_records (user_id, payload, updated_at)
    VALUES ($1, $2, NOW())
    ON CONFLICT (user_id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()
    RETURNING payload, updated_at
  `;

  const result = await pool.query(upsertQuery, [req.user.id, payload]);
  res.json({ data: result.rows[0].payload, updatedAt: result.rows[0].updated_at });
});

export default router;
