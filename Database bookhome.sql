CREATE DATABASE IF NOT EXISTS homebook;
USE homebook;

-- Tabla Usuarios
CREATE TABLE Usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL,
    telefono VARCHAR(10) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    contrasena CHAR(16) NOT NULL
);
/*drop database homebook;*/
-- Tabla Propiedades
CREATE TABLE Propiedades (
    id_propiedad INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    tipo_propiedad ENUM('casa', 'departamento') NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    descripcion TEXT,
    metros_cuadrados DECIMAL(5, 2),
    habitaciones INT,
    banos INT,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);

-- Tabla Ubicaciones (sin redundancia con propiedades)
CREATE TABLE Ubicaciones (
    id_ubicacion INT AUTO_INCREMENT PRIMARY KEY,
    id_propiedad INT NOT NULL,
    colonia VARCHAR(100) NOT NULL,
    delegacion VARCHAR(100) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    FOREIGN KEY (id_propiedad) REFERENCES Propiedades(id_propiedad)
);

-- Tabla Caracteristicas
CREATE TABLE Caracteristicas (
    id_caracteristica INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

-- Tabla Propiedad_Caracteristicas (relación muchos a muchos)
CREATE TABLE Propiedad_Caracteristicas (
    id_propiedad INT NOT NULL,
    id_caracteristica INT NOT NULL,
    PRIMARY KEY (id_propiedad, id_caracteristica),
    FOREIGN KEY (id_propiedad) REFERENCES Propiedades(id_propiedad),
    FOREIGN KEY (id_caracteristica) REFERENCES Caracteristicas(id_caracteristica)
);

-- Tabla Fotos
CREATE TABLE Fotos (
    id_foto INT AUTO_INCREMENT PRIMARY KEY,
    id_propiedad INT NOT NULL,
    url VARCHAR(255) NOT NULL,
    FOREIGN KEY (id_propiedad) REFERENCES Propiedades(id_propiedad)
);

-- Tabla Reseñas
CREATE TABLE Resenas (
    id_resena INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_propiedad INT NOT NULL,
    comentario TEXT,
    calificacion INT CHECK (calificacion BETWEEN 1 AND 5),
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario),
    FOREIGN KEY (id_propiedad) REFERENCES Propiedades(id_propiedad)
);
SELECT * FROM Usuarios;
select * from Propiedades;