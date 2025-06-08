// Secciones que deben activar el estado activo visualmente en la barra de navegación secundaria
const tabsToActivate = ['Principal', 'Fotos', 'Historial', 'Presupuesto'];

// Cambia visualmente la pestaña activa en función del texto del botón
document.querySelectorAll('.tablinks').forEach(button => {
    button.addEventListener('click', function (e) {
        const section = e.target.textContent.trim();
        if (tabsToActivate.includes(section)) {
            document.querySelectorAll('.tablinks').forEach(btn => btn.classList.remove('activeSectionContactPatient'));
            e.target.classList.add('activeSectionContactPatient');
        }
    });
});

// Función para previsualizar fotos dentro del modal de revisión
function previewFotoRevision(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const newPhoto = document.createElement('div');
            newPhoto.className = 'photo-card position-relative border rounded';
            newPhoto.style.width = '120px';
            newPhoto.style.height = '120px';
            newPhoto.innerHTML = `
                <img src="${e.target.result}" class="w-100 h-100" style="object-fit: cover; border-radius: 0.5rem;">
                <button class="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-1 eliminar-foto" 
                        onclick="this.parentElement.remove(); event.stopPropagation();">
                  <i class="bi bi-x-circle"></i>
                </button>
            `;
            const container = document.querySelector('#modalNuevaRevision .photo-container');
            const uploadCard = container.querySelector('.upload-card');
            container.insertBefore(newPhoto, uploadCard);
            input.value = "";
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Cambio visual y lógico entre pestañas principales
function openSection(evt, sectionName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }
    document.getElementById(sectionName).style.display = "block";
    evt.currentTarget.classList.add("active");
}

// Alternar visualización de dropdowns personalizados (no usado en tabs principales)
function toggleContent(containerId) {
    var container = document.getElementById(containerId);
    var content = container.querySelector('.dropdownContent');
    content.classList.toggle('dropdown-hidden');
    content.classList.toggle('dropdown-visible');
}

// Previsualización de imagen (para fotos generales)
function previewFoto(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const newPhoto = document.createElement('div');
            newPhoto.className = 'photo-card position-relative border rounded';
            newPhoto.style.width = '120px';
            newPhoto.style.height = '120px';

            newPhoto.innerHTML = `
                <img src="${e.target.result}" class="w-100 h-100" style="object-fit: cover; border-radius: 0.5rem;">
                <button class="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-1 eliminar-foto" 
                        onclick="this.parentElement.remove(); event.stopPropagation();">
                  <i class="bi bi-x-circle"></i>
                </button>
            `;

            const container = document.querySelector('.photo-container');
            const uploadCard = container.querySelector('.upload-card');
            container.insertBefore(newPhoto, uploadCard);

            input.value = "";
        };

        reader.readAsDataURL(input.files[0]);
    }
}

// Al abrir el modal para crear grupo de fotos, se asigna la fecha actual automáticamente
document.getElementById('modalNuevoGrupo').addEventListener('show.bs.modal', function () {
    const hoy = new Date().toLocaleDateString('es-ES');
    document.getElementById('grupoFecha').value = hoy;
});

// Mostrar imagen en grande en modal
document.addEventListener('click', function (e) {
    if (e.target.tagName === 'IMG' && e.target.closest('.grupo-fotos-grid')) {
        const src = e.target.getAttribute('src');
        document.getElementById('modalFoto').src = src;
        const modal = new bootstrap.Modal(document.getElementById('modalVerFoto'));
        modal.show();
    }
});

let fotoAEliminar = null;
let grupoAEliminar = null;

// Detectar clic en botones de eliminar
document.addEventListener('click', function (e) {
    if (e.target.closest('.eliminar-foto')) {
        fotoAEliminar = e.target.closest('.foto-card');
        const modal = new bootstrap.Modal(document.getElementById('modalConfirmarEliminarFoto'));
        modal.show();
    }

    if (e.target.closest('.eliminar-grupo')) {
        grupoAEliminar = e.target.closest('.grupo-fotos-card');
        const modal = new bootstrap.Modal(document.getElementById('modalConfirmarEliminarGrupo'));
        modal.show();
    }
});

// Confirmar y ejecutar eliminación de una foto
document.getElementById('confirmarEliminarFotoBtn').addEventListener('click', function () {
    if (fotoAEliminar) {
        fotoAEliminar.remove(); // Aquí en el futuro se puede usar: DELETE /api/photos/:id
        fotoAEliminar = null;
    }
    bootstrap.Modal.getInstance(document.getElementById('modalConfirmarEliminarFoto')).hide();
});

