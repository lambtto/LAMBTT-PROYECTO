const Database = require('better-sqlite3');
const db = new Database('gastos.db');
 
db.exec(
  CREATE TABLE IF NOT EXISTS categorias (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre    TEXT    NOT NULL UNIQUE,
    compartida INTEGER NOT NULL DEFAULT 0
  );
 
  CREATE TABLE IF NOT EXISTS grupos (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE
  );
 
  CREATE TABLE IF NOT EXISTS grupo_miembros (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    grupo_id  INTEGER NOT NULL REFERENCES grupos(id),
    usuario   TEXT    NOT NULL,
    UNIQUE(grupo_id, usuario)
  );
 
  CREATE TABLE IF NOT EXISTS gastos (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    monto        REAL    NOT NULL,
    categoria_id INTEGER NOT NULL REFERENCES categorias(id),
    fecha        TEXT    NOT NULL,
    descripcion  TEXT,
    metodo_pago  TEXT,
    grupo_id     INTEGER REFERENCES grupos(id),
    usuario      TEXT    NOT NULL DEFAULT 'personal'
  );
 
  INSERT OR IGNORE INTO categorias (nombre, compartida) VALUES
    ('Alimentación',    0),
    ('Transporte',      0),
    ('Salud',           0),
    ('Entretenimiento', 0),
    ('Servicios',       0),
    ('Hogar',           1),
    ('Arriendo',        1),
    ('Supermercado',    1);
 
  INSERT OR IGNORE INTO grupos (nombre) VALUES ('Familia');
);
 
module.exports = db;
