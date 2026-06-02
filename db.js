const Database = require('better-sqlite3');
const db = new Database('gastos.db');
 
db.exec(`
  CREATE TABLE IF NOT EXISTS categorias (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE
  );
 
  CREATE TABLE IF NOT EXISTS gastos (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    monto        REAL    NOT NULL,
    categoria_id INTEGER NOT NULL REFERENCES categorias(id),
    fecha        TEXT    NOT NULL,
    descripcion  TEXT,
    metodo_pago  TEXT
  );
 
  -- Categorías por defecto (se ignoran si ya existen)
  INSERT OR IGNORE INTO categorias (nombre) VALUES
    ('Alimentación'),
    ('Transporte'),
    ('Salud'),
    ('Entretenimiento'),
    ('Servicios');
`);
 
module.exports = db;
