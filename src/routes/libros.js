const express = require("express");
const router = express.Router();

const {
  obtenerLibros,
  obtenerLibroPorId,
  agregarLibro,
  actualizarLibro,
  eliminarLibro,
  subirPortada,
} = require("../controllers/librosController");

const {
  validarLibroCompleto,
  validarLibroParcial,
} = require("../middleware/validarLibro");

const upload = require("../middleware/upload");

// ─────────────────────────────────────────────────────
//  Definición de rutas del recurso /libros
//
//  GET    /libros              → Obtener todos los libros
//  GET    /libros/:id          → Obtener un libro por ID
//  POST   /libros              → Agregar un nuevo libro
//  PUT    /libros/:id          → Actualizar un libro existente
//  DELETE /libros/:id          → Eliminar un libro
//  POST   /libros/:id/portada  → Subir imagen de portada
// ─────────────────────────────────────────────────────

router.get("/", obtenerLibros);
router.get("/:id", obtenerLibroPorId);
router.post("/", validarLibroCompleto, agregarLibro);
router.put("/:id", validarLibroParcial, actualizarLibro);
router.delete("/:id", eliminarLibro);
router.post("/:id/portada", upload.single("portada"), subirPortada);

module.exports = router;
