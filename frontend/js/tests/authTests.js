/**
 * Test: POST /api/auth/login
 */
 testUtils.createTestButton("Test Login Correcto (Pepe y 12345)", async (btn) => {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'pepe', password: '12345' }) // Usamos pepe hardcodeado
    });
    
    const data = await response.json();
    testUtils.log(data);

    if (response.ok) {
        testUtils.setSuccess(btn);
    }
});

testUtils.createTestButton("Test Login - Password Incorrecto (Pepe y 123)", async (btn) => {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'pepe', password: '123' }) // Usamos pepe hardcodeado
    });
    
    const data = await response.json();
    testUtils.log(data);

    if (response.status === 401) {
        testUtils.setSuccess(btn);
    }
});

testUtils.createTestButton("Test Login - Usuario Incorrecto (Juan y 12345)", async (btn) => {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'pepe', password: '123' }) // Usamos pepe hardcodeado
    });
    
    const data = await response.json();
    testUtils.log(data);

    if (response.status === 401) {
        testUtils.setSuccess(btn);
    }
});

testUtils.createTestButton("Test Registro - Contraseña Corta (HTTP 400)", async (btn) => {
    // Se envia una contraseña de solo 3 caracteres, lo que debería provocar un error 400
    const response = await fetch('/api/auth/register', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'rittajulian', password: '123' }) 
    });
    
    const data = await response.json();
    testUtils.log(data);

    
    if (response.status === 400) {
        
        testUtils.setSuccess(btn); 
        
        
        const modalText = document.getElementById('modal-error-text');
        const modal = document.getElementById('errorModal');
        
        if (modalText && modal) {
            modalText.innerText = data.error || "La contraseña es demasiado corta";
            modal.style.display = 'block';
        }
    }
});