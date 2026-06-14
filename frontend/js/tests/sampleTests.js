/**
 * Función para asegurar independencia de los tests de samples 
 * y no depender de otro test para tener un token de sesión válido
 */
 async function okLogin() {
    // 1. Login como productor (pepe) para obtener un token válido
     const response = await fetch('/api/auth/login', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ username: 'pepe', password: '12345' }) // Usamos pepe hardcodeado
     });
     const data = await response.json();
     // Guardamos el token para tests de samples
     localStorage.setItem('test_token', data.token);
 }

/**
 * Test: GET /api/samples/my-samples
 */
 testUtils.createTestButton("Test Listar Mis Samples", async (btn) => {
    // 1. Asegurar y guardar una sesión válida
    await okLogin();
    const token = localStorage.getItem('test_token');
    
    // 2. Realizar la petición
    const response = await fetch('/api/samples/my-samples', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    testUtils.log(data);
    if (response.ok) testUtils.setSuccess(btn);
});

/**
 * Test: POST /api/samples/upload (Simulado)
 */
testUtils.createTestButton("Test Subir Sample (Simulado)", async (btn) => {
    // 1. Asegurar y guardar una sesión válida
    await okLogin();
    const token = localStorage.getItem('test_token');
    
    // Creamos un FormData
    const formData = new FormData();
    formData.append('display_name', 'Test Loop Pedagogico');
    formData.append('category', 'Drums');
    formData.append('bpm', '120');

    // Simulamos un archivo WAV (binario vacío para la prueba)
    const blob = new Blob(["Simulated Audio Content"], { type: 'audio/wav' });
    formData.append('audioFile', blob, 'DRUM_LOOP_01.wav');

    const response = await fetch('/api/samples/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });

    const data = await response.json();
    testUtils.log(data);
    if (response.ok) testUtils.setSuccess(btn);
});

/**
 * Test 8: Seguridad - Eliminacion de Recurso Ajeno / IDOR.
 */
testUtils.createTestButton("Test 8 IDOR: Borrar Sample Ajeno", async (btn) => {
    await okLogin();
    const ownerToken = localStorage.getItem('test_token');

    const attackerUsername = 'intruso_test_8'+ Date.now();
    const attackerPassword = '123456';

    await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: attackerUsername,
            password: attackerPassword
        })
    });

    const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: attackerUsername,
            password: attackerPassword
        })
    });

    const loginData = await loginResponse.json();
    const attackerToken = loginData.token;

    const formData = new FormData();
    formData.append('display_name', 'Sample IDOR Test');
    formData.append('category', 'Drums');
    formData.append('bpm', '120');

    const blob = new Blob(["Simulated Audio Content"], { type: 'audio/wav' });
    formData.append('audioFile', blob, 'IDOR_TEST_8.wav');

    const uploadResponse = await fetch('/api/samples/upload', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${ownerToken}`
        },
        body: formData
    });

    const uploadedSample = await uploadResponse.json();

    const deleteResponse = await fetch(`/api/samples/${uploadedSample.id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${attackerToken}`
        }
    });

    const data = await deleteResponse.json();
    testUtils.log(data, deleteResponse.status !== 403);

    if (
        deleteResponse.status === 403 &&
        data.message === "No tienes permisos para alterar este archivo"
    ) {
        testUtils.setSuccess(btn);
    } else {
        throw new Error("No se bloqueo correctamente el borrado de un sample ajeno");
    } // <-- Acá faltaba la llave de cierre del test de tu compañero
});

/**
 * Test: DELETE /api/samples/:id con ID inexistente
 * Validación: debe responder 404 y mostrar mensaje de borrado fantasma
 */
testUtils.createTestButton("Test Borrado Fantasma - Sample Inexistente", async (btn) => {
    // 1. Asegurar y guardar una sesión válida
    await okLogin();
    const token = localStorage.getItem('test_token');

    // 2. Intentar eliminar un sample que no existe
    const response = await fetch('/api/samples/99999', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    testUtils.log(data);

    // 3. Validar HTTP 404 y mensaje esperado
    if (
        response.status === 404 &&
        data.message === "El registro no existe o ya fue eliminado"
    ) {
        testUtils.setSuccess(btn);
    } else {
        throw new Error("El test de borrado fantasma falló");
    } // <-- Acá también faltaba la llave de cierre
});


/**
 * Test Consigna 6: Validación de coherencia del BPM (HTTP 400)
 */
testUtils.createTestButton("Test Consigna 6: BPM Inválido", async (btn) => {
    // 1. Aseguramos y guardarmos una sesión válida
    await okLogin();
    const token = localStorage.getItem('test_token');
    
    // 2. Creamos un FormData con el error a propósito
    const formData = new FormData();
    formData.append('display_name', 'Test BPM Roto');
    formData.append('category', 'Drums');
    
    // Le pasamos un bpo en forma de texto en lugar de un numero
    formData.append('bpm', 'ciento veinte'); 

    // Simulamos un archivo WAV (binario vacío para la prueba)
    const blob = new Blob(["Simulated Audio Content"], { type: 'audio/wav' });
    formData.append('audioFile', blob, 'DRUM_TEST.wav');

    try {
        // 3. Realizamos la petición al backend
        const response = await fetch('/api/samples/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        const data = await response.json();
        
        testUtils.log(data); 

        // 4. Verificamos que el servidor haya rebotado la petición correctamente
        if (response.status === 400 && data.message === "BPM inválido. Ingrese un valor numérico correcto") {
            testUtils.setSuccess(btn); 
    
            // Reflejamos el error en el modal de W3.CSS, tal como exige la consigna
            if (typeof showModal === 'function') {
                showModal('Validación Exitosa (Backend rebotó el sample)', data.message);
            }
        } else {
            // Si el backend lo aceptó (201) o devolvió otro error, el test falla
            testUtils.log({ 
                error: "Fallo: El backend no devolvió el 400 o el mensaje no coincide.", 
                statusRecibido: response.status 
            });
        }
    } catch (error) {
        testUtils.log({ error: "Excepción en el test: " + error.message });
    }
});