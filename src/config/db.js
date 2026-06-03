const mysql = require("mysql2");

// Se crea un pool de conexiones en lugar de una conexión única.
// El pool maneja automáticamente múltiples solicitudes simultáneas
// y reconecta si la conexión se pierde.
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "libreria_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Verificar la conexión al iniciar
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Error al conectar con la base de datos:", err.message);
    process.exit(1); // Detener la app si no hay conexión
  }
  console.log("✅ Conexión a MySQL establecida correctamente");
  connection.release(); // Liberar la conexión de vuelta al pool
});

// Exportamos la versión con promesas para poder usar async/await
module.exports = pool.promise();