// Confirmar y ejecutar eliminación de grupo de fotos
document.getElementById('confirmarEliminarGrupoBtn').addEventListener('click', function () {
    if (grupoAEliminar) {
        grupoAEliminar.remove(); // DELETE /api/group-photos/:id
        grupoAEliminar = null;
    }
    bootstrap.Modal.getInstance(document.getElementById('modalConfirmarEliminarGrupo')).hide();
});

// Lógica para añadir productos usados en revisión (tipo tag con botón de eliminación)
const productosSeleccionados = [];

document.getElementById("revisionProductosSelector").addEventListener("change", function () {
    const selector = this;
    const selectedOption = selector.options[selector.selectedIndex];
    const value = selectedOption.value;
    const text = selectedOption.text;

    if (value) {
        const id = crypto.randomUUID(); // ID único, útil para diferenciarlos visualmente
        productosSeleccionados.push({ id, value, text }); // Puedes enviar este array por POST a la API

        const container = document.getElementById("productosSeleccionados");
        const badge = document.createElement("span");
        badge.className = "badge bg-primary d-flex align-items-center gap-2 px-2 py-1";
        badge.setAttribute("data-id", id);
        badge.innerHTML = `
            ${text}
            <i class="bi bi-x-circle pointer" style="cursor:pointer;" onclick="eliminarProducto('${id}')"></i>
        `;
        container.appendChild(badge);
    }

    selector.value = ""; // Reinicia selección
});

// Elimina un producto seleccionado de la UI y del array
function eliminarProducto(id) {
    const index = productosSeleccionados.findIndex(p => p.id === id);
    if (index !== -1) {
        productosSeleccionados.splice(index, 1); // Eliminar del array
    }

    const badge = document.querySelector(`#productosSeleccionados [data-id="${id}"]`);
    if (badge) {
        badge.remove();
    }
}


