document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('jwt_token');

    if (!token) {
        console.log("Token no encontrado. Redirigiendo...");
        window.location.href = '/login.html';
        return;
    }

    const form = document.querySelector('.formCreateContact form');

    // Referencias al modal
    const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    const modalMessage = document.getElementById('modalMessage');
    const redirectBtn = document.getElementById('modalRedirectBtn');

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const rawBirthDate = document.getElementById('birthDate')?.value;
        const birth_date = rawBirthDate && rawBirthDate.trim() !== "" ? rawBirthDate : null;

        const data = {
            name: document.getElementById('name')?.value.trim() || "",
            surname: document.getElementById('surname')?.value.trim() || "",
            nif: document.getElementById('nif')?.value.trim() || "",
            birth_date: birth_date,
            occupation: document.getElementById('occupation')?.value.trim() || "",
            country: document.getElementById('country')?.value.trim() || "",
            province: document.getElementById('province')?.value.trim() || "",
            town: document.getElementById('town')?.value.trim() || "",
            direction: document.getElementById('direction')?.value.trim() || "",
            telephone_number_1: document.getElementById('telephoneNumber1')?.value.trim() || "",
            telephone_number_2: document.getElementById('telephoneNumber2')?.value.trim() || "",
            email: document.getElementById('email')?.value.trim() || "",
            observations: document.getElementById('observations')?.value.trim() || "",
            is_visible: true
        };

        console.log('Payload enviado:', data);

        try {
            const response = await fetch('http://localhost:8080/contacts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok && result.status === 'created') {
                const idContacto = result.data.id_contact;

                modalMessage.innerHTML = `Contacto creado correctamente. ID interno: <strong>${idContacto}</strong>`;
                confirmationModal.show();

                redirectBtn.onclick = () => {
                    window.location.href = `paginaContacto.html?id=${idContacto}`;
                };

                form.reset();
            } else {
                alert('❌ Error al crear contacto: ' + (result.message || 'Respuesta inesperada'));
            }

        } catch (error) {
            console.error('❌ Error al enviar:', error);
            alert('❌ Error de red o del servidor.');
        }
    });
});
