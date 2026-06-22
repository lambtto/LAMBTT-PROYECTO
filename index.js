const express      = require('express');
const { pool, initDB } = require('./db');
const swaggerUi    = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
app.use(express.json());

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Gastos Financieros',
      version: '2.0.0',
      description: 'HU1: Gastos personales | HU2: Gastos familiares compartidos'
    },
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./index.js']
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─────────────────────────────────────────────────────
// Middleware autenticación simulada
// ─────────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer '))
    return res.status(401).json({ error: 'No autenticado. Envía un token Bearer.' });
  req.usuario = auth.replace('Bearer ', '').trim() || 'usuario';
  next();
}

// ─────────────────────────────────────────────────────
// Helpers de validación
// ─────────────────────────────────────────────────────
function validarMonto(monto) {
  if (monto === undefined || monto === null) return 'El monto es obligatorio.';
  if (typeof monto !== 'number' || monto <= 0)
    return 'El monto es inválido. Debe ser un número mayor a 0.';
  return null;
}

function validarFecha(fecha) {
  if (!fecha) return 'La fecha es obligatoria.';
  if (typeof fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha))
    return 'La fecha no tiene un formato válido (YYYY-MM-DD).';
  
  const parts = fecha.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  const d = new Date(year, month, day);
  if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day)
    return 'La fecha no tiene un formato válido (YYYY-MM-DD).';

  const hoy = new Date();
  hoy.setHours(23, 59, 59, 999);
  if (d > hoy) return 'No se permiten fechas posteriores al día actual.';
  return null;
}

// ═════════════════════════════════════════════════════
// HU1 — CATEGORÍAS PERSONALES
// ═════════════════════════════════════════════════════

/**
 * @swagger
 * /categorias:
 *   get:
 *     summary: "[HU1] Lista todas las categorías"
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Array de categorías }
 *       401: { description: No autenticado }
 */
