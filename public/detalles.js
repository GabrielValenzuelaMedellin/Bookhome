async function cargarDetallesPropiedad() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        console.error("ID de la propiedad no encontrado en la URL");
        return;
    }

    try {
        const response = await fetch(`/obtenerDetallesPropiedad?id=${id}`);
        if (!response.ok) {
            throw new Error("Error al cargar los detalles");
        }

        const propiedad = await response.json();
        console.log("Propiedad recibida:", propiedad); // Confirmamos que los datos llegan
        mostrarDetalles(propiedad);
    } catch (error) {
        console.error("Error al obtener los detalles de la propiedad:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    cargarDetallesPropiedad();
});

function mostrarDetalles(propiedad) {
    const detallesDiv = document.getElementById("detallesPropiedad");

    if (!detallesDiv) {
        console.error("No se encontró el contenedor de detalles");
        return;
    }

    // Asegurarnos de que propiedad.fotos sea un array
    const imagenes = Array.isArray(propiedad.fotos) ? propiedad.fotos : [propiedad.fotos];

    const imagenesHtml = imagenes.map(url => `
        <div class="imagen-item">
            <img src="${url}" alt="Imagen de la propiedad" class="foto-detalle">
        </div>
    `).join('');

    detallesDiv.innerHTML = `
        <div class="detalle-contenedor">
            <!-- Contenedor de las imágenes -->
            <div class="imagenes-contenedor">
                ${imagenesHtml}
            </div>

            <!-- Información -->
            <div class="info-detalle">
                <h1>${propiedad.tipo_propiedad || "Tipo no disponible"}</h1>
                <p><strong>Precio:</strong> ${propiedad.precio ? `$${Number(propiedad.precio).toLocaleString()}` : "No disponible"}</p>
                <p><strong>Descripción:</strong> ${propiedad.descripcion || "No disponible"}</p>
                <p><strong>Metros cuadrados:</strong> ${propiedad.metros_cuadrados ? `${Number(propiedad.metros_cuadrados).toLocaleString()} m²` : "No disponible"}</p>
                <p><strong>Habitaciones:</strong> ${propiedad.habitaciones || "No disponible"}</p>
                <p><strong>Baños:</strong> ${propiedad.banos || "No disponible"}</p>
                <p><strong>Dirección:</strong> 
                    ${propiedad.calle || ""} ${propiedad.numero_exterior || ""}${propiedad.numero_interior ? `, Int. ${propiedad.numero_interior}` : ""}, 
                    ${propiedad.colonia || ""}, ${propiedad.delegacion || ""}, 
                    C.P. ${propiedad.codigo_postal || ""}
                </p>
                <br>
                <h3>Contacta al vendedor</h3>
                <p></p>
                <p><strong>Vendedor:</strong> ${propiedad.vendedor_nombre || "Nombre no disponible"}</p>
                <p><strong>Teléfono:</strong> ${propiedad.vendedor_telefono || "Número no disponible"}</p>
            </div>
        </div>
    `;
}

