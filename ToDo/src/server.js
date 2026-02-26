// server.js
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

/** =========================
 *  MYSQL CONFIG
 *  ========================= */
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "todolist_db",
  waitForConnections: true,
  connectionLimit: 10,
});

/** =========================
 *  CRUD DE TAREAS
 *  ========================= */

/**
 * GET /api/tareas
 * Lista todas las tareas
 */
app.get("/api/tareas", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, titulo, completada FROM tareas ORDER BY id ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al listar tareas" });
  }
});

/**
 * POST /api/tareas
 * Crear una tarea nueva
 * Body: { "titulo": "Mi tarea" }
 */
app.post("/api/tareas", async (req, res) => {
  try {
    const { titulo } = req.body;

    if (!titulo || !titulo.trim()) {
      return res.status(400).json({ message: "El título es obligatorio" });
    }

    const [result] = await db.query(
      "INSERT INTO tareas (titulo, completada) VALUES (?, 0)",
      [titulo.trim()]
    );

    const [rows] = await db.query(
      "SELECT id, titulo, completada FROM tareas WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al crear tarea" });
  }
});

/**
 * PATCH /api/tareas/:id
 * Editar titulo o completada (o ambos)
 * Body: { "titulo": "Nuevo titulo" } o { "completada": true } o ambos
 */
app.patch("/api/tareas/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { titulo, completada } = req.body;

    // Verificar que la tarea existe
    const [[tarea]] = await db.query(
      "SELECT id FROM tareas WHERE id = ?",
      [id]
    );
    if (!tarea) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    // Armar el UPDATE solo con los campos que llegaron
    const fields = [];
    const values = [];

    if (titulo !== undefined) {
      if (!titulo.trim()) {
        return res.status(400).json({ message: "El título no puede estar vacío" });
      }
      fields.push("titulo = ?");
      values.push(titulo.trim());
    }
    if (completada !== undefined) {
      fields.push("completada = ?");
      values.push(completada ? 1 : 0);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: "No hay campos para actualizar" });
    }

    values.push(id);
    await db.query(
      `UPDATE tareas SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    // Devolver la tarea actualizada
    const [rows] = await db.query(
      "SELECT id, titulo, completada FROM tareas WHERE id = ?",
      [id]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al actualizar tarea" });
  }
});

/**
 * DELETE /api/tareas/:id
 * Eliminar una tarea
 */
app.delete("/api/tareas/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const [result] = await db.query(
      "DELETE FROM tareas WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    res.json({ message: "Tarea eliminada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al eliminar tarea" });
  }
});

/** ======= START ======= */
app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});