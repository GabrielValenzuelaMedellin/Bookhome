const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const path = require("path"); // <-- Asegúrate de agregar esta línea
const multer = require("multer");
const session = require("express-session"); 
const app = express();

const port = 3000;

// Configuración de Multer para almacenar imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads"); // Asegúrate de tener la carpeta 'uploads'
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Nombre único basado en la fecha
    }
});
const upload = multer({ storage: storage });

const connection = mysql.createConnection({
  host: process.env.DB_HOST,        // Usamos la variable de entorno para el host
  user: process.env.DB_USER,        // Usamos la variable de entorno para el usuario
  password: process.env.DB_PASS,    // Usamos la variable de entorno para la contraseña
  database: process.env.DB_NAME     // Usamos la variable de entorno para el nombre de la base de datos
});

con.connect((err) => {
    if (err) {
        console.error("Error al conectar", err);
        return;
    }
    console.log("Conectado a la base de datos");
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Configurar la sesión
app.use(session({
    secret: 'clave_secreta', // Clave secreta para firmar la cookie
    resave: false,            // No reescribir la sesión si no ha cambiado
    saveUninitialized: true,  // Guardar la sesión incluso si no hay datos
    cookie: { secure: false } // Desactivar 'secure' en desarrollo (cambiar a true en producción)
}));

// CRUD Usuarios
// CRUD Usuarios
app.get('/verificarUsuario', (req, res) => {
    const { email, nombre } = req.query;
    con.query('SELECT email, nombre FROM Usuarios WHERE email = ? OR nombre = ?', [email, nombre], (error, results) => {
        if (error) throw error;
        const emailExistente = results?.some(row => row.email === email) || false;
        const nombreExistente = results?.some(row => row.nombre === nombre) || false;

        res.json({ emailExistente, nombreExistente });
    });
});

app.post('/agregarUsuario', (req, res) => {
    const { nombre, telefono, email, password } = req.body;

    con.query('INSERT INTO Usuarios (nombre, telefono, email, contrasena) VALUES (?, ?, ?, ?)', [nombre, telefono, email, password], (error, results) => {
        if (error) {
            console.log("Error al registrar el usuario:", error);
            return res.status(500).send('Error en el registro');
        }

        const userId = results.insertId;
        req.session.userId = userId;
        req.session.username = nombre;

        console.log("Sesión guardada tras registro:", req.session);

        res.status(200).json({
            authenticated: true,
            message: 'Usuario registrado y sesión iniciada correctamente'
        });
    });
});

app.post('/iniciarSesion', (req, res) => {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    con.query('SELECT * FROM Usuarios WHERE email = ?', [normalizedEmail], (error, results) => {
        if (error) throw error;

        if (results.length > 0) {
            const user = results[0];

            if (user.contrasena === password) {
                req.session.userId = user.id_usuario;
                req.session.username = user.nombre;

                console.log("Sesión iniciada:", req.session);
                res.json({ authenticated: true });
            } else {
                res.json({ authenticated: false, message: 'Contraseña incorrecta' });
            }
        } else {
            res.json({ authenticated: false, message: 'Correo electrónico no registrado' });
        }
    });
});

app.get('/usuario', (req, res) => {
    console.log("Sesión actual:", req.session);
    if (req.session.userId) {
        res.json({ userId: req.session.userId, username: req.session.username });
    } else {
        res.status(401).json({ message: 'No autenticado' });
    }
});

app.get('/logout', (req, res) => {
    console.log("Antes de cerrar sesión:", req.session);

    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Error al cerrar la sesión');
        }
        res.clearCookie('connect.sid');
        console.log("Después de cerrar sesión:", req.session);
        res.send('Sesión cerrada');
    });
});