app.get('/categorias', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categorias ORDER BY nombre');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

/**
 * @swagger
 * /categorias:
 *   post:
 *     summary: "[HU1] Crea una categoría personalizada"
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre]
 *             properties:
 *               nombre:     { type: string,  example: "Gym" }
 *               compartida: { type: integer, example: 0, description: "0=personal, 1=compartida" }
 *     responses:
 *       201: { description: Categoría creada }
 *       400: { description: Nombre inválido o duplicado }
 *       401: { description: No autenticado }
 */
app.post('/categorias', authMiddleware, async (req, res) => {
  try {
    const { nombre, compartida = 0 } = req.body;
    if (!nombre || nombre.trim() === '')
      return res.status(400).json({ error: 'El nombre de la categoría es obligatorio.' });
    
    const checkName = await pool.query('SELECT id FROM categorias WHERE nombre = $1', [nombre.trim()]);
    if (checkName.rows.length > 0)
      return res.status(400).json({ error: 'Ya existe una categoría con ese nombre.' });
    
    const r = await pool.query(
      'INSERT INTO categorias (nombre, compartida) VALUES ($1, $2) RETURNING id',
      [nombre.trim(), compartida ? 1 : 0]
    );
    res.status(201).json({ id: r.rows[0].id, nombre: nombre.trim(), compartida: compartida ? 1 : 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

/**
 * @swagger
 * /categorias/{id}:
 *   delete:
 *     summary: "[HU1] Elimina una categoría"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Categoría eliminada }
 *       404: { description: No encontrada }
 *       401: { description: No autenticado }
 */
app.delete('/categorias/:id', authMiddleware, async (req, res) => {
  try {
    const i = await pool.query('DELETE FROM categorias WHERE id = $1', [req.params.id]);
    if (i.rowCount === 0) return res.status(404).json({ error: 'Categoría no encontrada.' });
    res.json({ mensaje: 'Categoría eliminada.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// ═════════════════════════════════════════════════════
// HU1 — GASTOS PERSONALES
// ═════════════════════════════════════════════════════

/**
 * @swagger
 * /gastos:
 *   get:
 *     summary: "[HU1] Historial de gastos del usuario autenticado"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: mes,          schema: { type: integer }, description: "Mes 1-12" }
 *       - { in: query, name: anio,         schema: { type: integer }, description: "Año ej. 2025" }
 *       - { in: query, name: categoria_id, schema: { type: integer } }
 *     responses:
 *       200: { description: Array de gastos }
 *       401: { description: No autenticado }
 */
app.get('/gastos', authMiddleware, async (req, res) => {
  try {
    const { mes, anio, categoria_id } = req.query;
    let sql = `
      SELECT g.*, c.nombre AS categoria_nombre, c.compartida
      FROM gastos g
      LEFT JOIN categorias c ON g.categoria_id = c.id
      WHERE g.grupo_id IS NULL AND g.usuario = $1
    `;
    const params = [req.usuario];
    let paramIndex = 2;
    if (mes) {
      sql += ` AND substring(g.fecha from 6 for 2) = $${paramIndex}`;
      params.push(String(mes).padStart(2, '0'));
      paramIndex++;
    }
    if (anio) {
      sql += ` AND substring(g.fecha from 1 for 4) = $${paramIndex}`;
      params.push(String(anio));
      paramIndex++;
    }
    if (categoria_id) {
      sql += ` AND g.categoria_id = $${paramIndex}`;
      params.push(categoria_id);
      paramIndex++;
    }
    sql += ` ORDER BY g.fecha DESC`;
    
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

/**
 * @swagger
 * /gastos/{id}:
 *   get:
 *     summary: "[HU1] Detalle de un gasto personal"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Detalle del gasto }
 *       404: { description: No encontrado }
 *       401: { description: No autenticado }
 */
app.get('/gastos/:id', authMiddleware, async (req, res) => {
  try {
    const g = await pool.query(`
      SELECT g.*, c.nombre AS categoria_nombre
      FROM gastos g LEFT JOIN categorias c ON g.categoria_id = c.id
      WHERE g.id = $1 AND g.usuario = $2 AND g.grupo_id IS NULL
    `, [req.params.id, req.usuario]);
    if (g.rows.length === 0) return res.status(404).json({ error: 'Gasto no encontrado.' });
    res.json(g.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

/**
 * @swagger
 * /gastos:
 *   post:
 *     summary: "[HU1] Registra un gasto personal"
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [monto, categoria_id, fecha]
 *             properties:
 *               monto:        { type: number,  example: 15000 }
 *               categoria_id: { type: integer, example: 1 }
 *               fecha:        { type: string,  example: "2025-05-20" }
 *               descripcion:  { type: string,  example: "Almuerzo de trabajo" }
 *               metodo_pago:  { type: string,  example: "Tarjeta de crédito" }
 *     responses:
 *       201: { description: Gasto registrado }
 *       400: { description: Datos inválidos }
 *       401: { description: No autenticado }
 */
app.post('/gastos', authMiddleware, async (req, res) => {
  try {
    const { monto, categoria_id, fecha, descripcion, metodo_pago } = req.body;

    const errMonto = validarMonto(monto);
    if (errMonto) return res.status(400).json({ error: errMonto });

    const errFecha = validarFecha(fecha);
    if (errFecha) return res.status(400).json({ error: errFecha });

    if (!categoria_id)
      return res.status(400).json({ error: 'La categoría es obligatoria.' });

    const checkCat = await pool.query('SELECT id FROM categorias WHERE id = $1', [categoria_id]);
    if (checkCat.rows.length === 0)
      return res.status(400).json({ error: 'La categoría indicada no existe.' });

    const r = await pool.query(`
      INSERT INTO gastos (monto, categoria_id, fecha, descripcion, metodo_pago, usuario)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [monto, categoria_id, fecha, descripcion || null, metodo_pago || null, req.usuario]);

    res.status(201).json({ id: r.rows[0].id, monto, categoria_id, fecha, descripcion: descripcion || null, metodo_pago: metodo_pago || null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

/**
 * @swagger
 * /gastos/{id}:
 *   put:
 *     summary: "[HU1] Modifica un gasto personal"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               monto:        { type: number }
 *               categoria_id: { type: integer }
 *               fecha:        { type: string }
 *               descripcion:  { type: string }
 *               metodo_pago:  { type: string }
 *     responses:
 *       200: { description: Gasto actualizado }
 *       400: { description: Datos inválidos }
 *       404: { description: No encontrado }
 *       401: { description: No autenticado }
 */
app.put('/gastos/:id', authMiddleware, async (req, res) => {
  try {
    const { monto, categoria_id, fecha, descripcion, metodo_pago } = req.body;

    const resGasto = await pool.query('SELECT * FROM gastos WHERE id = $1', [req.params.id]);
    const gasto = resGasto.rows[0];
    if (!gasto || gasto.usuario !== req.usuario || gasto.grupo_id !== null) {
      return res.status(404).json({ error: 'Gasto no encontrado.' });
    }

    const fieldsToUpdate = [];
    const params = [];
    let index = 1;

    if ('monto' in req.body) {
      const errMonto = validarMonto(monto);
      if (errMonto) return res.status(400).json({ error: errMonto });
      fieldsToUpdate.push(`monto = $${index}`);
      params.push(monto);
      index++;
    }

    if ('fecha' in req.body) {
      const errFecha = validarFecha(fecha);
      if (errFecha) return res.status(400).json({ error: errFecha });
      fieldsToUpdate.push(`fecha = $${index}`);
      params.push(fecha);
      index++;
    }

    if ('categoria_id' in req.body) {
      if (!categoria_id) {
        return res.status(400).json({ error: 'La categoría es obligatoria.' });
      }
      const checkCat = await pool.query('SELECT id FROM categorias WHERE id = $1', [categoria_id]);
      if (checkCat.rows.length === 0) {
        return res.status(400).json({ error: 'La categoría indicada no existe.' });
      }
      fieldsToUpdate.push(`categoria_id = $${index}`);
      params.push(categoria_id);
      index++;
    }

    if ('descripcion' in req.body) {
      fieldsToUpdate.push(`descripcion = $${index}`);
      params.push(descripcion === '' || descripcion === null ? null : descripcion);
      index++;
    }

    if ('metodo_pago' in req.body) {
      fieldsToUpdate.push(`metodo_pago = $${index}`);
      params.push(metodo_pago === '' || metodo_pago === null ? null : metodo_pago);
      index++;
    }

    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({ error: 'Debe enviar al menos un campo para actualizar.' });
    }

    params.push(req.params.id);
    await pool.query(`
      UPDATE gastos SET ${fieldsToUpdate.join(', ')} WHERE id = $${index}
    `, params);

    res.json({ mensaje: 'Gasto actualizado correctamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

/**
 * @swagger
 * /gastos/{id}:
 *   delete:
 *     summary: "[HU1] Elimina un gasto personal"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Gasto eliminado }
 *       404: { description: No encontrado }
 *       401: { description: No autenticado }
 */
app.delete('/gastos/:id', authMiddleware, async (req, res) => {
  try {
    const resGasto = await pool.query('SELECT * FROM gastos WHERE id = $1', [req.params.id]);
    const gasto = resGasto.rows[0];
    if (!gasto || gasto.usuario !== req.usuario || gasto.grupo_id !== null) {
      return res.status(404).json({ error: 'Gasto no encontrado.' });
    }

    await pool.query('DELETE FROM gastos WHERE id = $1', [req.params.id]);
    res.json({ mensaje: 'Gasto eliminado correctamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// ═════════════════════════════════════════════════════
// HU2 — GRUPOS FAMILIARES
// ═════════════════════════════════════════════════════

/**
 * @swagger
 * /grupos:
 *   get:
 *     summary: "[HU2] Lista todos los grupos familiares"
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Array de grupos }
 *       401: { description: No autenticado }
 */
app.get('/grupos', authMiddleware, async (req, res) => {
  try {
    const resGrupos = await pool.query('SELECT * FROM grupos');
    const grupos = resGrupos.rows;
    for (const g of grupos) {
      const resMiembros = await pool.query('SELECT usuario FROM grupo_miembros WHERE grupo_id = $1', [g.id]);
      g.miembros = resMiembros.rows.map(m => m.usuario);
    }
    res.json(grupos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

/**
 * @swagger
 * /grupos:
 *   post:
 *     summary: "[HU2] Crea un grupo familiar"
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre]
 *             properties:
 *               nombre: { type: string, example: "Familia García" }
 *     responses:
 *       201: { description: Grupo creado }
 *       400: { description: Nombre inválido o duplicado }
 *       401: { description: No autenticado }
 */
app.post('/grupos', authMiddleware, async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre || nombre.trim() === '')
      return res.status(400).json({ error: 'El nombre del grupo es obligatorio.' });
    
    const checkName = await pool.query('SELECT id FROM grupos WHERE nombre = $1', [nombre.trim()]);
    if (checkName.rows.length > 0)
      return res.status(400).json({ error: 'Ya existe un grupo con ese nombre.' });

    const r = await pool.query('INSERT INTO grupos (nombre) VALUES ($1) RETURNING id', [nombre.trim()]);
    const grupoId = r.rows[0].id;
    // El creador se agrega automáticamente como miembro
    await pool.query('INSERT INTO grupo_miembros (grupo_id, usuario) VALUES ($1, $2) ON CONFLICT (grupo_id, usuario) DO NOTHING', [grupoId, req.usuario]);
    res.status(201).json({ id: grupoId, nombre: nombre.trim(), miembros: [req.usuario] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

/**
 * @swagger
 * /grupos/{id}/miembros:
 *   post:
 *     summary: "[HU2] Agrega un miembro al grupo familiar"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [usuario]
 *             properties:
 *               usuario: { type: string, example: "maria" }
 *     responses:
 *       201: { description: Miembro agregado }
 *       400: { description: Ya es miembro }
 *       404: { description: Grupo no encontrado }
 *       401: { description: No autenticado }
 */
app.post('/grupos/:id/miembros', authMiddleware, async (req, res) => {
  try {
    const { usuario } = req.body;
    if (!usuario || usuario.trim() === '')
      return res.status(400).json({ error: 'El nombre de usuario es obligatorio.' });
    
    const checkG = await pool.query('SELECT id FROM grupos WHERE id = $1', [req.params.id]);
    if (checkG.rows.length === 0)
      return res.status(404).json({ error: 'Grupo no encontrado.' });
    
    try {
      await pool.query('INSERT INTO grupo_miembros (grupo_id, usuario) VALUES ($1, $2)', [req.params.id, usuario.trim()]);
      res.status(201).json({ mensaje: `Usuario "${usuario.trim()}" agregado al grupo.` });
    } catch (err) {
      res.status(400).json({ error: 'El usuario ya es miembro de este grupo.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// ═════════════════════════════════════════════════════
// HU2 — GASTOS FAMILIARES COMPARTIDOS
// ═════════════════════════════════════════════════════

/**
 * @swagger
 * /grupos/{id}/gastos:
 *   get:
 *     summary: "[HU2] Lista gastos compartidos del grupo — visibles para todos los miembros"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *       - { in: query, name: mes,  schema: { type: integer } }
 *       - { in: query, name: anio, schema: { type: integer } }
 *     responses:
 *       200: { description: Array de gastos del grupo }
 *       403: { description: No eres miembro de este grupo }
 *       404: { description: Grupo no encontrado }
 *       401: { description: No autenticado }
 */
app.get('/grupos/:id/gastos', authMiddleware, async (req, res) => {
  try {
    const checkG = await pool.query('SELECT id FROM grupos WHERE id = $1', [req.params.id]);
    if (checkG.rows.length === 0)
      return res.status(404).json({ error: 'Grupo no encontrado.' });

    const esMiembroRes = await pool.query('SELECT id FROM grupo_miembros WHERE grupo_id = $1 AND usuario = $2', [req.params.id, req.usuario]);
    if (esMiembroRes.rows.length === 0)
      return res.status(403).json({ error: 'No eres miembro de este grupo.' });

    const { mes, anio } = req.query;
    let sql = `
      SELECT g.*, c.nombre AS categoria_nombre, c.compartida, g.usuario AS registrado_por
      FROM gastos g
      LEFT JOIN categorias c ON g.categoria_id = c.id
      WHERE g.grupo_id = $1
    `;
    const params = [req.params.id];
    let paramIndex = 2;
    if (mes) {
      sql += ` AND substring(g.fecha from 6 for 2) = $${paramIndex}`;
      params.push(String(mes).padStart(2, '0'));
      paramIndex++;
    }
    if (anio) {
      sql += ` AND substring(g.fecha from 1 for 4) = $${paramIndex}`;
      params.push(String(anio));
      paramIndex++;
    }
    sql += ` ORDER BY g.fecha DESC`;

    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

/**
 * @swagger
 * /grupos/{id}/gastos:
 *   post:
 *     summary: "[HU2] Registra un gasto del hogar en el grupo familiar"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [monto, categoria_id, fecha]
 *             properties:
 *               monto:        { type: number,  example: 80000 }
 *               categoria_id: { type: integer, example: 6, description: "Debe ser categoría compartida" }
 *               fecha:        { type: string,  example: "2025-05-20" }
 *               descripcion:  { type: string,  example: "Cuenta de luz mayo" }
 *               metodo_pago:  { type: string,  example: "Transferencia" }
 *     responses:
 *       201: { description: Gasto compartido registrado }
 *       400: { description: Datos inválidos o categoría no compartida }
 *       403: { description: No eres miembro del grupo }
 *       404: { description: Grupo no encontrado }
 *       401: { description: No autenticado }
 */
app.post('/grupos/:id/gastos', authMiddleware, async (req, res) => {
  try {
    const { monto, categoria_id, fecha, descripcion, metodo_pago } = req.body;

    const checkG = await pool.query('SELECT id FROM grupos WHERE id = $1', [req.params.id]);
    if (checkG.rows.length === 0)
      return res.status(404).json({ error: 'Grupo no encontrado.' });

    const esMiembroRes = await pool.query('SELECT id FROM grupo_miembros WHERE grupo_id = $1 AND usuario = $2', [req.params.id, req.usuario]);
    if (esMiembroRes.rows.length === 0)
      return res.status(403).json({ error: 'No eres miembro de este grupo.' });

    const errMonto = validarMonto(monto);
    if (errMonto) return res.status(400).json({ error: errMonto });

    const errFecha = validarFecha(fecha);
    if (errFecha) return res.status(400).json({ error: errFecha });

    if (!categoria_id)
      return res.status(400).json({ error: 'La categoría es obligatoria.' });

    const catRes = await pool.query('SELECT * FROM categorias WHERE id = $1', [categoria_id]);
    const categoria = catRes.rows[0];
    if (!categoria)
      return res.status(400).json({ error: 'La categoría indicada no existe.' });

    const r = await pool.query(`
      INSERT INTO gastos (monto, categoria_id, fecha, descripcion, metodo_pago, grupo_id, usuario)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `, [monto, categoria_id, fecha, descripcion || null, metodo_pago || null, req.params.id, req.usuario]);

    res.status(201).json({
      id: r.rows[0].id,
      monto,
      categoria_id,
      categoria_nombre: categoria.nombre,
      fecha,
      descripcion: descripcion || null,
      metodo_pago: metodo_pago || null,
      grupo_id: Number(req.params.id),
      registrado_por: req.usuario,
      visible_para_grupo: true
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

/**
 * @swagger
 * /grupos/{id}/gastos/{gastoId}:
 *   delete:
 *     summary: "[HU2] Elimina un gasto compartido del grupo"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id,      required: true, schema: { type: integer } }
 *       - { in: path, name: gastoId, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Gasto eliminado }
 *       403: { description: No eres miembro del grupo }
 *       404: { description: No encontrado }
 *       401: { description: No autenticado }
 */
app.delete('/grupos/:id/gastos/:gastoId', authMiddleware, async (req, res) => {
  try {
    const checkG = await pool.query('SELECT id FROM grupos WHERE id = $1', [req.params.id]);
    if (checkG.rows.length === 0)
      return res.status(404).json({ error: 'Grupo no encontrado.' });

    const esMiembroRes = await pool.query('SELECT id FROM grupo_miembros WHERE grupo_id = $1 AND usuario = $2', [req.params.id, req.usuario]);
    if (esMiembroRes.rows.length === 0)
      return res.status(403).json({ error: 'No eres miembro de este grupo.' });

    const i = await pool.query('DELETE FROM gastos WHERE id = $1 AND grupo_id = $2', [req.params.gastoId, req.params.id]);
    if (i.rowCount === 0) return res.status(404).json({ error: 'Gasto no encontrado en este grupo.' });
    res.json({ mensaje: 'Gasto compartido eliminado.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

const PORT = process.env.PORT || 3000;
async function startServer() {
  try {
    await initDB();
    app.listen(PORT, () => console.log(`API Gastos v2 en http://localhost:${PORT}`));
  } catch (error) {
    console.error('Error al inicializar la base de datos o el servidor:', error);
    process.exit(1);
  }
}
startServer();