require("dotenv").config();
const express = require("express");
const morgan = require("morgan");

const librosRouter = require("./routes/libros");

const app = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────────
//  Middlewares globales
// ─────────────────────────────────────────────

// Morgan: registra cada petición HTTP en la consola (útil en desarrollo)
// Formato: método, ruta, código HTTP y tiempo de respuesta
app.use(morgan("dev"));

// express.json(): parsea el body de las solicitudes en formato JSON
// Sin esto, req.body estaría vacío en POST y PUT
app.use(express.json());

// Sirve la carpeta uploads como archivos estáticos.
// Permite acceder a las portadas por URL directa, por ejemplo:
// http://localhost:3000/uploads/portadas/libro-1-1234567890.jpg
app.use("/uploads", express.static("uploads"));

// ─────────────────────────────────────────────
//  Rutas de la API
// ─────────────────────────────────────────────

// Ruta raíz: información general de la API
app.get("/", (req, res) => {
  res.status(200).json({
    nombre: "Librería API REST",
    version: "1.0.0",
    descripcion: "API para administrar el catálogo de libros de la librería",
    rutas_disponibles: {
      "GET /libros":              "Obtener todos los libros",
      "GET /libros/:id":          "Obtener un libro por ID",
      "POST /libros":             "Agregar un nuevo libro",
      "PUT /libros/:id":          "Actualizar un libro existente",
      "DELETE /libros/:id":       "Eliminar un libro",
      "POST /libros/:id/portada": "Subir imagen de portada (multipart/form-data)",
    },
  });
});

// Todas las rutas del recurso libros
app.use("/libros", librosRouter);

// ─────────────────────────────────────────────
//  Manejo de rutas no encontradas (404)
// ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error: `Ruta '${req.method} ${req.originalUrl}' no encontrada`,
  });
});

// ─────────────────────────────────────────────
//  Middleware de errores globales
//  Captura errores de Multer y cualquier otro error no manejado
// ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  // Errores específicos de Multer
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "El archivo supera el tamaño máximo permitido (2 MB)" });
  }
  if (err.message && err.message.includes("Solo se permiten")) {
    return res.status(400).json({ error: err.message });
  }

  console.error("Error no manejado:", err.message);
  res.status(500).json({ error: "Error interno del servidor" });
});

// ─────────────────────────────────────────────
//  Iniciar el servidor
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📚 API de Librería lista`);
  console.log(`⚙️  Modo: ${process.env.NODE_ENV || "development"}`);
});
