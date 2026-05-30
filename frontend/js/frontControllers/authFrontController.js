/**
*    Project     : Sample Vault
*    Author      : Tecnologías Informáticas B - Facultad de Ingeniería - UNMdP
*    License     : http://www.gnu.org/licenses/gpl.txt  GNU GPL 3.0
*    Date        : Marzo 2026
*/

const loginForm = document.getElementById('loginForm');
if (loginForm) 
{
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evitar que la página se recargue

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try 
        {
            // Llamada al endpoint de login a través de nuestro service
            const data = await apiService.request('/auth/login', 'POST', { username, password });
            
            // Guardar token y rol en localStorage
            authHelper.saveSession(data.token, data.role)

            // Redirigir según el rol
            if (data.role === 'admin') 
            {
                window.location.href = '/admin-dashboard';
            }
            else
            {
                window.location.href = '/producer-dashboard';
            }

        }
        catch (error)
        {
            // Usar el componente modal para mostrar el error del backend
            showModal('Error de Acceso', error.message);
        }
    });
}

// Lógica para el formulario de REGISTRO
const registerForm = document.getElementById('registerForm');
if (registerForm) 
{
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try 
        {
            await apiService.request('/auth/register', 'POST', { username, password });
            // En lugar de alert...
            showModal('¡Éxito!', 'Usuario creado. Ahora puedes iniciar sesión.');
            // Esperar un momento o usar el botón del modal para redirigir
            setTimeout(() => { window.location.href = '/login'; }, 2000);
        }
        catch (error)
        {
            showModal('Error de Registro', error.message);
        }
    });
}