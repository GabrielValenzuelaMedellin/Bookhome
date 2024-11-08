const container = document.querySelector(".container");
const btnSignIn = document.getElementById("btn-sign-in");
const btnSignUp = document.getElementById("btn-sign-up");
const formSignIn = document.querySelector(".sign-in");
const formSignUp = document.querySelector(".sign-up");

// Funciones de validación
function validateName(name) {
    const regex = /^[a-zA-Z\s]{1,30}$/;
    return regex.test(name);
}

function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return regex.test(email);
}

function validatePassword(password) {
    const regex = /^[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]{8,16}$/;
    return regex.test(password);
}

function showAlert(icon, title, text) {
    document.body.style.overflow = 'hidden';
    Swal.fire({
        icon: icon,
        title: title,
        text: text,
        confirmButtonColor: '#3AB397',
    }).then(() => {
        document.body.style.overflow = 'auto';
    });
}

// Función para verificar que los campos no estén vacíos ni contengan solo espacios
function isEmptyOrSpaces(str) {
    return str.trim().length === 0;
}

// Registro con validación de nombre y correo únicos
formSignUp.addEventListener("submit", function (e) {
    e.preventDefault();
    const name = formSignUp.querySelector('input[placeholder="Nombre"]').value.trim();
    const email = formSignUp.querySelector('input[placeholder="Email"]').value.trim();
    const password = formSignUp.querySelector('input[placeholder="Contraseña"]').value.trim();
    const confirmPassword = formSignUp.querySelector('input[placeholder="Confirmar Contraseña"]').value.trim();

    // Verificar que no haya campos vacíos o solo con espacios
    if (isEmptyOrSpaces(name) || isEmptyOrSpaces(email) || isEmptyOrSpaces(password) || isEmptyOrSpaces(confirmPassword)) {
        showAlert('error', 'Campos vacíos', 'Por favor, llene todos los campos sin dejar espacios vacíos.');
        return;
    }

    if (!validateName(name)) {
        showAlert('error', 'Nombre inválido', 'El nombre solo puede contener letras y un máximo de 30 caracteres.');
        return;
    }

    if (!validateEmail(email)) {
        showAlert('error', 'Email inválido', 'Por favor, ingrese un correo válido.');
        return;
    }

    if (!validatePassword(password)) {
        showAlert('error', 'Contraseña inválida', 'La contraseña debe tener entre 8 y 16 caracteres.');
        return;
    }

    if (password !== confirmPassword) {
        showAlert('error', 'Contraseñas no coinciden', 'Por favor, asegúrese de que ambas contraseñas sean iguales.');
        return;
    }

    // Verificar si el usuario ya existe
    fetch(`/verificarUsuario?email=${email}&nombre=${name}`)
        .then(response => response.json())
        .then(data => {
            if (data.emailExistente) {
                showAlert('error', 'Email duplicado', 'Este correo ya está registrado.');
            } else if (data.nombreExistente) {
                showAlert('error', 'Nombre duplicado', 'Este nombre de usuario ya está registrado.');
            } else {
                // Registro del usuario
                fetch("/agregarUsuario", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nombre: name, email: email, password: password })
                })
                .then(response => {
                    if (response.ok) {
                        showAlert('success', 'Registro exitoso', 'Usuario registrado correctamente.');
                        formSignUp.reset();
                    } else {
                        showAlert('error', 'Error en el registro', 'No se pudo registrar el usuario.');
                    }
                });
            }
        })
        .catch(error => {
            console.error("Error en la solicitud:", error);
            showAlert('error', 'Error de conexión', 'Hubo un problema al conectar con el servidor.');
        });
});

// Validación de inicio de sesión
formSignIn.addEventListener("submit", function (e) {
    e.preventDefault();
    const email = formSignIn.querySelector('input[placeholder="Email"]').value.trim();
    const password = formSignIn.querySelector('input[placeholder="Contraseña"]').value.trim();

    // Verificar que no haya campos vacíos o solo con espacios
    if (isEmptyOrSpaces(email) || isEmptyOrSpaces(password)) {
        showAlert('error', 'Campos vacíos', 'Por favor, ingrese tanto el correo como la contraseña.');
        return;
    }

    if (!validateEmail(email)) {
        showAlert('error', 'Email inválido', 'Por favor, ingrese un correo válido.');
        return;
    }

    if (!validatePassword(password)) {
        showAlert('error', 'Contraseña inválida', 'La contraseña debe tener entre 8 y 16 caracteres.');
        return;
    }

    // Autenticación del usuario
    fetch("/iniciarSesion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.authenticated) {
            formSignIn.reset();
            // Redirige a la página principal después de un inicio de sesión exitoso
            window.location.href = '/index';  // Aquí redirige a /index
        } else {
            showAlert('error', 'Error en inicio de sesión', 'Correo o contraseña incorrectos.');
        }
    })
    .catch(error => {
        console.error("Error en la solicitud:", error);
        showAlert('error', 'Error de conexión', 'Hubo un problema al conectar con el servidor.');
    });
    
    
});
// Alternar entre formularios
btnSignIn.addEventListener("click", () => {
    container.classList.remove("toggle");
});

btnSignUp.addEventListener("click", () => {
    container.classList.add("toggle");
});
