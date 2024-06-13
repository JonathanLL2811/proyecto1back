const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const pool = require('./conexion'); // Verifica que la ruta sea correcta
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

// Obtener publicaciones y datos del usuario, incluyendo comentarios
router.get('/usuario/:nombre_usuario', async (req, res) => {
  const { nombre_usuario } = req.params;

  try {
    // Obtener datos del usuario
    const userResult = await pool.query('SELECT * FROM tbl_usuario WHERE nombre_usuario = $1', [nombre_usuario]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const usuario = userResult.rows[0];

    // Obtener publicaciones del usuario
    const publicacionesResult = await pool.query('SELECT * FROM tbl_publicaciones WHERE nombre_usuario = $1', [nombre_usuario]);
    const publicaciones = await Promise.all(publicacionesResult.rows.map(async pub => {
      const comentariosResult = await pool.query('SELECT * FROM tbl_comentarios WHERE id_publicacion = $1', [pub.id_publicacion]);
      return {
        ...pub,
        foto: pub.foto ? pub.foto.toString('base64') : null, // Convertir buffer a base64 si existe
        comentarios: comentariosResult.rows
      };
    }));

    res.json({
      usuario,
      publicaciones
    });
  } catch (error) {
    console.error('Error al obtener publicaciones y datos del usuario:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener todas las publicaciones de un usuario
router.get('/usuario/:nombre_usuario/publicaciones', async (req, res) => {
  const { nombre_usuario } = req.params;

  try {
    const result = await pool.query('SELECT * FROM tbl_publicaciones WHERE nombre_usuario = $1', [nombre_usuario]);
    const publicaciones = result.rows.map(pub => ({
      ...pub,
      foto: pub.foto ? pub.foto.toString('base64') : null // Convertir buffer a base64 si existe
    }));
    res.json(publicaciones);
  } catch (error) {
    console.error('Error al obtener las publicaciones del usuario:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener comentarios de una publicación
router.get('/:id_publicacion/comentarios', async (req, res) => {
  const { id_publicacion } = req.params;

  try {
    const result = await pool.query('SELECT * FROM tbl_comentarios WHERE id_publicacion = $1', [id_publicacion]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    res.status(500).json({ error: error.message });
  }
});

// Crear un nuevo comentario
router.post('/:id_publicacion/comentarios', async (req, res) => {
  const { id_publicacion } = req.params;
  const { nombre_usuario, comentario } = req.body;

  try {
    const query = `
      INSERT INTO tbl_comentarios (id_publicacion, nombre_usuario, comentario)
      VALUES ($1, $2, $3) RETURNING *;
    `;
    const values = [id_publicacion, nombre_usuario, comentario];
    const result = await pool.query(query, values);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear comentario:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

