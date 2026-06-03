const multer = require("multer");
const path = require("path");

// ─────────────────────────────────────────────
//  Configuración de almacenamiento en disco
// ─────────────────────────────────────────────

const storage = multer.diskStorage({
  // Carpeta donde se guardan los archivos subidos
  destination: (req, file, cb) => {
    cb(null, "uploads/portadas");
  },

  // Nombre del archivo: id del libro + timestamp + extensión original
  // Así se evitan colisiones si se sube más de una portada
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const nombre = `libro-${req.params.id}-${Date.now()}${ext}`;
    cb(null, nombre);
  },
});

// ─────────────────────────────────────────────
//  Filtro: solo se aceptan imágenes
// ─────────────────────────────────────────────

const fileFilter = (req, file, cb) => {
  const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];

  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true); // aceptar el archivo
  } else {
    cb(new Error("Solo se permiten imágenes JPG, PNG o WEBP"), false);
  }
};

// ─────────────────────────────────────────────
//  Instancia de Multer con límite de tamaño
// ─────────────────────────────────────────────

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB máximo
  },
});

module.exports = upload;
