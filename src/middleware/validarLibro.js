// Middleware de validación para los datos de un libro

/**
 * Valida los campos requeridos al CREAR un libro (POST).
 * Todos los campos son obligatorios.
 */
const validarLibroCompleto = (req, res, next) => {
  const { titulo, autor, precio, stock, isbn } = req.body;
  const errores = [];

  // Validar titulo
  if (!titulo || typeof titulo !== "string" || titulo.trim() === "") {
    errores.push("El campo 'titulo' es obligatorio y debe ser texto");
  } else if (titulo.trim().length > 255) {
    errores.push("El campo 'titulo' no puede superar los 255 caracteres");
  }

  // Validar autor
  if (!autor || typeof autor !== "string" || autor.trim() === "") {
    errores.push("El campo 'autor' es obligatorio y debe ser texto");
  } else if (autor.trim().length > 150) {
    errores.push("El campo 'autor' no puede superar los 150 caracteres");
  }

  // Validar precio
  if (precio === undefined || precio === null || precio === "") {
    errores.push("El campo 'precio' es obligatorio");
  } else if (isNaN(Number(precio)) || Number(precio) < 0) {
    errores.push("El campo 'precio' debe ser un número mayor o igual a 0");
  }

  // Validar stock (opcional pero si viene debe ser válido)
  if (stock !== undefined && stock !== null && stock !== "") {
    if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
      errores.push("El campo 'stock' debe ser un número entero mayor o igual a 0");
    }
  }

  // Validar ISBN (opcional)
  if (isbn !== undefined && isbn !== null && isbn !== "") {
    if (typeof isbn !== "string" || isbn.trim().length > 20) {
      errores.push("El campo 'isbn' debe ser texto de máximo 20 caracteres");
    }
  }

  if (errores.length > 0) {
    return res.status(400).json({
      error: "Datos inválidos",
      detalles: errores,
    });
  }

  next();
};

/**
 * Valida los campos al ACTUALIZAR un libro (PUT).
 * Al menos un campo debe estar presente.
 */
const validarLibroParcial = (req, res, next) => {
  const { titulo, autor, precio, stock, isbn } = req.body;
  const errores = [];

  // Verificar que viene al menos un campo
  if (!titulo && !autor && precio === undefined && stock === undefined && !isbn) {
    return res.status(400).json({
      error: "Debe enviar al menos un campo para actualizar",
    });
  }

  if (titulo !== undefined) {
    if (typeof titulo !== "string" || titulo.trim() === "") {
      errores.push("El campo 'titulo' debe ser texto no vacío");
    } else if (titulo.trim().length > 255) {
      errores.push("El campo 'titulo' no puede superar los 255 caracteres");
    }
  }

  if (autor !== undefined) {
    if (typeof autor !== "string" || autor.trim() === "") {
      errores.push("El campo 'autor' debe ser texto no vacío");
    } else if (autor.trim().length > 150) {
      errores.push("El campo 'autor' no puede superar los 150 caracteres");
    }
  }

  if (precio !== undefined) {
    if (isNaN(Number(precio)) || Number(precio) < 0) {
      errores.push("El campo 'precio' debe ser un número mayor o igual a 0");
    }
  }

  if (stock !== undefined) {
    if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
      errores.push("El campo 'stock' debe ser un número entero mayor o igual a 0");
    }
  }

  if (isbn !== undefined) {
    if (typeof isbn !== "string" || isbn.trim().length > 20) {
      errores.push("El campo 'isbn' debe ser texto de máximo 20 caracteres");
    }
  }

  if (errores.length > 0) {
    return res.status(400).json({
      error: "Datos inválidos",
      detalles: errores,
    });
  }

  next();
};

module.exports = { validarLibroCompleto, validarLibroParcial };
