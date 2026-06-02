const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Abre o crea el archivo de la base de datos
const db = new sqlite3.Database(path.join(__dirname, '../gastos.db'), (err) => {
    if (err) console.error('Error al abrir la BD:', err.message);
});

// Creamos las tablas usando la sintaxis estándar
db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS categorias (
        id     INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL UNIQUE
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS gastos (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        monto        REAL    NOT NULL,
        categoria_id INTEGER NOT NULL REFERENCES categorias(id),
        fecha        TEXT    NOT NULL,
        descripcion  TEXT,
        metodo_pago  TEXT
      );
    `);

    const categoriasDefault = ['Alimentación', 'Transporte', 'Salud', 'Entretenimiento', 'Servicios', 'Liceo', 'General'];
    categoriasDefault.forEach(cat => {
        db.run('INSERT OR IGNORE INTO categorias (nombre) VALUES (?)', [cat]);
    });
});

module.exports = db;
