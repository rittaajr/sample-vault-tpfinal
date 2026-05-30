/**
*    Project     : Sample Vault
*    Author      : Tecnologías Informáticas B - Facultad de Ingeniería - UNMdP
*    License     : http://www.gnu.org/licenses/gpl.txt  GNU GPL 3.0
*    Date        : Marzo 2026
*/

/**
 * Utilidad para gestionar la persistencia de la sesión
 * Centraliza el uso de localStorage/sessionStorage
 */
 const authHelper = {
    /**
     * Se puede cambiar 'localStorage' por 'sessionStorage' aquí y afectará a toda la app
     * Cambiar a sessionStorage si se prefiere mayor seguridad en equipos compartidos
     */    
    storage: localStorage,

    saveSession(token, role) {
        this.storage.setItem('token', token);
        this.storage.setItem('role', role);
    },

    getToken() {
        return this.storage.getItem('token');
    },

    logout() {
        this.storage.clear();
        window.location.href = '/login';
    },

    // Buscamos botones de logout por clase para evitar onclick en HTML
    initLogoutButtons() {
        const logoutBtns = document.querySelectorAll('.btn-logout');
        logoutBtns.forEach(btn => {
            btn.addEventListener('click', () => this.logout());
        });
    }
};

// Inicializar escuchadores de logout al cargar
document.addEventListener('DOMContentLoaded', () => authHelper.initLogoutButtons());