// CRUD Propiedades
// Endpoint para agregar propiedad con imágenes
app.post('/agregarPropiedad', upload.array('imagenes[]', 5), (req, res) => {
    const {
        id_usuario,
        tipo,
        tipo_propiedad,
        precio,
        descripcion,
        metros_cuadrados,
        habitaciones,
        banos,
        calle,
        numero_exterior,
        numero_interior,
        colonia,
        codigo_postal,
        delegacion
    } = req.body;

    // Insertar la propiedad
    con.query('INSERT INTO Propiedades (id_usuario, estado_propiedad, tipo_propiedad, precio, descripcion, metros_cuadrados, habitaciones, banos) VALUES (?,?,?,?,?,?,?,?)',
        [id_usuario, tipo, tipo_propiedad, precio, descripcion, metros_cuadrados, habitaciones, banos], (err, result) => {
            if (err) {
                console.log("Error al insertar propiedad", err);
                return res.status(500).send("Error al insertar propiedad");
            }

            const id_propiedad = result.insertId;  // Obtener el ID de la propiedad recién insertada

            // Insertar la dirección
            con.query('INSERT INTO Direcciones (id_propiedad, calle, numero_exterior, numero_interior, colonia, codigo_postal, delegacion) VALUES (?,?,?,?,?,?,?)',
                [id_propiedad, calle, numero_exterior, numero_interior, colonia, codigo_postal, delegacion], (err) => {
                    if (err) {
                        console.log("Error al insertar dirección", err);
                        return res.status(500).send("Error al insertar dirección");
                    }

                    // Subir imágenes a la base de datos
                    if (req.files) {
                        req.files.forEach(file => {
                            con.query('INSERT INTO Fotos (id_propiedad, url) VALUES (?, ?)', [id_propiedad, file.path], (err) => {
                                if (err) {
                                    console.log("Error al insertar foto", err);
                                    return res.status(500).send("Error al insertar fotos");
                                }
                            });
                        });
                    }

                    return res.send("Propiedad, dirección y fotos agregadas correctamente");
                });
        });
});
app.get('/obtenerPropiedades', (req, res) => {
    const query = `
        SELECT 
            p.id_propiedad, 
            p.id_usuario,
            p.estado_propiedad,
            p.tipo_propiedad, 
            p.precio, 
            p.descripcion, 
            p.metros_cuadrados, 
            p.habitaciones, 
            p.banos,
            d.calle, 
            d.numero_exterior, 
            d.numero_interior, 
            d.colonia, 
            d.codigo_postal, 
            d.delegacion,
            f.url AS url_imagen
        FROM Propiedades p
        JOIN Direcciones d ON p.id_propiedad = d.id_propiedad
        LEFT JOIN Fotos f ON p.id_propiedad = f.id_propiedad
    `;

    con.query(query, (err, propiedades) => {
        if (err) {
            console.log("Error al obtener propiedades", err);
            return res.status(500).send("Error al obtener propiedades");
        }

        // Asegurémonos de que las URLs estén bien formateadas
        propiedades = propiedades.map(propiedad => {
            // Si la URL de la imagen está presente, nos aseguramos de que sea accesible desde el frontend
            const imagenUrl = propiedad.url_imagen 
                ? `/uploads/${path.basename(propiedad.url_imagen)}`  // Usamos el valor de 'url_imagen' correctamente
                : '/uploads/default.jpg';  // Si no hay imagen, usamos una predeterminada

            return {
                ...propiedad,
                url_imagen: imagenUrl  // Aquí se asigna la URL correctamente formateada para la imagen
            };
        });

        console.log("Propiedades con URLs formateadas:", propiedades);  // Verifica las URLs en la consola

        return res.json(propiedades);
    });
});

