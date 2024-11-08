document.addEventListener("DOMContentLoaded", () => {
    obtenerPropiedades();
});

function obtenerPropiedades() {
    fetch("/obtenerPropiedades")
        .then(response => response.json())
        .then(propiedades => {
            mostrarPropiedades(propiedades);
        })
        .catch(error => {
            console.error("Error al obtener las propiedades:", error);
        });
}

function mostrarPropiedades(propiedades) {
    const catalogo = document.getElementById("catalogoPropiedades");
    catalogo.innerHTML = ''; // Limpiamos el contenedor antes de agregar las propiedades

    propiedades.forEach(propiedad => {
        // Crear el contenedor de cada propiedad
        const propiedadDiv = document.createElement("div");
        propiedadDiv.classList.add("propiedad");

        // HTML interno de cada tarjeta de propiedad
        propiedadDiv.innerHTML = `
            <img src="${propiedad.imagenUrl}" alt="Imagen de la propiedad">
            <div class="propiedad-content">
                <span class="etiqueta">¡Excelente precio!</span>
                <h3>${propiedad.tipo_propiedad.charAt(0).toUpperCase() + propiedad.tipo_propiedad.slice(1)}</h3>
                <p>${propiedad.ubicacion}</p>
                <div class="propiedad-details">
                    <span>${propiedad.metros_cuadrados} m²</span>
                    <span>${propiedad.habitaciones} habitaciones</span>
                    <span>${propiedad.banos} baños</span>
                </div>
                <p class="precio">Ahora $${propiedad.precio}</p>
                <button onclick="agregarAFavoritos(${propiedad.id_propiedad})">Agregar a favoritos</button>
            </div>
        `;

        // Añadir la tarjeta de propiedad al catálogo
        catalogo.appendChild(propiedadDiv);
    });
}

function agregarAFavoritos(idPropiedad) {
    console.log("Propiedad agregada a favoritos:", idPropiedad);
}
