const { validationResult } = require("express-validator");
const db = require("../db");

// Helper para validar
function validar(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error("Validación fallida");
    err.status = 400;
    err.details = errors.array();
    throw err;
  }
}

// GET /api/tareas — trae todas las tareas
exports.listar = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      "SELECT id, titulo, completada FROM tareas ORDER BY id ASC"
    );
    res.json({ data: rows, error: null });
  } catch (e) {
    next(e);
  }
};

// POST /api/tareas — crea una tarea nueva
exports.crear = async (req, res, next) => {
  try {
    validar(req);
    const { titulo } = req.body;

    const [result] = await db.query(
      "INSERT INTO tareas (titulo, completada) VALUES (?, 0)",
      [titulo.trim()]
    );

    res.status(201).json({
      data: { id: result.insertId, titulo: titulo.trim(), completada: 0 },
      error: null,
    });
  } catch (e) {
    if (e.details) return res.status(400).json({ data: null, error: { message: e.message, details: e.details } });
    next(e);
  }
};

// PATCH /api/tareas/:id — edita titulo o completada
exports.actualizar = async (req, res, next) => {
  try {
    validar(req);
    const { id } = req.params;
    const { titulo, completada } = req.body;

    // Verificar que existe
    const [found] = await db.query("SELECT id FROM tareas WHERE id = ?", [id]);
    if (found.length === 0)
      return res.status(404).json({ data: null, error: { message: "Tarea no encontrada" } });

    // Armar update dinámico (solo los campos que llegaron)
    const fields = [];
    const values = [];

    if (titulo !== undefined) {
      fields.push("titulo = ?");
      values.push(titulo.trim());
    }
    if (completada !== undefined) {
      fields.push("completada = ?");
      values.push(completada ? 1 : 0);
    }

    if (fields.length === 0)
      return res.status(400).json({ data: null, error: { message: "No hay campos para actualizar" } });

    values.push(id);
    await db.query(`UPDATE tareas SET ${fields.join(", ")} WHERE id = ?`, values);

    res.json({ data: { id: Number(id), titulo, completada }, error: null });
  } catch (e) {
    if (e.details) return res.status(400).json({ data: null, error: { message: e.message, details: e.details } });
    next(e);
  }
};

// DELETE /api/tareas/:id — elimina una tarea
exports.eliminar = async (req, res, next) => {
  try {
    validar(req);
    const { id } = req.params;

    const [result] = await db.query("DELETE FROM tareas WHERE id = ?", [id]);

    if (result.affectedRows === 0)
      return res.status(404).json({ data: null, error: { message: "Tarea no encontrada" } });

    res.json({ data: { message: "Tarea eliminada" }, error: null });
  } catch (e) {
    next(e);
  }
};