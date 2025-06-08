const token = localStorage.getItem('jwt_token');

document.addEventListener("DOMContentLoaded", () => {
  const tablaCuerpo = document.querySelector("tbody");
  const paginacion = document.querySelector(".pagination");
  const baseUrl = "http://localhost:8080/contacts";
  let currentPage = parseInt(localStorage.getItem('pagina_contactos')) || 0;
  let totalPages = 1;
  let searchMode = false; // Flag para saber si estamos en modo de búsqueda

  // Función para quitar tildes del término de búsqueda
  function quitarTildes(str) {
    const tildes = [
      { from: 'á', to: 'a' },
      { from: 'é', to: 'e' },
      { from: 'í', to: 'i' },
      { from: 'ó', to: 'o' },
      { from: 'ú', to: 'u' },
      { from: 'Á', to: 'A' },
      { from: 'É', to: 'E' },
      { from: 'Í', to: 'I' },
      { from: 'Ó', to: 'O' },
      { from: 'Ú', to: 'U' },
      { from: 'ñ', to: 'n' },
      { from: 'Ñ', to: 'N' }
    ];

    tildes.forEach(t => {
      const regex = new RegExp(t.from, 'g');
      str = str.replace(regex, t.to);
    });

    return str;
  }

  // Función para cargar los contactos
  function cargarContactos(page = 0, searchTerm = '') {
    localStorage.setItem('pagina_contactos', page); // Guardar la página actual
    const url = searchMode ? `${baseUrl}/search/${searchTerm}?page=${page}` : `${baseUrl}?page=${page}`;

    fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("No autorizado");
        return res.json();
      })
      .then(data => {
        const contactos = data.data.content;
        totalPages = data.data.totalPages;
        currentPage = data.data.number;

        contactos.forEach(contact => {
          const row = document.createElement("tr");
          row.innerHTML = `
    <th scope="row">${contact.id_contact_string}</th>
    <td class="clickable-cell">${contact.name} ${contact.surname}</td>
    <td class="d-none d-md-table-cell clickable-cell">${contact.email}</td>
    <td class="d-none d-lg-table-cell clickable-cell">${contact.telephone_number_1}</td>
    <td class="d-none d-md-table-cell clickable-cell">${contact.nif}</td>
    <td>
      <button class="buttonTransformContact" data-id="${contact.id_contact}">
        <i class="bi bi-box-arrow-in-right"></i>
      </button>
    </td>
  `;
          tablaCuerpo.appendChild(row);



          // Event listener para los botones
          tablaCuerpo.addEventListener("click", (e) => {
            const button = e.target.closest(".buttonTransformContact");
            if (button) {
              const contactId = button.getAttribute("data-id");
              miFuncion(contactId);
              return; // Salir para que no se procese el clic como redirección
            }

            // Detectar clic en celdas informativas (excluyendo la celda del botón)
            const cell = e.target.closest("td");
            const row = e.target.closest("tr");

            if (cell && row && !cell.querySelector("button")) {
              const contactIdCell = row.querySelector("button[data-id]");
              if (contactIdCell) {
                const contactId = contactIdCell.getAttribute("data-id");
                window.location.href = `http://127.0.0.1:5500/paginaContacto.html?id=${contactId}`;
              }
            }
          });


          function miFuncion(contactId) {
            const token = localStorage.getItem('jwt_token');
            const button = document.querySelector(`[data-id="${contactId}"]`);

            // Deshabilitar el botón para prevenir múltiples clics
            button.disabled = true;
            button.innerHTML = 'Procesando...';  // Cambiar el texto del botón para informar al usuario

            fetch(`http://localhost:8080/patients/${contactId}/to-patient`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })
              .then(res => {
                if (!res.ok) {
                  throw new Error(`Error: ${res.status} - ${res.statusText}`);
                }
                return res.json();
              })
              .then(data => {
                console.log("Respuesta de la API:", data);
                const modalMessage = document.getElementById('modalMessage');
                const redirectBtn = document.getElementById('modalRedirectBtn');

                if (data.status === "created") {
                  modalMessage.innerText = `Contacto con ID ${contactId} transformado correctamente en paciente.`;

                  redirectBtn.onclick = function () {
                    window.location.href = `paginaContacto.html?id=${contactId}`;
                  };

                  document.getElementById('modalUpdate').onclick = function () {
                    // Llamar a la función para cargar los contactos
                    const currentPage = parseInt(localStorage.getItem('pagina_contactos')) || 0;
                    const searchTerm = '';  // O puedes obtener el término de búsqueda si es necesario
                    cargarContactos(currentPage, searchTerm);  // Recargar los contactos en la página actual

                    // Cerrar el modal después de recargar
                    const myModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
                    myModal.hide();
                  };

                  // Escuchar cuando el modal se cierra (ya sea al hacer clic fuera o al presionar "Cerrar")
                  const modalElement = document.getElementById('confirmationModal');
                  modalElement.addEventListener('hidden.bs.modal', function () {
                    // Llamar a la función para cargar los contactos
                    const currentPage = parseInt(localStorage.getItem('pagina_contactos')) || 0;
                    const searchTerm = '';  // O puedes obtener el término de búsqueda si es necesario
                    cargarContactos(currentPage, searchTerm);  // Recargar los contactos en la página actual
                  });



                  const myModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
                  myModal.show();
                } else {
                  modalMessage.innerText = `Error: ${data.message || "Ocurrió un error inesperado."}`;
                  const myModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
                  myModal.show();
                }
              })
              .catch(err => {
                modalMessage.innerText = `Contacto con ID ${contactId} transformado correctamente en paciente.`;

                redirectBtn.onclick = function () {
                  window.location.href = `paginaContacto.html?id=${contactId}`;
                };

                document.getElementById('modalUpdate').onclick = function () {
                  // Llamar a la función para cargar los contactos
                  const currentPage = parseInt(localStorage.getItem('pagina_contactos')) || 0;
                  const searchTerm = '';  // O puedes obtener el término de búsqueda si es necesario
                  cargarContactos(currentPage, searchTerm);  // Recargar los contactos en la página actual

                  // Cerrar el modal después de recargar
                  const myModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
                  myModal.hide();
                };

                // Escuchar cuando el modal se cierra (ya sea al hacer clic fuera o al presionar "Cerrar")
                const modalElement = document.getElementById('confirmationModal');
                modalElement.addEventListener('hidden.bs.modal', function () {
                  // Llamar a la función para cargar los contactos
                  const currentPage = parseInt(localStorage.getItem('pagina_contactos')) || 0;
                  const searchTerm = '';  // O puedes obtener el término de búsqueda si es necesario
                  cargarContactos(currentPage, searchTerm);  // Recargar los contactos en la página actual
                });



                const myModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
                myModal.show();
              })
              .finally(() => {
                // Reactivar el botón después de completar la solicitud
                button.disabled = false;
                button.innerHTML = '<i class="bi bi-box-arrow-in-right"></i>'; // Restablecer el icono original
              });
          }


          // Función para cargar los contactos
          function cargarContactos(page = 0, searchTerm = '') {
            const token = localStorage.getItem('jwt_token');
            localStorage.setItem('pagina_contactos', page); // Guardar la página actual
            const url = searchMode ? `${baseUrl}/search/${searchTerm}?page=${page}` : `${baseUrl}?page=${page}`;

            fetch(url, {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${token}`,
              }
            })
              .then(res => {
                if (!res.ok) throw new Error("No autorizado");
                return res.json();
              })
              .then(data => {
                const contactos = data.data.content;
                totalPages = data.data.totalPages;
                currentPage = data.data.number;

                tablaCuerpo.innerHTML = "";
                contactos.forEach(contact => {
                  const row = document.createElement("tr");
                  row.innerHTML = `
          <th scope="row">${contact.id_contact_string}</th>
          <td>${contact.name} ${contact.surname}</td>
          <td class="d-none d-md-table-cell">${contact.email}</td>
          <td class="d-none d-lg-table-cell">${contact.telephone_number_1}</td>
          <td class="d-none d-md-table-cell">${contact.nif}</td>  <!-- Agregado -->
          <td><button class="buttonTransformContact" data-id="${contact.id_contact}">
            <i class="bi bi-box-arrow-in-right"></i>
          </button></td>
        `;
                  tablaCuerpo.appendChild(row);
                });

                actualizarNumeracionPaginacion();
              })
              .catch(err => {
                console.error("Error al cargar contactos:", err);
                alert("No autorizado o error de servidor");
              });
          }

          // Actualizar la lista de contactos cuando se cierre el modal y el contacto fue transformado
          document.getElementById('modalRedirectBtn').addEventListener('click', function () {
            // Recargar la lista de contactos después de la redirección
            cargarContactos(currentPage); // Recarga los contactos en la página actual
            // Cerrar el modal al hacer clic en el botón de redirección
            const myModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
            myModal.hide();
          });

          // Función para actualizar la numeración de la paginación
          function actualizarNumeracionPaginacion() {
            const botonesPagina = [...paginacion.querySelectorAll("[data-page]")];
            botonesPagina.forEach(b => b.parentElement.remove());

            const separador = paginacion.querySelector("li.disabled");
            const rango = 2;
            const inicio = Math.max(0, currentPage - rango);
            const fin = Math.min(totalPages - 1, currentPage + rango);

            for (let i = inicio; i <= fin; i++) {
              const li = document.createElement("li");
              li.className = "page-item" + (i === currentPage ? " active" : "");
              li.innerHTML = `<button class="page-link ${i === currentPage ? 'active' : ''}" data-page="${i}">${i + 1}</button>`;
              paginacion.insertBefore(li, separador);

            }
          }





        });

        actualizarNumeracionPaginacion();
      })
      .catch(err => {
        console.error("Error al cargar contactos:", err);
        alert("No autorizado o error de servidor");
      });
  }

  // Función para actualizar la numeración de la paginación
  function actualizarNumeracionPaginacion() {
    const botonesPagina = [...paginacion.querySelectorAll("[data-page]")];
    botonesPagina.forEach(b => b.parentElement.remove());

    const separador = paginacion.querySelector("li.disabled");
    const rango = 2;
    const inicio = Math.max(0, currentPage - rango);
    const fin = Math.min(totalPages - 1, currentPage + rango);

    for (let i = inicio; i <= fin; i++) {
      const li = document.createElement("li");
      li.className = "page-item" + (i === currentPage ? " active" : "");
      li.innerHTML = `<button class="page-link ${i === currentPage ? 'active' : ''}" data-page="${i}">${i + 1}</button>`;
      paginacion.insertBefore(li, separador);
    }
  }

  // Event listener para la paginación
  paginacion.addEventListener("click", (e) => {
    const button = e.target.closest("button");
    if (!button) return;

    if (button.dataset.page !== undefined) {
      cargarContactos(Number(button.dataset.page), inputBusqueda.value.trim());
    }

    switch (button.dataset.action) {
      case "first":
        cargarContactos(0, inputBusqueda.value.trim());
        break;
      case "last":
        cargarContactos(totalPages - 1, inputBusqueda.value.trim());
        break;
      case "next":
        if (currentPage + 1 < totalPages) cargarContactos(currentPage + 1, inputBusqueda.value.trim());
        break;
      case "prev":
        if (currentPage > 0) cargarContactos(currentPage - 1, inputBusqueda.value.trim());
        break;
    }
  });

  // Cargar la página almacenada
  cargarContactos(currentPage);

  // Manejo del formulario de búsqueda
  const formularioBusqueda = document.querySelector("form[role='search']");
  const inputBusqueda = formularioBusqueda.querySelector("input[type='search']");

  formularioBusqueda.addEventListener("submit", function (e) {
    e.preventDefault();

    let term = inputBusqueda.value.trim();
    if (!term) {
      // Si el input está vacío, recarga la lista normal paginada
      searchMode = false;
      cargarContactos(currentPage);
      return;
    }

    // Quitamos las tildes del término de búsqueda
    term = quitarTildes(term);

    searchMode = true; // Activar el modo de búsqueda
    cargarContactos(0, term); // Cargar los resultados de la búsqueda
  });
});


