const token = localStorage.getItem('jwt_token');

document.addEventListener("DOMContentLoaded", () => {
  const tablaCuerpo = document.querySelector("tbody");
  const paginacion = document.querySelector(".pagination");
  const baseUrl = "http://localhost:8080/patients";
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

        tablaCuerpo.innerHTML = "";
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
              alert("Función aún en desarrollo");
              e.stopPropagation(); // Para evitar redirección también
              return;
            }

            const cell = e.target.closest("td");
            const row = e.target.closest("tr");

            if (cell && row && !e.target.closest("button")) {
              const contactIdCell = row.querySelector("button[data-id]");
              if (contactIdCell) {
                const contactId = contactIdCell.getAttribute("data-id");
                window.location.href = `http://127.0.0.1:5500/paginaPaciente.html?id=${contactId}`;
              }
            }
          });



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


    term = quitarTildes(term);

    searchMode = true; // Activar el modo de búsqueda
    cargarContactos(0, term);
  });
});


