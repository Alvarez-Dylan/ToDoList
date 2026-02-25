const router = require("express").Router();
const { body, param } = require("express-validator");
const ctrl = require("../controllers/tareas.controller");

const validarId = [
  param("id").isInt({ min: 1 }).withMessage("id inválido"),
];

// GET /api/tareas
router.get("/", ctrl.listar);

// POST /api/tareas
router.post(
  "/",
  [
    body("titulo")
      .isString()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage("El título es obligatorio y no puede superar 255 caracteres"),
  ],
  ctrl.crear
);

// PATCH /api/tareas/:id
router.patch(
  "/:id",
  [
    ...validarId,
    body("titulo").optional().isString().trim().isLength({ min: 1, max: 255 }),
    body("completada").optional().isBoolean(),
  ],
  ctrl.actualizar
);

// DELETE /api/tareas/:id
router.delete("/:id", validarId, ctrl.eliminar);

module.exports = router;