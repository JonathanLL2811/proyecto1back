const express = require('express');
const multer = require('multer');
const pool = require('./conexion');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Obtener todas las publicaciones
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tbl_publicaciones');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear una nueva publicación con imagen
router.post('/', upload.single('foto'), async (req, res) => {
  try {
    const { descripcion, nombre_usuario } = req.body;
    const foto = req.file ? req.file.buffer : null;
    const nombre_foto = req.file ? req.file.originalname : null;
    const mime_type = req.file ? req.file.mimetype : null;

    const query = `
      INSERT INTO tbl_publicaciones (descripcion, nombre_usuario, foto, nombre_foto, mime_type)
      VALUES ($1, $2, $3, $4, $5) RETURNING *;
    `;
    const values = [descripcion, nombre_usuario, foto, nombre_foto, mime_type];
    const result = await pool.query(query, values);
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
