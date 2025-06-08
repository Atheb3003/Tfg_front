document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault(); // Evita el envío del formulario tradicional

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        const loginPayload = {
            username: email, // Asegúrate que en backend se espera "username"
            password: password
        };

        try {
            const response = await fetch('http://localhost:8080/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginPayload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                loginError.textContent = errorData.message || 'Credenciales inválidas.';
                loginError.classList.remove('d-none');
                return;
            }

            const result = await response.json();

            localStorage.setItem('jwt_token', result.data.token);

            window.location.href = '/contactos.html'; // Redirige directamente

        } catch (error) {
            console.error('Error de red:', error);
            loginError.textContent = 'No se pudo conectar con el servidor.';
            loginError.classList.remove('d-none');
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('jwt_token');

    if (token) {
        window.location.href = '/contactos.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        const loginPayload = {
            username: username,
            password: password
        };

        try {
            const response = await fetch('http://localhost:8080/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginPayload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                loginError.textContent = errorData.message || 'Credenciales inválidas.';
                loginError.classList.remove('d-none');
                return;
            }

            const result = await response.json();
            localStorage.setItem('jwt_token', result.data.token);

            window.location.href = '/contactos.html';

        } catch (error) {
            console.error('Error de red:', error);
            loginError.textContent = 'No se pudo conectar con el servidor.';
            loginError.classList.remove('d-none');
        }
    });
});


