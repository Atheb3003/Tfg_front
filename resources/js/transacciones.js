        document.addEventListener("DOMContentLoaded", function () {
            const btnTransaccion = document.getElementById("btnAbrirTransaccion");
            if (btnTransaccion) {
                btnTransaccion.addEventListener("click", function (e) {
                    e.preventDefault();
                    const modal = new bootstrap.Modal(document.getElementById("modalNuevaTransaccion"));
                    modal.show();
                });
            }

            const inputPaciente = document.getElementById("inputBuscarPaciente");
            const panelProtocolo = document.getElementById("panelProtocolo");
            const listaTratamientosProtocolo = document.getElementById("listaTratamientosProtocolo");
            const productosSeleccionados = [];
            const tablaResumen = document.getElementById("tablaResumenProductos");
            const contenedorChips = document.getElementById("productosSeleccionados");
            const totalTransaccion = document.getElementById("totalTransaccion");

            const selectorProductos = document.getElementById("revisionProductosSelector");

            const protocolosSimulados = {
                antonio: [
                    { nombre: "Mesoterapia", precio: 90, realizado: true },
                    { nombre: "PRP", precio: 110, realizado: false },
                    { nombre: "Minoxidil 3%", precio: 65, realizado: false },
                ],
                nina: [
                    { nombre: "F0.5M", precio: 55, realizado: false },
                    { nombre: "Mesoterapia", precio: 85, realizado: true },
                ],
            };

            inputPaciente.addEventListener("input", function () {
                const nombre = this.value.trim().toLowerCase();
                listaTratamientosProtocolo.innerHTML = "";
                panelProtocolo.style.display = "none";

                if (protocolosSimulados[nombre]) {
                    panelProtocolo.style.display = "block";

                    protocolosSimulados[nombre].forEach((tratamiento) => {
                        const li = document.createElement("li");
                        li.className = "list-group-item d-flex justify-content-between align-items-center";
                        li.innerHTML = `
                        ${tratamiento.nombre}
                        <div>
                            ${tratamiento.realizado
                                ? '<i class="bi bi-check-circle-fill text-success" title="Realizado"></i>'
                                : `<button class="btn btn-sm btn-outline-primary" onclick="agregarDeProtocolo('${tratamiento.nombre}', ${tratamiento.precio})"> Agregar</button>`
                            }
                        </div>
                    `;
                        listaTratamientosProtocolo.appendChild(li);
                    });
                }
            });

            window.agregarDeProtocolo = function (nombre, precio) {
                const existente = productosSeleccionados.find(p => p.text === nombre && p.esProtocolo);
                if (existente) {
                    // Ya está agregado, no permitir repetir
                    return;
                }

                const id = crypto.randomUUID();
                const nuevoProducto = {
                    id,
                    value: nombre.toLowerCase().replace(/\s+/g, "-"),
                    text: nombre,
                    precio,
                    cantidad: 1,
                    esProtocolo: true
                };
                productosSeleccionados.push(nuevoProducto);
                agregarChip(nombre, id);
                agregarFilaResumen(nuevoProducto);
                actualizarTotal();

                // Desactivar el botón correspondiente
                const botones = document.querySelectorAll("#listaTratamientosProtocolo button");
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

            selectorProductos.addEventListener("change", function () {
                const selectedOption = this.options[this.selectedIndex];
                const value = selectedOption.value;
                const text = selectedOption.text;
                const precio = parseFloat(selectedOption.getAttribute("data-precio")) || 0;
                if (!value) return;

                const existente = productosSeleccionados.find(p => p.value === value && !p.esProtocolo);
                if (existente) {
                    existente.cantidad += 1;
                    actualizarFilaResumen(existente.id, existente);
                } else {
                    const id = crypto.randomUUID();
                    const nuevoProducto = { id, value, text, precio, cantidad: 1, esProtocolo: false };
                    productosSeleccionados.push(nuevoProducto);
                    agregarChip(text, id);
                    agregarFilaResumen(nuevoProducto);
                }
                actualizarTotal();
                this.value = "";
            });

            function agregarChip(texto, id) {

            }

            function agregarFilaResumen(producto) {
                const row = document.createElement("tr");
                row.setAttribute("data-id", producto.id);
                row.innerHTML = `
                <td>${producto.text} ${producto.esProtocolo ? '<span class="badge bg-info text-dark">Protocolo</span>' : ""}</td>
                <td class="col-cantidad">${producto.cantidad}</td>
                <td class="col-subtotal">$${(producto.precio * producto.cantidad).toFixed(2)}</td>
                <td><button class="btn btn-sm btn-outline-danger" onclick="eliminarProducto('${producto.id}')"><i class="bi bi-x-lg"></i></button></td>
            `;
                tablaResumen.appendChild(row);
            }

            function actualizarFilaResumen(id, producto) {
                const fila = tablaResumen.querySelector(`tr[data-id="${id}"]`);
                if (fila) {
                    fila.querySelector(".col-cantidad").textContent = producto.cantidad;
                    fila.querySelector(".col-subtotal").textContent = `$${(producto.cantidad * producto.precio).toFixed(2)}`;
                }
            }

            window.eliminarProducto = function (id) {
                const index = productosSeleccionados.findIndex(p => p.id === id);
                if (index !== -1) {
                    const producto = productosSeleccionados[index];

                    // Si es de protocolo, volver a habilitar el botón en la lista
                    if (producto.esProtocolo) {
                        const botones = document.querySelectorAll("#listaTratamientosProtocolo button");
                        botones.forEach(btn => {
                            if (
                                btn.textContent.includes("Añadido") &&
                                btn.closest("li").textContent.includes(producto.text)
                            ) {
                                btn.disabled = false;
                                btn.innerHTML = ' Agregar';
                                btn.classList.remove("btn-success");
                                btn.classList.add("btn-outline-primary");
                            }
                        });
                    }

                    productosSeleccionados.splice(index, 1);
                }

                const badge = contenedorChips.querySelector(`[data-id="${id}"]`);
                if (badge) badge.remove();

                const row = tablaResumen.querySelector(`tr[data-id="${id}"]`);
                if (row) row.remove();

                actualizarTotal();
            };


            function actualizarTotal() {
                const total = productosSeleccionados.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
                totalTransaccion.textContent = `$${total.toFixed(2)}`;
            }

            function limpiarModal() {
                inputPaciente.value = "";
                panelProtocolo.style.display = "none";
                listaTratamientosProtocolo.innerHTML = "";
                productosSeleccionados.length = 0;
                contenedorChips.innerHTML = "";
                tablaResumen.innerHTML = "";
                totalTransaccion.textContent = "$0";
            }


            const modalElement = document.getElementById("modalNuevaTransaccion");
            modalElement.addEventListener("hidden.bs.modal", function () {
                limpiarModal();
            });

            inputPaciente.addEventListener("input", function () {
                // Limpiar tabla, productos, resumen, etc.
                productosSeleccionados.length = 0;
                contenedorChips.innerHTML = "";
                tablaResumen.innerHTML = "";
                totalTransaccion.textContent = "$0";

                // También limpiar protocolo anterior
                listaTratamientosProtocolo.innerHTML = "";
                panelProtocolo.style.display = "none";

                const nombre = this.value.trim().toLowerCase();
                if (protocolosSimulados[nombre]) {
                    panelProtocolo.style.display = "block";

                    protocolosSimulados[nombre].forEach((tratamiento) => {
                        const li = document.createElement("li");
                        li.className = "list-group-item d-flex justify-content-between align-items-center";
                        li.innerHTML = `
                ${tratamiento.nombre}
                <div>
                    ${tratamiento.realizado
                                ? '<i class="bi bi-check-circle-fill text-success" title="Realizado"></i>'
                                : `<button class="btn btn-sm btn-outline-primary" onclick="agregarDeProtocolo('${tratamiento.nombre}', ${tratamiento.precio})">Agregar</button>`}
                </div>
            `;
                        listaTratamientosProtocolo.appendChild(li);
                    });
                }
            });




        });

