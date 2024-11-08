const formAgregarPropiedad = document.getElementById("formAgregarPropiedad");

        function validatePrecio(precio) {
            return precio > 0;
        }

        function validateDireccion(direccion) {
            return direccion.length > 5;
        }

        function validateMetrosCuadrados(metrosCuadrados) {
            return metrosCuadrados > 0;
        }

        function validateHabitaciones(habitaciones) {
            return habitaciones >= 1;
        }

        function validateBanos(banos) {
            return banos >= 1;
        }

        function showAlert(icon, title, text) {
            Swal.fire({
                icon: icon,
                title: title,
                text: text,
                confirmButtonColor: '#3AB397'
            });
        }

        formAgregarPropiedad.addEventListener("submit", function (e) {
            e.preventDefault();

            const tipo = formAgregarPropiedad.querySelector('input[name="tipo"]:checked').value;
            const precio = formAgregarPropiedad.querySelector("#precio").value;
            const direccion = formAgregarPropiedad.querySelector("#direccion").value;
            const tipo_propiedad = formAgregarPropiedad.querySelector('input[name="tipo_propiedad"]:checked').value;
            const descripcion = formAgregarPropiedad.querySelector("#descripcion").value;
            const metrosCuadrados = formAgregarPropiedad.querySelector("#metros_cuadrados").value;
            const habitaciones = formAgregarPropiedad.querySelector("#habitaciones").value;
            const banos = formAgregarPropiedad.querySelector("#banos").value;

            if (!validatePrecio(precio)) {
                showAlert('error', 'Precio inválido', 'El precio debe ser mayor a 0.');
                return;
            }

            if (!validateDireccion(direccion)) {
                showAlert('error', 'Dirección inválida', 'La dirección debe tener más de 5 caracteres.');
                return;
            }

            if (!validateMetrosCuadrados(metrosCuadrados)) {
                showAlert('error', 'Metros cuadrados inválidos', 'Los metros cuadrados deben ser mayores a 0.');
                return;
            }

            if (!validateHabitaciones(habitaciones)) {
                showAlert('error', 'Número de habitaciones inválido', 'Debe haber al menos 1 habitación.');
                return;
            }

            if (!validateBanos(banos)) {
                showAlert('error', 'Número de baños inválido', 'Debe haber al menos 1 baño.');
                return;
            }

            fetch("/agregarPropiedad", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id_usuario: 1,
                    tipo_propiedad: tipo_propiedad,
                    precio: parseFloat(precio),
                    descripcion: descripcion,
                    metros_cuadrados: parseFloat(metrosCuadrados),
                    habitaciones: parseInt(habitaciones),
                    banos: parseInt(banos)
                })
            })
            .then(response => {
                if (response.ok) {
                    showAlert('success', 'Propiedad agregada', 'La propiedad fue agregada exitosamente.');
                    formAgregarPropiedad.reset();
                } else {
                    showAlert('error', 'Error al agregar', 'No se pudo agregar la propiedad.');
                }
            })
            .catch(error => {
                console.error("Error en la solicitud:", error);
                showAlert('error', 'Error de conexión', 'Hubo un problema al conectar con el servidor.');
            });
        });