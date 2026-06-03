-- ============================================================
--  Script de base de datos: Librería API REST
--  Ejecutar este archivo en MySQL antes de iniciar la app
-- ============================================================

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS libreria_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE libreria_db;

-- ─────────────────────────────────────────────
--  Tabla: libros
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS libros (
  id          INT           NOT NULL AUTO_INCREMENT,
  titulo      VARCHAR(255)  NOT NULL,
  autor       VARCHAR(150)  NOT NULL,
  precio      DECIMAL(10,2) NOT NULL,
  stock       INT           NOT NULL DEFAULT 0,
  isbn        VARCHAR(20)       NULL,
  portada     VARCHAR(255)      NULL,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT chk_precio_positivo CHECK (precio >= 0),
  CONSTRAINT chk_stock_positivo  CHECK (stock >= 0)
);

-- ─────────────────────────────────────────────
--  Datos de ejemplo para pruebas
-- ─────────────────────────────────────────────
INSERT INTO libros (titulo, autor, precio, stock, isbn) VALUES
  ('El Aleph',              'Jorge Luis Borges',    1500.00, 10, '978-9500301381'),
  ('Cien años de soledad',  'Gabriel García Márquez', 2200.00, 5, '978-8497592208'),
  ('Ficciones',             'Jorge Luis Borges',    1800.00, 8, '978-8420633282'),
  ('Rayuela',               'Julio Cortázar',       1900.00, 3, '978-8437601953'),
  ('La sombra del viento',  'Carlos Ruiz Zafón',    2500.00, 12, '978-8408163435');
