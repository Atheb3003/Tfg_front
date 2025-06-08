document.addEventListener("DOMContentLoaded", () => {
    const tipoConsultaSelect = document.getElementById("revisionTipo");
    const bloqueTratamiento = document.getElementById("bloqueTratamiento");
    const bloqueCirugia = document.getElementById("bloqueCirugia");
    const checkboxTratamiento = document.getElementById("revisionTratamiento");
    const checkboxCirugia = document.getElementById("revisionCirugia");
    const modalElement = document.getElementById("modalNuevaConsultaPopUp");

    function actualizarCheckboxes() {
        const tipo = tipoConsultaSelect.value;
        const mostrar = tipo === "1";

        bloqueTratamiento.style.display = mostrar ? 'block' : 'none';
        bloqueCirugia.style.display = mostrar ? 'block' : 'none';

        if (!mostrar) {
            checkboxTratamiento.checked = false;
            checkboxCirugia.checked = false;
        }
    }

    tipoConsultaSelect.addEventListener("change", actualizarCheckboxes);

    modalElement.addEventListener("shown.bs.modal", async () => {
        actualizarCheckboxes();
    
        const contactId = new URLSearchParams(window.location.search).get("id");
        const optInicial = tipoConsultaSelect.querySelector('option[value="1"]');
        if (!contactId || !optInicial) return;
    
        try {
            const resp = await fetch(`http://localhost:8080/consultations/contact/${contactId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("jwt_token")}`
                }
            });
    
            const json = await resp.json();
            console.log("📥 Consultas recibidas:", json.data);
    
            if (resp.ok && Array.isArray(json.data)) {
                const yaHayInicial = json.data.some(c => c.IDType === 1); // <- AQUÍ el fix
                if (yaHayInicial) {
                    optInicial.disabled = true;
                    optInicial.style.color = "#999";
                    console.log("🔒 Opción 'Inicial' deshabilitada porque ya existe una.");
                } else {
                    optInicial.disabled = false;
                    optInicial.style.color = "";
                    console.log("✅ Opción 'Inicial' habilitada.");
                }
            }
        } catch (err) {
            console.error("❌ Error al consultar historial de consultas:", err);
        }
    });
    
});








document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("jwt_token");
    const select = document.getElementById("revisionTipo");

    if (!select) {
        console.warn("⚠️ No se encontró el select #revisionTipo");
        return;
    }

    if (!token) {
        console.warn("🔒 No hay token JWT.");
        return;
    }

    try {
        const response = await fetch("http://localhost:8080/consultation-types", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (response.ok && result.status === "success") {
            // Limpiar select y añadir opción por defecto
            select.innerHTML = `<option value="">Seleccionar tipo</option>`;

            // Añadir opciones desde la API
            result.data.forEach(tipo => {
                const option = document.createElement("option");
                option.value = tipo.id_type;
                option.textContent = tipo.type_name;
                select.appendChild(option);
            });

            console.log("✅ Tipos de consulta cargados correctamente.");
        } else {
            console.error("❌ Error al cargar tipos:", result);
            alert("Error al cargar los tipos de consulta.");
        }
    } catch (error) {
        console.error("❌ Error de red:", error);
        alert("No se pudo conectar con el servidor.");
    }



    
});




// 🧠 Lista global para guardar archivos seleccionados
let fotosSeleccionadas = [];

// 📸 Previsualización y almacenamiento de archivos
function previewFoto(input) {
    const container = input.closest('.photo-container');
    if (!container) {
        console.warn("❌ No se encontró el contenedor .photo-container");
        return;
    }

    const uploadCard = container.querySelector('.upload-card');

    if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            const dataURL = e.target.result;
            console.log("🖼️ Imagen cargada (ruta DataURL):", dataURL);

            const newPhoto = document.createElement('div');
            newPhoto.className = 'photo-card position-relative border rounded';
            newPhoto.style.width = '120px';
            newPhoto.style.height = '120px';

            newPhoto.innerHTML = `
                <img src="${dataURL}" class="w-100 h-100" style="object-fit: cover; border-radius: 0.5rem;">
                <button class="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-1 eliminar-foto" 
                        onclick="this.parentElement.remove(); event.stopPropagation();">
                  <i class="bi bi-x-circle"></i>
                </button>
            `;

            container.insertBefore(newPhoto, uploadCard);

            // ✅ Guardamos el archivo
            fotosSeleccionadas.push(file);

            input.value = ""; // para permitir seleccionar la misma imagen otra vez
        };

        reader.readAsDataURL(file);
    }
}

