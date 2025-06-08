document.addEventListener("DOMContentLoaded", async () => {
    const contactId = new URLSearchParams(window.location.search).get("id");
    const token = localStorage.getItem("jwt_token");
    const contenedor = document.getElementById("bloquesRevisiones");

    if (!contactId || !token || !contenedor) {
        console.warn("⚠️ Faltan datos para cargar revisiones.");
        return;
    }

    try {
        // Fetch de consultas y grupos de fotos
        const [consultasRes, fotosRes] = await Promise.all([
            fetch(`http://localhost:8080/consultations/contact/${contactId}`, {
                headers: { Authorization: `Bearer ${token}` }
            }),
            fetch(`http://localhost:8080/photos/groups/contact/${contactId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
        ]);

        const [consultasData, fotosData] = await Promise.all([
            consultasRes.json(),
            fotosRes.json()
        ]);

        const consultas = consultasData.data || [];
        const gruposFotos = fotosData.data || [];

        consultas.forEach(consulta => {
            const fotosAsociadas = gruposFotos.find(
                g => g.consultationId === consulta.id_consultation // <- Corregido aquí
            );

            const fotos = fotosAsociadas?.photos || [];

            const html = `
                <div class="grupo-fotos-card border rounded p-3 mb-4">
                    <div class="grupo-header d-flex justify-content-between align-items-start">
                        <div>
                            <h5 class="grupo-title">Revisión: ${consulta.type || "Consulta"}</h5>
                            <p class="grupo-meta">
                                Protocolo: <span class="grupo-tipo">${consulta.treatment_done ? "Con protocolo" : "Sin protocolo"}</span> |
                                Fecha: <span class="grupo-fecha">${consulta.consultation_date?.split("T")[0] || "Sin fecha"}</span>
                            </p>
                            <p class="grupo-descripcion">${consulta.observations || "Sin observaciones"}</p>
                            <p class="grupo-productos"><strong>Zonas:</strong> ${consulta.insertion_zones || "-"}</p>
                            ${fotos.length > 0 ? `
                                <p class="grupo-fotos-opcional mt-2">
                                    <button class="btn btn-sm btn-outline-secondary ver-fotos-revision" 
                                        data-fotos='${JSON.stringify(fotos)}'>
                                        <i class="bi bi-images"></i> Ver fotos (${fotos.length})
                                    </button>
                                </p>` : ""}
                        </div>
                        <div>
                            <button class="btn btn-sm btn-danger eliminar-grupo">
                                <i class="bi bi-trash"></i> Eliminar revisión
                            </button>
                        </div>
                    </div>
                </div>
            `;

            contenedor.insertAdjacentHTML("beforeend", html);
        });

        // Listener para ver fotos (delegado o directo)
        contenedor.addEventListener("click", e => {
            const btn = e.target.closest(".ver-fotos-revision");
            if (!btn) return;

            const fotos = JSON.parse(btn.dataset.fotos || "[]");
            if (fotos.length === 0) {
                alert("No hay fotos para mostrar.");
                return;
            }

            console.log("🖼️ Fotos a mostrar:", fotos);
    
        });

    } catch (err) {
        console.error("❌ Error al cargar revisiones o fotos:", err);
    }
});


let fotosActuales = [];
let indiceActual = 0;

async function mostrarFoto(indice) {
    const img = document.getElementById("galeriaImagen");

    if (fotosActuales.length === 0) return;

    const fotoUrl = fotosActuales[indice];

    try {
        const token = localStorage.getItem("jwt_token");

        const response = await fetch(fotoUrl, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("No se pudo cargar la imagen");
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        img.src = blobUrl;
    } catch (error) {
        console.error("❌ Error al cargar la imagen:", error);
        img.alt = "Error al cargar la imagen";
    }
}


document.getElementById("anteriorFoto").addEventListener("click", () => {
    if (fotosActuales.length === 0) return;
    indiceActual = (indiceActual - 1 + fotosActuales.length) % fotosActuales.length;
    mostrarFoto(indiceActual);
});

document.getElementById("siguienteFoto").addEventListener("click", () => {
    if (fotosActuales.length === 0) return;
    indiceActual = (indiceActual + 1) % fotosActuales.length;
    mostrarFoto(indiceActual);
});

// Delegación desde botones "Ver fotos"
document.getElementById("bloquesRevisiones").addEventListener("click", e => {
    const btn = e.target.closest(".ver-fotos-revision");
    if (!btn) return;

    fotosActuales = JSON.parse(btn.dataset.fotos || "[]");
    indiceActual = 0;

    if (fotosActuales.length > 0) {
        mostrarFoto(indiceActual);
        const modal = new bootstrap.Modal(document.getElementById("modalGaleriaFotos"));
        modal.show();
    }
});

