const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const pool = require('./conexion');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Obtener todas las publicaciones
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tbl_publicaciones');
    const publicaciones = result.rows.map(pub => ({
      ...pub,
      foto: pub.foto ? pub.foto.toString('base64') : null // Convertir buffer a base64 si existe
    }));
    res.json(publicaciones);
  } catch (error) {
    console.error('Error al obtener publicaciones:', error);
    res.status(500).json({ error: error.message });
  }
});

// Crear una nueva publicación con imagen
router.post('/', upload.single('foto'), async (req, res) => {
  try {
    const { descripcion, nombre_usuario } = req.body;
    const fotoBuffer = req.file ? req.file.buffer : null;
    const nombre_foto = req.file ? req.file.originalname : null;
    const mime_type = req.file ? req.file.mimetype : null;

    if (fotoBuffer) {
      const resizedBuffer = await sharp(fotoBuffer)
        .resize({ width: 300 }) // Ajusta el ancho según tus necesidades
        .toBuffer();

      const query = `
        INSERT INTO tbl_publicaciones (descripcion, nombre_usuario, foto, nombre_foto, mime_type)
        VALUES ($1, $2, $3::BYTEA, $4, $5) RETURNING *;
      `;
      const values = [descripcion, nombre_usuario, resizedBuffer, nombre_foto, mime_type];
      const result = await pool.query(query, values);

      res.json(result.rows[0]);
    } else {
      res.status(400).json({ error: 'No se proporcionó una imagen' });
    }
  } catch (error) {
    console.error('Error al crear publicación:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

