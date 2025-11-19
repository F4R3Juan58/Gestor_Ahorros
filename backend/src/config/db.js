import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const pool = new Pool({
  host: process.env.PGHOST || "15.237.178.217",
  port: Number(process.env.PGPORT) || 5432,
  database: process.env.PGDATABASE || "gestor_ahorros",
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "",
  ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : false,
});

pool.on("error", (err) => {
  console.error("Error en la conexión con PostgreSQL", err);
});

export default pool;
