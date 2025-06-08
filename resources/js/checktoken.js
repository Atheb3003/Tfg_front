document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('jwt_token');

      if (!token) {
        console.log("Token no encontrado. Redirigiendo...");
        window.location.href = '/login.html'; 
    } 
});
