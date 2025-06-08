document.addEventListener('DOMContentLoaded', function () {
        const logoutBtn = document.getElementById('logoutBtnCustom');

        if (logoutBtn) {
            logoutBtn.addEventListener('click', function () {
                // Eliminar el token del localStorage
                localStorage.removeItem('jwt_token');

                // Redirigir al login
                window.location.href = '/login.html';
            });
        }
    });