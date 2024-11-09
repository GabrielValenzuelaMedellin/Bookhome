const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const path = require("path"); // <-- Asegúrate de agregar esta línea
const app = express();


const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'n0m3l0',
    database: 'homebook'
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

// CRUD Usuarios
app.get('/verificarUsuario', (req, res) => {
    const { email, nombre } = req.query;
    con.query('SELECT email, nombre FROM Usuarios WHERE email = ? OR nombre = ?', [email, nombre], (error, results) => {
        if (error) throw error;
        const emailExistente = results.some(row => row.email === email);
        const nombreExistente = results.some(row => row.nombre === nombre);
        res.json({ emailExistente, nombreExistente });
    });
});

app.post('/agregarUsuario', (req, res) => {
    const { nombre, telefono, email, password } = req.body;
    con.query('INSERT INTO Usuarios (nombre, telefono, email, contrasena) VALUES (?, ?, ?)', [nombre, telefono, email, password], (error, results) => {
        if (error) res.status(500).send('Error en el registro');
        else res.status(200).send('Usuario registrado correctamente');
    });
});

app.post('/iniciarSesion', (req, res) => {
    const { email, password } = req.body;

    // Normalizar el correo a minúsculas (no sensible a mayúsculas)
    const normalizedEmail = email.toLowerCase();

    // Realizar la consulta para verificar el usuario
    con.query('SELECT * FROM Usuarios WHERE email = ?', [normalizedEmail], (error, results) => {
        if (error) throw error;

        if (results.length > 0) {
            const user = results[0];

            // Comparar la contraseña ingresada con la almacenada (respeta mayúsculas y minúsculas)
            if (user.contrasena === password) {
                res.json({ authenticated: true });
            } else {
                res.json({ authenticated: false, message: 'Contraseña incorrecta' });
            }
        } else {
            res.json({ authenticated: false, message: 'Correo electrónico no registrado' });
        }
    });
});



app.get('/obtenerUsuarios', (req, res) => {
    con.query('SELECT * FROM Usuarios', (err, usuarios) => {
        if (err) {
            console.log("Error al obtener usuarios", err);
            return res.status(500).send("Error al obtener usuarios");
        }
        return res.json(usuarios);
    });
});

// CRUD Propiedades
app.post('/agregarPropiedad', (req, res) => {
    const { id_usuario, tipo_propiedad, precio, descripcion, metros_cuadrados, habitaciones, banos } = req.body;
    con.query('INSERT INTO Propiedades (id_usuario, tipo_propiedad, precio, descripcion, metros_cuadrados, habitaciones, banos) VALUES (?,?,?,?,?,?,?)', 
    [id_usuario, tipo_propiedad, precio, descripcion, metros_cuadrados, habitaciones, banos], (err) => {
        if (err) {
            console.log("Error al insertar propiedad", err);
            return res.status(500).send("Error al insertar propiedad");
        }
        return res.send("Propiedad agregada correctamente");
    });
});

app.get('/obtenerPropiedades', (req, res) => {
    con.query('SELECT * FROM Propiedades', (err, propiedades) => {
        if (err) {
            console.log("Error al obtener propiedades", err);
            return res.status(500).send("Error al obtener propiedades");
        }
        return res.json(propiedades);
    });
});

// Búsqueda de propiedades con filtros
app.get('/buscarPropiedades', (req, res) => {
    const { ubicacion, tipo_propiedad, precio_min, precio_max, habitaciones, banos } = req.query;
    const query = `
        SELECT * FROM Propiedades 
        WHERE (ubicacion = ? OR ? IS NULL) 
        AND (tipo_propiedad = ? OR ? IS NULL) 
        AND (precio >= ? OR ? IS NULL) 
        AND (precio <= ? OR ? IS NULL) 
        AND (habitaciones = ? OR ? IS NULL) 
        AND (banos = ? OR ? IS NULL)
    `;
    con.query(query, [ubicacion, ubicacion, tipo_propiedad, tipo_propiedad, precio_min, precio_min, precio_max, precio_max, habitaciones, habitaciones, banos, banos], (err, propiedades) => {
        if (err) {
            console.error("Error al buscar propiedades:", err);
            return res.status(500).send("Error al buscar propiedades");
        }
        return res.json(propiedades);
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
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