// 🧭 Reasignar evento cuando el modal está visible
document.addEventListener('DOMContentLoaded', () => {
    const modalElement = document.getElementById('modalNuevaConsultaPopUp');

    if (!modalElement) return;

    modalElement.addEventListener('shown.bs.modal', () => {
        const inputFoto = document.getElementById('photoInputRevision');
        if (inputFoto) {
            inputFoto.onchange = function () {
                previewFoto(this);
            };
        }
    });
});


// 📤 Guardar consulta + subir fotos
async function guardarConsulta() {
    const contactId = new URLSearchParams(window.location.search).get("id");
    const token = localStorage.getItem("jwt_token");

    if (!contactId || !token) {
        alert("Falta el ID de contacto o el token");
        return;
    }

    const idType = parseInt(document.getElementById("revisionTipo").value);
    const data = {
        id_contact: parseInt(contactId),
        id_type: idType,
        follicular_units: parseInt(document.getElementById("revisionFoliculos").value || 0),
        insertion_zones: document.getElementById("revisionZonas").value,
        observations: document.getElementById("revisionObservaciones").value,
        treatment_done: document.getElementById("revisionTratamiento").checked,
        surgery_reserved: document.getElementById("revisionCirugia").checked,
        consultation_date: document.getElementById("revisionFecha").value
    };

    try {
        // 1️⃣ Guardar la consulta
        const response = await fetch("http://localhost:8080/consultations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok || result.status !== "created") {
            console.error("❌ Error en la respuesta:", result);
            alert("Error al guardar la consulta.");
            return;
        }

        // 2️⃣ Obtener datos necesarios
        const idConsultation = result.data.id_consultation;
        const tipoTexto = document.querySelector("#revisionTipo option:checked").textContent;

        // 3️⃣ Preparar y subir fotos si existen
        if (fotosSeleccionadas.length > 0) {
            console.log(`🖼️ Enviando ${fotosSeleccionadas.length} foto(s):`);
            const formData = new FormData();
            formData.append("contactId", contactId);
            formData.append("consultationId", idConsultation);
            formData.append("revisionId", ""); // si no aplica
            formData.append("title", tipoTexto);
            formData.append("description", "");

            fotosSeleccionadas.forEach(file => {
                console.log(`➡️ ${file.name}`);
                formData.append("files", file);
            });

            const fotoResponse = await fetch("http://localhost:8080/photos/groups/create-with-photos", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                    // No pongas Content-Type, FormData lo gestiona solo
                },
                body: formData
            });

            const fotoResult = await fotoResponse.json();
            console.log("🧾 Respuesta del backend de fotos:", fotoResult);

            if (!fotoResponse.ok || fotoResult.status !== "created") {
                console.warn("⚠️ Consulta creada pero fallo al subir fotos:", fotoResult);
                alert("La consulta fue creada, pero no se pudieron subir las fotos.");
            } else {
                console.log("📸 Fotos subidas con éxito.");
            }
        } else {
            console.log("📭 No se encontraron fotos para enviar.");
        }

        // ✅ Finalizar
        alert("✅ Consulta guardada correctamente.");
        bootstrap.Modal.getInstance(document.getElementById("modalNuevaConsultaPopUp")).hide();
        location.reload();

    } catch (err) {
        console.error("❌ Error de red:", err);
        alert("No se pudo conectar con el servidor.");
    }
}


