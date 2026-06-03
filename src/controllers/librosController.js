const db = require("../config/db");

// ─────────────────────────────────────────────
//  GET /libros
//  Obtiene todos los libros de la base de datos
// ─────────────────────────────────────────────
const obtenerLibros = async (req, res) => {
  try {
    const [libros] = await db.query(
      "SELECT * FROM libros ORDER BY created_at DESC"
    );

    if (libros.length === 0) {
      return res.status(200).json({
        mensaje: "No hay libros registrados aún",
        datos: [],
      });
    }

    res.status(200).json({
      total: libros.length,
      datos: libros,
    });
  } catch (error) {
    console.error("Error al obtener libros:", error.message);
    res.status(500).json({ error: "Error interno al obtener los libros" });
  }
};

// ─────────────────────────────────────────────
//  GET /libros/:id
//  Obtiene un libro por su ID
// ─────────────────────────────────────────────
const obtenerLibroPorId = async (req, res) => {
  const { id } = req.params;

  // Validar que el ID sea un número entero positivo
  if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({ error: "El ID debe ser un número entero positivo" });
  }

  try {
    // Consulta parametrizada para evitar inyección SQL
    const [resultado] = await db.query(
      "SELECT * FROM libros WHERE id = ?",
      [id]
    );

    if (resultado.length === 0) {
      return res.status(404).json({ error: `No se encontró ningún libro con ID ${id}` });
    }

    res.status(200).json({ datos: resultado[0] });
  } catch (error) {
    console.error("Error al obtener libro:", error.message);
    res.status(500).json({ error: "Error interno al obtener el libro" });
  }
};

// ─────────────────────────────────────────────
//  POST /libros
//  Agrega un nuevo libro
// ─────────────────────────────────────────────
const agregarLibro = async (req, res) => {
  // La validación fue hecha por el middleware validarLibroCompleto
  const { titulo, autor, precio, stock = 0, isbn = null } = req.body;

  try {
    const [resultado] = await db.query(
      "INSERT INTO libros (titulo, autor, precio, stock, isbn) VALUES (?, ?, ?, ?, ?)",
      [titulo.trim(), autor.trim(), Number(precio), Number(stock), isbn ? isbn.trim() : null]
    );

    res.status(201).json({
      mensaje: "Libro agregado correctamente",
      datos: {
        id: resultado.insertId,
        titulo: titulo.trim(),
        autor: autor.trim(),
        precio: Number(precio),
        stock: Number(stock),
        isbn: isbn || null,
      },
    });
  } catch (error) {
    console.error("Error al agregar libro:", error.message);
    res.status(500).json({ error: "Error interno al agregar el libro" });
  }
};

// ─────────────────────────────────────────────
//  PUT /libros/:id
//  Actualiza los datos de un libro existente
// ─────────────────────────────────────────────
const actualizarLibro = async (req, res) => {
  const { id } = req.params;

  if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({ error: "El ID debe ser un número entero positivo" });
  }

  // La validación fue hecha por el middleware validarLibroParcial
  const { titulo, autor, precio, stock, isbn } = req.body;

  try {
    // Verificar que el libro existe antes de actualizar
    const [existe] = await db.query("SELECT id FROM libros WHERE id = ?", [id]);
    if (existe.length === 0) {
      return res.status(404).json({ error: `No se encontró ningún libro con ID ${id}` });
    }

    // Construir dinámicamente solo los campos que se enviaron
    const campos = [];
    const valores = [];

    if (titulo !== undefined) { campos.push("titulo = ?"); valores.push(titulo.trim()); }
    if (autor !== undefined)  { campos.push("autor = ?");  valores.push(autor.trim()); }
    if (precio !== undefined) { campos.push("precio = ?"); valores.push(Number(precio)); }
    if (stock !== undefined)  { campos.push("stock = ?");  valores.push(Number(stock)); }
    if (isbn !== undefined)   { campos.push("isbn = ?");   valores.push(isbn ? isbn.trim() : null); }

    valores.push(id); // Para el WHERE id = ?

    await db.query(
      `UPDATE libros SET ${campos.join(", ")} WHERE id = ?`,
      valores
    );

    // Devolver el libro actualizado
    const [actualizado] = await db.query("SELECT * FROM libros WHERE id = ?", [id]);

    res.status(200).json({
      mensaje: "Libro actualizado correctamente",
      datos: actualizado[0],
    });
  } catch (error) {
    console.error("Error al actualizar libro:", error.message);
    res.status(500).json({ error: "Error interno al actualizar el libro" });
  }
};

// ─────────────────────────────────────────────
//  DELETE /libros/:id
//  Elimina un libro por su ID
// ─────────────────────────────────────────────
const eliminarLibro = async (req, res) => {
  const { id } = req.params;

  if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({ error: "El ID debe ser un número entero positivo" });
  }

  try {
    // Verificar que el libro existe antes de eliminar
    const [existe] = await db.query("SELECT id, titulo FROM libros WHERE id = ?", [id]);
    if (existe.length === 0) {
      return res.status(404).json({ error: `No se encontró ningún libro con ID ${id}` });
    }

    const titulo = existe[0].titulo;
    await db.query("DELETE FROM libros WHERE id = ?", [id]);

    res.status(200).json({
      mensaje: `El libro "${titulo}" fue eliminado correctamente`,
    });
  } catch (error) {
    console.error("Error al eliminar libro:", error.message);
    res.status(500).json({ error: "Error interno al eliminar el libro" });
  }
};

// ─────────────────────────────────────────────
//  POST /libros/:id/portada
//  Sube una imagen de portada para un libro
// ─────────────────────────────────────────────
const subirPortada = async (req, res) => {
  const { id } = req.params;

  // Multer ya validó el tipo y tamaño del archivo.
  // Si no llegó ningún archivo, req.file es undefined.
  if (!req.file) {
    return res.status(400).json({ error: "No se recibió ningún archivo" });
  }

  try {
    // Verificar que el libro existe
    const [existe] = await db.query("SELECT id FROM libros WHERE id = ?", [id]);
    if (existe.length === 0) {
      return res.status(404).json({ error: `No se encontró ningún libro con ID ${id}` });
    }

    // Guardar la ruta del archivo en la columna portada de la tabla
    const rutaPortada = req.file.path.replace(/\\/g, "/"); // normalizar en Windows
    await db.query("UPDATE libros SET portada = ? WHERE id = ?", [rutaPortada, id]);

    res.status(200).json({
      mensaje: "Portada subida correctamente",
      archivo: {
        nombre: req.file.filename,
        ruta: rutaPortada,
        tamaño: `${(req.file.size / 1024).toFixed(1)} KB`,
      },
    });
  } catch (error) {
    console.error("Error al subir portada:", error.message);
    res.status(500).json({ error: "Error interno al subir la portada" });
  }
};

module.exports = {
  obtenerLibros,
  obtenerLibroPorId,
  agregarLibro,
  actualizarLibro,
  eliminarLibro,
  subirPortada,
};
