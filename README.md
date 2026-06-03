# 📚 Librería API REST
### Programación Web II — Actividad Obligatoria II
**Express + MySQL + API REST**

---

## Índice

1. [Informe de la actividad](#1-informe-de-la-actividad)
2. [Estructura del proyecto](#2-estructura-del-proyecto)
3. [Cómo ejecutar el proyecto](#3-cómo-ejecutar-el-proyecto)
4. [Referencia de la API](#4-referencia-de-la-api)
5. [Prueba paso a paso](#5-prueba-paso-a-paso)
6. [Decisiones de diseño](#6-decisiones-de-diseño)

---

## 1. Informe de la actividad

### 1.1 Diseño básico de la API

#### a) Rutas propuestas

| Método | Ruta | Acción |
|--------|------|--------|
| GET | `/libros` | Obtener todos los libros |
| GET | `/libros/:id` | Obtener un libro específico por su ID |
| POST | `/libros` | Agregar un nuevo libro |
| PUT | `/libros/:id` | Modificar los datos de un libro existente |
| DELETE | `/libros/:id` | Eliminar un libro por su ID |
| POST | `/libros/:id/portada` | Subir imagen de portada de un libro |

#### b) Diferencia entre `/libros` y `/libros/5`

**`/libros`** apunta al recurso colección. Un GET sobre esta ruta devuelve todos los libros. También es la ruta usada con POST para agregar un libro nuevo.

**`/libros/5`** apunta a un recurso individual identificado por el número 5 (su ID). Permite operar sobre ese libro en particular: consultarlo, modificarlo o eliminarlo sin afectar al resto.

En resumen: `/libros` trabaja sobre el conjunto, `/libros/5` trabaja sobre un elemento puntual.

#### c) Datos del libro en la base de datos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT (PK, AUTO_INCREMENT) | Identificador único |
| `titulo` | VARCHAR(255) | Título del libro |
| `autor` | VARCHAR(150) | Nombre del autor |
| `precio` | DECIMAL(10,2) | Precio de venta |
| `stock` | INT | Cantidad disponible |
| `isbn` | VARCHAR(20) | Código ISBN del libro |
| `portada` | VARCHAR(255) | Ruta de la imagen de portada |
| `created_at` | TIMESTAMP | Fecha de alta en el sistema |

---

### 1.2 Express y Middleware

#### a) ¿Para qué sirve Express en una aplicación backend?

Express es un framework para Node.js que simplifica la creación de servidores web. Sin Express, habría que manejar manualmente las rutas, los métodos HTTP, los encabezados y las respuestas usando el módulo `http` nativo de Node, lo cual es tedioso y propenso a errores.

Express permite definir rutas de forma clara y concisa, organizar la lógica del servidor en funciones manejadoras, y extender el comportamiento del servidor a través de middlewares. En pocas palabras: Express es la estructura sobre la que se construye toda la API.

#### b) ¿Qué ventaja aporta Nodemon durante el desarrollo?

Nodemon es una herramienta de desarrollo que reinicia automáticamente el servidor cada vez que detecta cambios en los archivos del proyecto. Sin Nodemon, cada vez que se modifica el código habría que detener manualmente el servidor con `Ctrl+C` y volver a ejecutar `node app.js`.

Esto ahorra tiempo, reduce interrupciones en el flujo de trabajo y hace que el ciclo de desarrollo sea más ágil. Es importante aclarar que Nodemon no se usa en producción, solo en desarrollo.

#### c) ¿Qué es un middleware?

Un middleware es una función que se ejecuta en el medio del ciclo de vida de una solicitud HTTP, es decir, entre que el servidor recibe el request y antes de que envíe la respuesta. Tiene acceso al objeto `req` (solicitud), `res` (respuesta) y a la función `next()` que le indica a Express que continúe con el siguiente middleware o con el manejador de la ruta.

Se puede pensar como una cadena de filtros por los que pasa cada solicitud antes de ser procesada.

```js
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next(); // pasa al siguiente eslabón
});
```

#### d) 2 middlewares útiles para este proyecto

**1. `express.json()`**
Viene incluido en Express y parsea el cuerpo de las solicitudes en formato JSON. En una API REST donde el cliente envía datos en el body de un POST, sin este middleware `req.body` estaría vacío.

**2. `morgan`**
Registra automáticamente cada petición HTTP que llega al servidor (método, ruta, código de respuesta, tiempo). Es muy útil durante el desarrollo para rastrear qué endpoints se están usando, detectar errores y entender el flujo sin agregar `console.log` manualmente en cada ruta.

> En este proyecto también se usa **Multer** como middleware para el manejo de archivos (`multipart/form-data`), detallado en la sección de decisiones de diseño.

---

### 1.3 Base de Datos y Seguridad

#### a) ¿Por qué es importante validar datos antes de guardarlos?

Si se guardan datos sin validar, la base de datos puede terminar con información corrupta, incompleta o inconsistente: un precio negativo, un título vacío, o texto donde debería haber un número. Validar en el backend es la última línea de defensa antes de que el dato llegue a la base de datos, independientemente de si el cliente valida en el frontend.

#### b) Controles básicos antes de insertar un libro en MySQL

- **Campos requeridos presentes**: que `titulo`, `autor` y `precio` no sean `undefined`, `null` ni cadenas vacías.
- **Tipos correctos**: que `precio` y `stock` sean números y no texto.
- **Longitud razonable**: que el título no supere un límite lógico (ej. 255 caracteres).
- **Uso de consultas parametrizadas**: nunca concatenar directamente los valores en el SQL.

#### c) ¿Qué podría pasar si una aplicación no maneja errores de base de datos?

- El servidor puede caerse completamente ante una conexión fallida o una consulta inválida.
- Se podrían exponer mensajes de error internos al cliente (nombres de tablas, estructura de la BD), lo que representa una brecha de seguridad.
- El usuario recibiría respuestas sin sentido o la aplicación quedaría sin responder.
- Sería muy difícil diagnosticar qué salió mal porque no hay registro del error.

La buena práctica es usar bloques `try/catch` y siempre enviar una respuesta HTTP apropiada (como un 500) cuando algo falla.

#### d) ¿Qué riesgos tiene construir consultas SQL concatenando texto manualmente?

Esto se llama **inyección SQL** y es una de las vulnerabilidades más conocidas. Si un usuario envía como título algo como `'); DROP TABLE libros; --`, y ese texto se concatena en el SQL, la base de datos podría ejecutar ese comando y eliminar toda la tabla.

```js
// ❌ Código vulnerable
"INSERT INTO libros (titulo) VALUES ('" + titulo + "')"
// Si titulo = "'); DROP TABLE libros; --"
// Ejecuta: INSERT INTO libros (titulo) VALUES (''); DROP TABLE libros; --'
```

La solución es usar **consultas preparadas** con `?` como placeholders, donde el driver de MySQL escapa los valores automáticamente.

---

### 1.4 Análisis de Código Generado por IA

El código analizado:

```js
app.post('/libros', (req, res) => {
  const titulo = req.body.titulo;

  connection.query(
    "INSERT INTO libros (titulo) VALUES ('" + titulo + "')"
  );

  res.send("Libro agregado");
});
```

#### a) Problemas identificados

1. **Inyección SQL**: `titulo` se concatena directamente en la consulta. Un usuario malicioso puede ejecutar comandos SQL arbitrarios.
2. **Sin validación de datos**: no se verifica si `titulo` existe, si está vacío o si es del tipo correcto.
3. **Sin manejo de errores**: `connection.query()` no tiene callback. Si la consulta falla, el servidor responde "Libro agregado" igual, informando algo falso al cliente.
4. **Respuesta incorrecta**: se usa `res.send()` con texto plano en lugar de `res.json()` con el código HTTP correcto (201 para creación exitosa).

#### b) Qué podría fallar, qué falta validar y qué mejoraría

- **Podría fallar**: la conexión a la BD, la consulta si `titulo` tiene caracteres especiales, o el servidor puede responder éxito aunque la inserción haya fallado.
- **Faltaría validar**: que `req.body` exista, que `titulo` no esté vacío y que tenga una longitud razonable.
- **Mejoraría**: usar prepared statements, agregar manejo de errores, y devolver códigos HTTP correctos.

#### c) Versión corregida

```js
app.post('/libros', (req, res) => {
  const { titulo, autor, precio } = req.body;

  if (!titulo || !autor || precio === undefined) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }
  if (typeof titulo !== 'string' || titulo.trim() === '') {
    return res.status(400).json({ error: "El título no es válido" });
  }
  if (isNaN(precio) || precio < 0) {
    return res.status(400).json({ error: "El precio no es válido" });
  }

  const sql = "INSERT INTO libros (titulo, autor, precio) VALUES (?, ?, ?)";

  connection.query(sql, [titulo.trim(), autor.trim(), precio], (err, result) => {
    if (err) {
      console.error("Error en la base de datos:", err);
      return res.status(500).json({ error: "Error al agregar el libro" });
    }
    res.status(201).json({ mensaje: "Libro agregado correctamente", id: result.insertId });
  });
});
```

---

## 2. Estructura del proyecto

```
libreria-api/
├── src/
│   ├── app.js                      # Punto de entrada: Express, middlewares, rutas
│   ├── config/
│   │   └── db.js                   # Conexión a MySQL (pool de conexiones)
│   ├── controllers/
│   │   └── librosController.js     # Lógica de cada operación CRUD + subida de portada
│   ├── middleware/
│   │   ├── upload.js               # Configuración de Multer (destino, nombre, filtros)
│   │   └── validarLibro.js         # Validación de datos antes de llegar a la BD
│   └── routes/
│       └── libros.js               # Definición de todas las rutas del recurso /libros
├── uploads/
│   └── portadas/                   # Imágenes de portada subidas por Multer
├── database.sql                    # Script SQL: crea la BD, la tabla y carga datos de prueba
├── .env.example                    # Plantilla de variables de entorno (sin datos reales)
├── .gitignore                      # Excluye node_modules, .env y archivos subidos
└── package.json                    # Dependencias y scripts del proyecto
```

> **Sobre `node_modules/`:** esta carpeta no está en el repositorio y eso es intencional. Es el estándar en todos los proyectos Node.js — puede pesar cientos de MB y contiene archivos generados automáticamente que no tienen sentido versionar. El archivo `package.json` cumple el rol de registrar qué dependencias necesita el proyecto, y `npm install` las descarga cada vez que alguien clona el repo. Cualquier desarrollador que clone este proyecto deberá ejecutar `npm install` antes de iniciarlo.
>
> **Sobre `.env`:** este archivo tampoco está en el repositorio porque contiene credenciales reales (usuario y contraseña de la base de datos). Está excluido mediante `.gitignore`. En su lugar, el repositorio incluye `.env.example` con la estructura de variables necesarias pero sin valores reales. Cada desarrollador crea su propio `.env` local a partir de ese ejemplo y completa con sus propios datos.

---

## 3. Cómo ejecutar el proyecto

### Requisitos

- [Node.js](https://nodejs.org/) v18 o superior (incluye npm)
- MySQL instalado y corriendo (puede ser con MySQL Workbench, XAMPP, o por terminal)

---

### Paso 1 — Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/libreria-api.git
cd libreria-api
```

---

### Paso 2 — Instalar dependencias

```bash
npm install
```

Esto descarga todas las dependencias listadas en `package.json`: `express`, `mysql2`, `morgan`, `multer`, `dotenv` y `nodemon`. Es necesario hacerlo una sola vez (o cada vez que se agreguen nuevas dependencias).

---

### Paso 3 — Crear la base de datos

Abrí MySQL Workbench (o tu cliente MySQL preferido), conectate a tu servidor local y ejecutá el archivo `database.sql` que está en la raíz del proyecto.

**Opción A — Desde MySQL Workbench:**
1. Ir a `File → Open SQL Script`
2. Seleccionar el archivo `database.sql`
3. Ejecutar con el botón ⚡ o `Ctrl+Shift+Enter`

**Opción B — Desde la terminal:**
```bash
mysql -u root -p < database.sql
```

Esto crea automáticamente la base de datos `libreria_db`, la tabla `libros` y carga 5 libros de ejemplo para probar.

---

### Paso 4 — Configurar el archivo .env

Copiá el archivo de ejemplo:

```bash
# En Mac/Linux
cp .env.example .env

# En Windows (cmd)
copy .env.example .env
```

Abrí el `.env` recién creado y completá con tus datos locales de MySQL:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password_aqui
DB_NAME=libreria_db
```

> **Sobre la contraseña:** cada desarrollador completa el `.env` con sus propias credenciales locales. Este archivo **nunca se sube a GitHub** (está en el `.gitignore`). Si tu MySQL local no tiene contraseña, dejá `DB_PASSWORD=` vacío. El archivo `.env.example` que sí está en el repositorio sirve como guía de qué variables configurar, pero sin valores reales.

---

### Paso 5 — Iniciar el servidor

```bash
# Modo desarrollo — Nodemon reinicia el servidor automáticamente al guardar cambios
npm run dev

# Modo producción
npm start
```

Si todo está configurado correctamente, la consola muestra:

```
✅ Conexión a MySQL establecida correctamente
🚀 Servidor corriendo en http://localhost:3000
📚 API de Librería lista
```

Si aparece un error de conexión, verificá que los datos del `.env` coincidan con tu MySQL local.

---

## 4. Referencia de la API

### Rutas disponibles

| Método | Ruta | Acción | Código de éxito |
|--------|------|--------|-----------------|
| GET | `/libros` | Obtener todos los libros | 200 |
| GET | `/libros/:id` | Obtener un libro por ID | 200 |
| POST | `/libros` | Agregar un nuevo libro | 201 |
| PUT | `/libros/:id` | Actualizar un libro existente | 200 |
| DELETE | `/libros/:id` | Eliminar un libro | 200 |
| POST | `/libros/:id/portada` | Subir imagen de portada | 200 |

### Campos del libro (JSON)

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `titulo` | string | ✅ Sí | Título del libro (máx. 255 caracteres) |
| `autor` | string | ✅ Sí | Nombre del autor (máx. 150 caracteres) |
| `precio` | número | ✅ Sí | Precio de venta (≥ 0) |
| `stock` | entero | No | Unidades en stock (≥ 0, default: 0) |
| `isbn` | string | No | Código ISBN (máx. 20 caracteres) |
| `portada` | — | — | Se asigna automáticamente al subir archivo con Multer |

### Restricciones del upload de portada (Multer)

| Parámetro | Valor |
|-----------|-------|
| Campo del formulario | `portada` |
| Tipos aceptados | JPG, PNG, WEBP |
| Tamaño máximo | 2 MB |
| Destino | `uploads/portadas/` |
| Nombre generado | `libro-{id}-{timestamp}.{ext}` |

### Códigos de estado

| Código | Cuándo se usa |
|--------|--------------|
| 200 | Operación exitosa |
| 201 | Recurso creado (POST /libros) |
| 400 | Datos inválidos, campo faltante o archivo no permitido |
| 404 | Libro no encontrado |
| 500 | Error interno del servidor |

---

## 5. Prueba paso a paso

No se necesita ningún entorno de testing especial. La API se prueba como cualquier servidor web usando **Thunder Client** (extensión de VS Code), **Postman** o `curl` desde la terminal, con el servidor corriendo.

---

### Prueba 1 — Obtener todos los libros

**Método:** `GET`
**URL:** `http://localhost:3000/libros`

```bash
curl http://localhost:3000/libros
```

**Respuesta esperada (200):**
```json
{
  "total": 5,
  "datos": [
    {
      "id": 1,
      "titulo": "El Aleph",
      "autor": "Jorge Luis Borges",
      "precio": "1500.00",
      "stock": 10,
      "isbn": "978-9500301381",
      "portada": null,
      "created_at": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

---

### Prueba 2 — Agregar un libro nuevo

**Método:** `POST`
**URL:** `http://localhost:3000/libros`
**Header:** `Content-Type: application/json`
**Body:**
```json
{
  "titulo": "Don Quijote de la Mancha",
  "autor": "Miguel de Cervantes",
  "precio": 3200,
  "stock": 7,
  "isbn": "978-8424922498"
}
```

```bash
curl -X POST http://localhost:3000/libros \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Don Quijote de la Mancha","autor":"Miguel de Cervantes","precio":3200,"stock":7,"isbn":"978-8424922498"}'
```

**Respuesta esperada (201):**
```json
{
  "mensaje": "Libro agregado correctamente",
  "datos": {
    "id": 6,
    "titulo": "Don Quijote de la Mancha",
    "autor": "Miguel de Cervantes",
    "precio": 3200,
    "stock": 7,
    "isbn": "978-8424922498"
  }
}
```

---

### Prueba 3 — Subir portada de un libro (Multer)

**Método:** `POST`
**URL:** `http://localhost:3000/libros/1/portada`
**Body:** `form-data` — campo `portada` de tipo archivo (JPG, PNG o WEBP, máx. 2 MB)

**En Thunder Client:**
1. Método `POST`, URL `http://localhost:3000/libros/1/portada`
2. Pestaña **Body → Form**
3. Agregar campo: nombre `portada`, tipo `File`, seleccionar la imagen

**En Postman:**
1. Método `POST`, URL `http://localhost:3000/libros/1/portada`
2. Pestaña **Body → form-data**
3. Clave `portada`, cambiar tipo a `File`, seleccionar la imagen

```bash
curl -X POST http://localhost:3000/libros/1/portada \
  -F "portada=@/ruta/a/tu/imagen.jpg"
```

**Respuesta esperada (200):**
```json
{
  "mensaje": "Portada subida correctamente",
  "archivo": {
    "nombre": "libro-1-1717430400000.jpg",
    "ruta": "uploads/portadas/libro-1-1717430400000.jpg",
    "tamaño": "84.3 KB"
  }
}
```

La imagen queda accesible en el navegador:
`http://localhost:3000/uploads/portadas/libro-1-1717430400000.jpg`

---

## 6. Decisiones de diseño

| Decisión | Razón |
|----------|-------|
| **`node_modules` excluido del repo** | Estándar en Node.js. `npm install` las descarga desde `package.json`. Subirlas sería agregar cientos de MB innecesarios |
| **`.env` excluido del repo** | Contiene credenciales reales. Cada desarrollador crea el suyo a partir de `.env.example` |
| **Pool de conexiones** en lugar de conexión única | Maneja múltiples requests simultáneos sin errores ni cuelgues |
| **Consultas parametrizadas** (`?`) en todas las queries | Previene inyección SQL en todos los endpoints |
| **Validación en middleware** separada del controlador | El código queda organizado y la validación es reutilizable |
| **PUT parcial** — solo actualiza los campos enviados | No es necesario mandar todos los datos para modificar uno solo |
| **Verificación de existencia** antes de UPDATE y DELETE | Devuelve 404 claro en vez de un error genérico de MySQL |
| **Async/await** en todos los controllers | Más limpio que callbacks, con `try/catch` para manejar errores |
| **Multer** con `diskStorage` | Guarda imágenes en disco con nombre único, valida tipo y tamaño antes de aceptarlas |
| **Carpeta `uploads/` como estática** | Las portadas se sirven por URL directa sin lógica extra en los controllers |
| **Errores de Multer en el middleware global** | Si el archivo es muy grande o de tipo incorrecto, devuelve un 400 con mensaje claro |