app.get('/obtenerDetallesPropiedad', (req, res) => {
    const { id } = req.query; // Extraer el ID de la propiedad desde la URL

    if (!id) {
        return res.status(400).json({ message: "ID de la propiedad es requerido" });
    }

    const query = `
        SELECT 
            p.id_propiedad,
            p.estado_propiedad, 
            p.tipo_propiedad, 
            p.precio, 
            p.descripcion, 
            p.metros_cuadrados, 
            p.habitaciones, 
            p.banos, 
            d.calle, 
            d.numero_exterior, 
            d.numero_interior, 
            d.colonia, 
            d.codigo_postal, 
            d.delegacion,
            f.url AS url_imagen,
            u.nombre AS vendedor_nombre,
            u.telefono AS vendedor_telefono
        FROM Propiedades p
        JOIN Direcciones d ON p.id_propiedad = d.id_propiedad
        LEFT JOIN Fotos f ON p.id_propiedad = f.id_propiedad
        JOIN Usuarios u ON p.id_usuario = u.id_usuario
        WHERE p.id_propiedad = ?
    `;

    con.query(query, [id], (err, results) => {
        if (err) {
            console.error("Error al obtener detalles de la propiedad:", err);
            return res.status(500).json({ message: "Error en el servidor" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Propiedad no encontrada" });
        }

        // Obtener todas las imágenes
        const propiedad = {
            ...results[0],  // Información básica de la propiedad
            fotos: results.map(row => `/uploads/${path.basename(row.url_imagen)}`)  // Agrupar todas las imágenes en un array
        };

        res.json(propiedad);
    });
});






app.put('/actualizarPropiedad/:id', (req, res) => {
    const id_propiedad = req.params.id;
    const {
        tipo,
        tipo_propiedad,
        precio,
        descripcion,
        metros_cuadrados,
        habitaciones,
        banos,
        calle,
        numero_exterior,
        numero_interior,
        colonia,
        codigo_postal,
        delegacion
    } = req.body;

    // Actualizar la propiedad
    con.query('UPDATE Propiedades SET estado_propiedad = ? tipo_propiedad = ?, precio = ?, descripcion = ?, metros_cuadrados = ?, habitaciones = ?, banos = ? WHERE id_propiedad = ?', 
    [tipo, tipo_propiedad, precio, descripcion, metros_cuadrados, habitaciones, banos, id_propiedad], (err) => {
        if (err) {
            console.log("Error al actualizar propiedad", err);
            return res.status(500).send("Error al actualizar propiedad");
        }

        // Actualizar la dirección
        con.query('UPDATE Direcciones SET calle = ?, numero_exterior = ?, numero_interior = ?, colonia = ?, codigo_postal = ?, delegacion = ? WHERE id_propiedad = ?', 
        [calle, numero_exterior, numero_interior, colonia, codigo_postal, delegacion, id_propiedad], (err) => {
            if (err) {
                console.log("Error al actualizar dirección", err);
                return res.status(500).send("Error al actualizar dirección");
            }
            return res.send("Propiedad y dirección actualizadas correctamente");
        });
    });
});

app.delete('/eliminarPropiedad/:id', (req, res) => {
    const id_propiedad = req.params.id;

    // Eliminar las fotos asociadas a la propiedad
    con.query('DELETE FROM Fotos WHERE id_propiedad = ?', [id_propiedad], (err) => {
        if (err) {
            console.log("Error al eliminar fotos", err);
            return res.status(500).send("Error al eliminar fotos");
        }

        // Eliminar la dirección
        con.query('DELETE FROM Direcciones WHERE id_propiedad = ?', [id_propiedad], (err) => {
            if (err) {
                console.log("Error al eliminar dirección", err);
                return res.status(500).send("Error al eliminar dirección");
            }

            // Eliminar la propiedad
            con.query('DELETE FROM Propiedades WHERE id_propiedad = ?', [id_propiedad], (err) => {
                if (err) {
                    console.log("Error al eliminar propiedad", err);
                    return res.status(500).send("Error al eliminar propiedad");
                }
                return res.send("Propiedad, dirección y fotos eliminadas correctamente");
            });
        });
    });
});

app.post('/agregarFoto', (req, res) => {
    const { id_propiedad, url } = req.body;

    // Insertar la foto en la base de datos
    con.query('INSERT INTO Fotos (id_propiedad, url) VALUES (?, ?)', [id_propiedad, url], (err) => {
        if (err) {
            console.log("Error al agregar foto", err);
            return res.status(500).send("Error al agregar foto");
        }
        return res.send("Foto agregada correctamente");
    });
});


// Búsqueda de propiedades con filtros
app.get('/buscarPropiedades', (req, res) => {
    const { precio_min, precio_max, colonia, tipo_propiedad } = req.query;

    const condiciones = [];
    const valores = [];

    if (precio_min) {
        condiciones.push('precio >= ?');
        valores.push(precio_min);
    }
    if (precio_max) {
        condiciones.push('precio <= ?');
        valores.push(precio_max);
    }
    if (colonia) {
        condiciones.push('colonia LIKE ?');
        valores.push(`%${colonia}%`);
    }
    if (tipo_propiedad) {
        condiciones.push('tipo_propiedad = ?');
        valores.push(tipo_propiedad);
    }

    const consulta = `
        SELECT * FROM Propiedades
        ${condiciones.length > 0 ? 'WHERE ' + condiciones.join(' AND ') : ''}
    `;

    con.query(consulta, valores, (err, propiedades) => {
        if (err) {
            console.error("Error al buscar propiedades", err);
            return res.status(500).send("Error al buscar propiedades");
        }
        res.json(propiedades);
    });
});



// CRUD Reseñas y Valoraciones
app.post('/agregarResena', (req, res) => {
    const { id_usuario, id_propiedad, comentario, calificacion } = req.body;
    con.query('INSERT INTO Reseñas (id_usuario, id_propiedad, comentario, calificacion) VALUES (?, ?, ?, ?)', [id_usuario, id_propiedad, comentario, calificacion], (err) => {
        if (err) {
            console.log("Error al insertar reseña", err);
            return res.status(500).send("Error al insertar reseña");
        }
        return res.send("Reseña agregada correctamente");
    });
});

app.get('/obtenerResenas', (req, res) => {
    con.query('SELECT * FROM Reseñas', (err, resenas) => {
        if (err) {
            console.log("Error al obtener reseñas", err);
            return res.status(500).send("Error al obtener reseñas");
        }
        return res.json(resenas);
    });
});

app.post('/borrarResena', (req, res) => {
    const { id_resena } = req.body;
    con.query('DELETE FROM Reseñas WHERE id_resena = ?', [id_resena], (err, resultado) => {
        if (err) {
            console.error('Error al borrar la reseña:', err);
            return res.status(500).send("Error al borrar la reseña");
        }
        if (resultado.affectedRows === 0) {
            return res.status(404).send("Reseña no encontrada");
        }
        return res.send(`Reseña con ID ${id_resena} borrada correctamente`);
    });
});

app.post('/actualizarResena', (req, res) => {
    const { id_resena, nuevo_comentario, nueva_calificacion } = req.body;
    con.query('UPDATE Reseñas SET comentario = ?, calificacion = ? WHERE id_resena = ?', [nuevo_comentario, nueva_calificacion, id_resena], (err, resultado) => {
        if (err) {
            console.error('Error al actualizar la reseña:', err);
            return res.status(500).send("Error al actualizar la reseña");
        }
        if (resultado.affectedRows === 0) {
            return res.status(404).send("Reseña no encontrada");
        }
        return res.send(`Reseña con ID ${id_resena} actualizada correctamente`);
    });
});

// Servir archivos estáticos de la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para la página de inicio de sesión (cuando accedas a la raíz, muestra el inicio de sesión)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'inicio.html'));  // Muestra inicio.html cuando accedes a '/'
});

// Otras rutas de tu aplicación
app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/nosotros', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'nosotros.html'));
});

app.get('/comprar', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'comprar.html'));
});

app.get('/vender', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'vender.html'));
});


// Puerto para escuchar
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:3000`);
});
