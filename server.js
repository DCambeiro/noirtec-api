import express from "express";
import cors from "cors";
import pg from "pg";

const app = express();
app.use(cors());
app.use(express.json());

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.get("/health", (_, res) => res.json({ ok: true }));

// Obtener todos los trabajos
app.get("/jobs", async (_, res) => {
  const r = await pool.query("SELECT * FROM jobs ORDER BY id DESC");
  res.json(r.rows);
});

// Crear trabajo
app.post("/jobs", async (req, res) => {
  const { archivo, cantidad, material, notas } = req.body;
  const r = await pool.query(
    `INSERT INTO jobs (archivo, cantidad, material, notas, completed)
     VALUES ($1, $2, $3, $4, false)
     RETURNING *`,
    [archivo, Number(cantidad), material, notas ?? ""]
  );
  res.json(r.rows[0]);
});

// Marcar como completado
app.patch("/jobs/:id/complete", async (req, res) => {
  const id = Number(req.params.id);
  const r = await pool.query(
    "UPDATE jobs SET completed = true WHERE id = $1 RETURNING *",
    [id]
  );
  res.json(r.rows[0]);
});

// Borrar trabajo
app.delete("/jobs/:id", async (req, res) => {
  const id = Number(req.params.id);
  await pool.query("DELETE FROM jobs WHERE id = $1", [id]);
  res.json({ ok: true });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("API running on", port));