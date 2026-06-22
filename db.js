const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'gastapp',
  password: process.env.DB_PASSWORD || 'gastapp123',
  database: process.env.DB_NAME || 'gastapp_db',
});

async function initDB() {
  let retries = 10;
  while (retries > 0) {
    try {
      await pool.query('SELECT 1');
      console.log('Conexión con PostgreSQL establecida exitosamente.');
      break;
    } catch (err) {
      retries--;
      console.error(`Error al conectar con PostgreSQL (intentos restantes: ${retries}): ${err.message}`);
      if (retries === 0) {
        throw err;
      }
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS categorias (
      id         SERIAL PRIMARY KEY,
      nombre     TEXT NOT NULL UNIQUE,
      compartida INTEGER NOT NULL DEFAULT 0
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS grupos (
      id     SERIAL PRIMARY KEY,
      nombre TEXT NOT NULL UNIQUE
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS grupo_miembros (
      id       SERIAL PRIMARY KEY,
      grupo_id INTEGER NOT NULL REFERENCES grupos(id),
      usuario  TEXT NOT NULL,
      UNIQUE(grupo_id, usuario)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS gastos (
      id           SERIAL PRIMARY KEY,
      monto        REAL NOT NULL,
      categoria_id INTEGER NOT NULL REFERENCES categorias(id),
      fecha        TEXT NOT NULL,
      descripcion  TEXT,
      metodo_pago  TEXT,
      grupo_id     INTEGER REFERENCES grupos(id),
      usuario      TEXT NOT NULL DEFAULT 'personal'
    );
  `);

  await pool.query(`
    INSERT INTO categorias (nombre, compartida) VALUES
      ('Alimentación',    0),
      ('Transporte',      0),
      ('Salud',           0),
      ('Entretenimiento', 0),
      ('Servicios',       0),
      ('Hogar',           1),
      ('Arriendo',        1),
      ('Supermercado',    1)
    ON CONFLICT (nombre) DO NOTHING;
  `);

  await pool.query(`
    INSERT INTO grupos (nombre) VALUES ('Familia')
    ON CONFLICT (nombre) DO NOTHING;
  `);

  console.log('Tablas inicializadas correctamente.');
}

module.exports = {
  pool,
  initDB
};