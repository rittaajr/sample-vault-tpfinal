/**
*    Project     : Sample Vault
*    Author      : Tecnologías Informáticas B - Facultad de Ingeniería - UNMdP
*    License     : http://www.gnu.org/licenses/gpl.txt  GNU GPL 3.0
*    Date        : Marzo 2026
*/

// Al cargar la página, traer los samples del usuario
document.addEventListener('DOMContentLoaded', loadSamples);

async function loadSamples() {
    try {
        const samples = await apiService.request('/samples/my-samples', 'GET');
        renderSamplesTable(samples);
    } catch (error) {
        showModal('Error', 'No se pudieron cargar los samples: ' + error.message);
    }
}

function renderSamplesTable(samples) {
    const tbody = document.getElementById('samplesTableBody');
    tbody.replaceChildren(); // Limpia el contenido de forma eficiente

    samples.forEach(s => {
        const row = document.createElement('tr');

        // Celda Nombre
        const tdName = document.createElement('td');
        tdName.textContent = s.display_name;
        
        // Celda Categoría
        const tdCat = document.createElement('td');
        const spanCat = document.createElement('span');
        spanCat.className = 'w3-tag w3-round w3-black';
        spanCat.textContent = s.category;
        tdCat.appendChild(spanCat);

        // Celda BPM
        const tdBpm = document.createElement('td');
        tdBpm.textContent = s.bpm;

        // Celda Audio (Reproductor)
        const tdAudio = document.createElement('td');
        const audio = document.createElement('audio');
        audio.controls = true;
        const source = document.createElement('source');
        source.src = `http://localhost:3000${s.file_path}`;
        source.type = 'audio/mpeg';
        audio.appendChild(source);
        tdAudio.appendChild(audio);

        // Celda Acciones
        const tdActions = document.createElement('td');
        const btnDelete = document.createElement('button');
        btnDelete.className = 'w3-button w3-red w3-tiny w3-round';
        btnDelete.textContent = 'Borrar';
        btnDelete.addEventListener('click', () => deleteSample(s.id));
        tdActions.appendChild(btnDelete);

        // Armar fila
        row.append(tdName, tdCat, tdBpm, tdAudio, tdActions);
        tbody.appendChild(row);
    });
}

async function deleteSample(id) {
    if (!confirm('¿Estás seguro de eliminar este sonido?')) return;
    try {
        await apiService.request(`/samples/${id}`, 'DELETE');
        showModal('Eliminado', 'El sample ha sido borrado.');
        loadSamples();
    } catch (error) {
        showModal('Error', error.message);
    }
}

// Evento para el formulario de subida
const uploadForm = document.getElementById('uploadForm');
if (uploadForm) {
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('display_name', document.getElementById('display_name').value);
        formData.append('category', document.getElementById('category').value);
        formData.append('bpm', document.getElementById('bpm').value);
        formData.append('audioFile', document.getElementById('audioFile').files[0]);

        try {
            await apiService.request('/samples/upload', 'POST', formData, true);
            showModal('Éxito', 'Sample guardado.');
            uploadForm.reset();
            loadSamples();
        } catch (error) {
            showModal('Error al subir', error.message);
        }
    });
}