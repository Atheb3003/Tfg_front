document.addEventListener("DOMContentLoaded", async () => {
    const galeria = document.getElementById("galeria");
    const contactId = new URLSearchParams(window.location.search).get("id");
    const token = localStorage.getItem("jwt_token");

    if (!galeria || !contactId || !token) {
        galeria.innerHTML = "<p class='text-danger'>No se pudo cargar la galería.</p>";
        return;
    }

    galeria.innerHTML = "<p>Cargando fotos...</p>";

    try {
        const res = await fetch(`http://localhost:8080/photos/groups/contact/${contactId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        const grupos = data.data || [];

        // Extraer todas las URLs de todas las fotos
        const fotos = grupos.flatMap(grupo => grupo.photos || []);

        if (fotos.length === 0) {
            galeria.innerHTML = "<p>No hay fotos disponibles.</p>";
            return;
        }

        // Generar galería HTML
        galeria.innerHTML = `
            <div class="d-flex flex-wrap gap-3 mb-4" id="miniaturasGaleria">
                ${fotos.map((url, i) => `
                    <img src="" data-index="${i}" class="rounded border"
                         style="width: 120px; height: 120px; object-fit: cover; cursor: pointer;">
                `).join("")}
            </div>

            <div class="modal fade" id="modalGaleria" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered modal-xl">
                    <div class="modal-content bg-dark text-white text-center">
                        <div class="modal-header border-0">
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <img id="fotoGrande" class="img-fluid rounded" src="" alt="Vista previa">
                        </div>
                        <div class="modal-footer justify-content-between border-0">
                            <button class="btn btn-light" id="btnAnterior">⬅ Anterior</button>
                            <button class="btn btn-light" id="btnSiguiente">Siguiente ➡</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const miniaturas = galeria.querySelector("#miniaturasGaleria");
        const modal = new bootstrap.Modal(document.getElementById("modalGaleria"));
        const imgGrande = galeria.querySelector("#fotoGrande");

        let indiceActual = 0;

        // Cargar miniaturas protegidas
        const thumbs = miniaturas.querySelectorAll("img");
        for (let i = 0; i < fotos.length; i++) {
            try {
                const r = await fetch(fotos[i], {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const b = await r.blob();
                const blobUrl = URL.createObjectURL(b);
                thumbs[i].src = blobUrl;
            } catch (err) {
                console.warn(`❌ No se pudo cargar la miniatura ${i}`, fotos[i]);
                thumbs[i].alt = "No disponible";
            }
        }

        // Mostrar imagen protegida en modal
        async function mostrarFotoProtegida(indice) {
            const fotoUrl = fotos[indice];
            try {
                const response = await fetch(fotoUrl, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                imgGrande.src = blobUrl;
                imgGrande.alt = "Foto cargada";
            } catch (error) {
                console.error("❌ Error al cargar la imagen ampliada:", error);
                imgGrande.src = "";
                imgGrande.alt = "Error al cargar imagen";
            }
        }

        // Abrir modal al hacer clic en miniatura
        miniaturas.addEventListener("click", e => {
            const img = e.target.closest("img");
            if (!img) return;

            indiceActual = parseInt(img.dataset.index);
            mostrarFotoProtegida(indiceActual);
            modal.show();
        });

        // Navegación
        galeria.querySelector("#btnAnterior").addEventListener("click", () => {
            indiceActual = (indiceActual - 1 + fotos.length) % fotos.length;
            mostrarFotoProtegida(indiceActual);
        });

        galeria.querySelector("#btnSiguiente").addEventListener("click", () => {
            indiceActual = (indiceActual + 1) % fotos.length;
            mostrarFotoProtegida(indiceActual);
        });

    } catch (err) {
        console.error("❌ Error cargando fotos:", err);
        galeria.innerHTML = "<p class='text-danger'>Error al cargar las fotos.</p>";
    }
});
