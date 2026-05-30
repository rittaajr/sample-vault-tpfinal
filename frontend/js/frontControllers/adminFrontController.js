/**
*    Project     : Sample Vault
*    Author      : Tecnologías Informáticas B - Facultad de Ingeniería - UNMdP
*    License     : http://www.gnu.org/licenses/gpl.txt  GNU GPL 3.0
*    Date        : Marzo 2026
*/

/**
 * adminFrontController.js
 * Gestión de la interfaz de administración (Usuarios)
 */

// Al cargar la página, cargar todos los usuarios con sus datos
document.addEventListener('DOMContentLoaded', loadUsers);

async function loadUsers() {
    try {
        // Asumimos un endpoint GET /api/admin/users que crearemos en el backend
        const users = await apiService.request('/admin/users', 'GET');
        renderUsersTable(users);
    } catch (error) {
        // Usamos el componente modal para errores de acceso
        showModal('Acceso denegado', error.message);
        window.location.href = '/login';
    }
}

/**
 * Renderiza la tabla de usuarios sin utilizar innerHTML para mayor seguridad
 */
function renderUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    
    // Limpiamos la tabla de forma eficiente y segura
    tbody.replaceChildren();

    users.forEach(u => {
        const row = document.createElement('tr');

        // Celda ID
        const tdId = document.createElement('td');
        tdId.textContent = u.id;

        // Celda Username (usando <b> para resaltar)
        const tdUser = document.createElement('td');
        const b = document.createElement('b');
        b.textContent = u.username;
        tdUser.appendChild(b);

        // Celda Rol (con estilos de W3.CSS)
        const tdRole = document.createElement('td');
        const spanRole = document.createElement('span');
        spanRole.className = "w3-tag w3-blue";
        spanRole.textContent = u.role;
        tdRole.appendChild(spanRole);

        // Celda Fecha de Registro
        const tdDate = document.createElement('td');
        tdDate.textContent = new Date(u.created_at).toLocaleDateString();

        // Celda Acciones (Botón de baneo)
        const tdActions = document.createElement('td');
        const btnBan = document.createElement('button');
        btnBan.className = "w3-button w3-red w3-tiny";
        btnBan.textContent = "Elminar usuario y sus samples";
        
        // Evento nativo en lugar de onclick inline
        btnBan.addEventListener('click', () => banUser(u.id));
        
        tdActions.appendChild(btnBan);

        // Construcción de la fila inyectando todos los nodos
        row.append(tdId, tdUser, tdRole, tdDate, tdActions);
        
        // Inyección en el DOM
        tbody.appendChild(row);
    });
}

/**
 * Función para borrar usuarios (borrado lógico/físico en el sistema)
 */
async function banUser(id) {
    // 1. Confirmación de seguridad
    if (!confirm('¿Estás seguro de borrar a este usuario? Se borrarán todos sus samples de forma permanente.'))
    {
        return;
    }

    try
    {
        // 2. Llamada al backend
        await apiService.request(`/admin/users/${id}`, 'DELETE');
        
        // 3. Notificación y refresco de la tabla
        showModal('Éxito', 'Usuario eliminado con éxito');
        loadUsers(); 
    }
    catch (error)
    {
        showModal('Error al borrar usuario', error.message);
    }
}