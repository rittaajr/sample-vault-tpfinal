/**
 * Función para asegurar independencia de los tests de samples 
 * y no depender de otro test para tener un token de sesión válido
 */
 async function okLogin()
 {
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


});

