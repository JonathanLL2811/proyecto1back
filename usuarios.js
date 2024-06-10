const express = require('express');
const multer = require('multer');
const pool = require('./conexion');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tbl_usuario');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Crear un nuevo usuario con imagen
router.post('/', upload.single('imagen'), async (req, res) => {
  try {
    const { nombre_usuario, nombre, apellido, correo, contrasena } = req.body;
    const imagen = req.file ? req.file.buffer : null;

    const query = `
      INSERT INTO tbl_usuario (nombre_usuario, nombre, apellido, correo, contrasena, imagen)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
    `;
    const values = [nombre_usuario, nombre, apellido, correo, contrasena, imagen];
    const result = await pool.query(query, values);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

module.exports = router;
