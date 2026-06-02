const express = require('express');
const db      = require('./db');
const app     = express();

app.use(express.json());

// GET /cursos
app.get('/cursos', (req, res) => {
  const cursos = db.prepare('SELECT * FROM cursos').all();
  res.json(cursos);
});

// POST /cursos
app.post('/cursos', (req, res) => {
  const { nombre, instructor, creditos } = req.body;
  const result = db.prepare(
    'INSERT INTO cursos (nombre, instructor, creditos) VALUES (?, ?, ?)'
  ).run(nombre, instructor, creditos);
  res.status(201).json({ id: result.lastInsertRowid, nombre, instructor, creditos });
});

// PUT /cursos/:id
app.put('/cursos/:id', (req, res) => {
  const { nombre, instructor, creditos } = req.body;
  const info = db.prepare(
    'UPDATE cursos SET nombre=?, instructor=?, creditos=? WHERE id=?'
  ).run(nombre, instructor, creditos, req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Curso no encontrado' });
  res.json({ mensaje: 'Curso actualizado' });
});

// DELETE /cursos/:id
app.delete('/cursos/:id', (req, res) => {
  const info = db.prepare('DELETE FROM cursos WHERE id=?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Curso no encontrado' });
  res.json({ mensaje: 'Curso eliminado' });
});

app.listen(3000, () => {
  console.log('API corriendo en http://localhost:3000');
});