document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('jwt_token');

    if (!token) {
        console.log("Token no encontrado. Redirigiendo...");
        window.location.href = '/login.html';
        return;
    }

    // Obtener el ID del contacto desde la URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        alert("ID de contacto no especificado en la URL.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/contacts/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("No se pudo obtener el contacto");
        }

        // ==================== DETECCIÓN Y VISUALIZACIÓN DE PROTOCOLO =====================
        const panelProtocolo = document.getElementById("panelProtocoloRevision");
        const listaTratamientos = document.getElementById("listaTratamientosProtocoloRevision");
        const contenedorChips = document.getElementById("productosSeleccionados");
        const productosProtocoloSeleccionados = [];

        // Simular protocolo si el contacto tiene ID 16
        if (id === "16") {
            const protocoloSimulado = [
                { nombre: "Láser capilar", precio: 120, realizado: false },
                { nombre: "Mesoterapia avanzada", precio: 150, realizado: true },
                { nombre: "Ozono terapia", precio: 95, realizado: false }
            ];

            panelProtocolo.style.display = "block";
            listaTratamientos.innerHTML = "";

            protocoloSimulado.forEach((tratamiento) => {
                const li = document.createElement("li");
                li.className = "list-group-item d-flex justify-content-between align-items-center";
                li.innerHTML = `
            ${tratamiento.nombre}
            <div>
                ${tratamiento.realizado
                        ? '<i class="bi bi-check-circle-fill text-success" title="Realizado"></i>'
                        : `<button class="btn btn-sm btn-outline-primary" onclick="agregarDeProtocoloRevision('${tratamiento.nombre}', ${tratamiento.precio})">Agregar</button>`}
            </div>`;
                listaTratamientos.appendChild(li);
            });
        }

        // Función global para añadir tratamientos del protocolo como chips
        window.agregarDeProtocoloRevision = function (nombre, precio) {
            const existente = productosProtocoloSeleccionados.find(p => p.text === nombre);
            if (existente) return;

            const idChip = crypto.randomUUID();
            const nuevo = { id: idChip, text: nombre, precio };
            productosProtocoloSeleccionados.push(nuevo);

            const chip = document.createElement("span");
            chip.className = "badge bg-info text-dark d-flex align-items-center gap-2 px-2 py-1";
            chip.setAttribute("data-id", idChip);
            chip.innerHTML = `
        ${nombre}
        <i class="bi bi-x-circle" style="cursor:pointer;" onclick="eliminarProtocoloRevision('${idChip}', '${nombre}')"></i>
    `;
            contenedorChips.appendChild(chip);

            const botones = document.querySelectorAll("#listaTratamientosProtocoloRevision button");
            botones.forEach(btn => {
                if (
                    btn.textContent.includes("Agregar") &&
                    btn.closest("li").textContent.includes(nombre)
                ) {
                    btn.disabled = true;
                    btn.innerHTML = '<i class="bi bi-check-lg"></i> Añadido';
                    btn.classList.remove("btn-outline-primary");
                    btn.classList.add("btn-success");
                }
            });
        };

        window.eliminarProtocoloRevision = function (idChip, nombre) {
            const index = productosProtocoloSeleccionados.findIndex(p => p.id === idChip);
            if (index !== -1) productosProtocoloSeleccionados.splice(index, 1);

            const chip = contenedorChips.querySelector(`[data-id="${idChip}"]`);
            if (chip) chip.remove();

            const botones = document.querySelectorAll("#listaTratamientosProtocoloRevision button");
            botones.forEach(btn => {
                if (
                    btn.textContent.includes("Añadido") &&
                    btn.closest("li").textContent.includes(nombre)
                ) {
                    btn.disabled = false;
                    btn.innerHTML = 'Agregar';
                    btn.classList.remove("btn-success");
                    btn.classList.add("btn-outline-primary");
                }
            });
        };


        const data = await response.json();

        // Rellenar campos del formulario
        document.getElementById('firstName').value = data.name || '';
        document.getElementById('lastName').value = data.surname || '';
        document.getElementById('nif').value = data.nif || '';
        document.getElementById('birthDate').value = data.birth_date || '';
        document.getElementById('occupation').value = data.occupation || '';
        document.getElementById('country').value = data.country || '';
        document.getElementById('province').value = data.province || '';
        document.getElementById('municipality').value = data.town || '';
        document.getElementById('direction').value = data.direction || '';
        document.getElementById('phone').value = data.telephone_number_1 || '';
        document.getElementById('secondPhone').value = data.telephone_number_2 || '';
        document.getElementById('email').value = data.email || '';
        document.getElementById('notes').value = data.observations || '';

        // Opcional: actualizar el nombre y fecha arriba
        document.querySelector('.contact-name').textContent = `${data.name || ''} ${data.surname || ''}`;
        document.querySelector('.contact-date').textContent = `Contacto: ID ${data.id_contact_string}`;

    } catch (error) {
        console.error('Error al cargar los datos del contacto:', error);
        alert('❌ Error al cargar el contacto. Ver consola para más detalles.');
    }

    








});

document.addEventListener("DOMContentLoaded", () => {
    console.log("📦 Script cargado");

    const contactId = new URLSearchParams(window.location.search).get("id");
    console.log("🔵 ID extraído de la URL:", contactId);

    if (!contactId) {
        alert("ID de contacto no especificado en la URL.");
        return;
    }

    const updateBtn = document.getElementById("updateBtn");
    if (!updateBtn) {
        console.error("❌ Botón de actualización no encontrado.");
        return;
    }

    updateBtn.addEventListener("click", async () => {
        const token = localStorage.getItem("jwt_token");
        if (!token) {
            alert("Token no encontrado. Inicia sesión nuevamente.");
            return;
        }

        const data = {
            name: document.getElementById("firstName").value.trim(),
            surname: document.getElementById("lastName").value.trim(),
            nif: document.getElementById("nif").value.trim(),
            birth_date: document.getElementById("birthDate").value.trim(),
            occupation: document.getElementById("occupation").value.trim(),
            country: document.getElementById("country").value.trim(),
            province: document.getElementById("province").value.trim(),
            town: document.getElementById("municipality").value.trim(),
            direction: document.getElementById("direction").value.trim(),
            telephone_number_1: document.getElementById("phone").value.trim(),
            telephone_number_2: document.getElementById("secondPhone").value.trim(),
            email: document.getElementById("email").value.trim(),
            observations: document.getElementById("notes").value.trim(),
            is_visible: true
        };

        try {
            const response = await fetch(`http://localhost:8080/contacts/${contactId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok && result.status === "updated") {
                alert("✅ Paciente actualizado correctamente.");
                location.href = window.location.href; // recarga limpia
            } else {
                console.error("❌ Error del servidor:", result);
                alert("Error al actualizar el contacto.");
            }
        } catch (error) {
            console.error("❌ Error de red:", error);
            alert("No se pudo conectar con el servidor.");
        }
    });
});








