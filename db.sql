-- Active: 1717892304154@@127.0.0.1@5432@redsocial
-- Crear la tabla tbl_usuario
CREATE TABLE tbl_usuario (
    nombre_usuario VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(200),
    apellido VARCHAR(200),
    correo VARCHAR(100),
    contrasena VARCHAR(20),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT true,
    imagen BYTEA
);

-- Crear la tabla tbl_publicaciones
CREATE TABLE tbl_publicaciones (
    id_publicacion SERIAL PRIMARY KEY,
    descripcion VARCHAR(200),
    nombre_usuario VARCHAR(20),
    foto BYTEA,
    nombre_foto VARCHAR(500),
    mime_type VARCHAR(500),
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT true,
    CONSTRAINT fk_usuario
      FOREIGN KEY(nombre_usuario) 
      REFERENCES tbl_usuario(nombre_usuario)
);
select * from tbl_usuario