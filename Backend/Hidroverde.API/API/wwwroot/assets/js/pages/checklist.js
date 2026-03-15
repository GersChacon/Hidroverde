let currentEmpleadoId = 1;
const API_BASE = '/api/checklist';

// Helper functions
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// API caller - throws errors if fails
async function callApi(url, options = {}) {
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'X-Empleado-Id': currentEmpleadoId
        },
        ...options
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
        return { success: true, data: null };
    }

    const data = await response.json().catch(() => ({}));
    return { success: true, data };
}

// Delete task
async function deleteTask(taskId) {
    console.log('🗑️ deleteTask() called for task', taskId);

    if (!confirm('¿Eliminar esta tarea?')) return;

    try {
        await callApi(`${API_BASE}/tasks/${taskId}`, {
            method: 'DELETE'
        });
        alert('✅ Tarea eliminada de la base de datos');
        loadTasks();
    } catch (err) {
        alert('❌ Error al eliminar: ' + err.message);
        console.error(err);
    }
}

// Open modal for new task
function abrirModalNuevaTarea() {
    console.log('📝 Opening new task modal');

    document.getElementById('nuevaDescripcion').value = '';
    document.getElementById('nuevaResponsable').value = '';
    document.getElementById('nuevaAsignadoId').value = currentEmpleadoId;
    document.getElementById('nuevaOrden').value = '10';
    document.getElementById('nuevaEsCritica').value = 'false';
    document.getElementById('nuevaTareaMsg').textContent = '';

    document.getElementById('modalNuevaTarea').hidden = false;
}

function cerrarModalNuevaTarea() {
    document.getElementById('modalNuevaTarea').hidden = true;
}

// Save new task
async function guardarNuevaTarea() {
    console.log('💾 Saving new task');

    const descripcion = document.getElementById('nuevaDescripcion').value.trim();
    const responsable = document.getElementById('nuevaResponsable').value.trim();
    const asignadoId = parseInt(document.getElementById('nuevaAsignadoId').value);
    const orden = parseInt(document.getElementById('nuevaOrden').value);
    const esCritica = document.getElementById('nuevaEsCritica').value === 'true';

    if (!descripcion) {
        document.getElementById('nuevaTareaMsg').textContent = '❌ La descripción es obligatoria';
        return;
    }
    if (!responsable) {
        document.getElementById('nuevaTareaMsg').textContent = '❌ El responsable es obligatorio';
        return;
    }

    const nuevaTarea = {
        description: descripcion,
        responsible: responsable,
        assignedUserId: asignadoId,
        orden: orden,
        esCritica: esCritica,
        isCompleted: false
    };

    console.log('📦 New task:', nuevaTarea);

    try {
        await callApi(`${API_BASE}/tasks`, {
            method: 'POST',
            body: JSON.stringify(nuevaTarea)
        });

        alert('✅ Tarea creada exitosamente en la base de datos');
        cerrarModalNuevaTarea();
        loadTasks();
    } catch (err) {
        alert('❌ Error al crear tarea: ' + err.message);
        console.error(err);
    }
}

// Mark task as complete
async function markComplete(taskId) {
    console.log('✅ markComplete() called for task', taskId);

    if (!confirm('¿Marcar esta tarea como completada?')) return;

    try {
        await callApi(`${API_BASE}/task/${taskId}/complete`, {
            method: 'PATCH',
            body: JSON.stringify({
                taskId: taskId,
                empleadoId: currentEmpleadoId,
                timestamp: new Date().toISOString()
            })
        });

        alert('✅ Tarea marcada como completada en la base de datos');
        loadTasks();
    } catch (err) {
        alert('❌ Error al completar tarea: ' + err.message);
        console.error(err);
    }
}

// Open evidence modal
function openEvidenceModal(taskId) {
    console.log('📎 openEvidenceModal() called for task', taskId);

    document.getElementById('evidenceTaskId').value = taskId;
    document.getElementById('evidenceFile').value = '';
    document.getElementById('evidenceNotes').value = '';
    document.getElementById('evidenceModal').hidden = false;
}

// Upload evidence
async function uploadEvidence() {
    console.log('📤 uploadEvidence() called');

    const taskId = document.getElementById('evidenceTaskId').value;
    const fileInput = document.getElementById('evidenceFile');
    const notes = document.getElementById('evidenceNotes').value;

    if (!fileInput.files[0]) {
        alert('Seleccione un archivo.');
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    if (notes) formData.append('notes', notes);

    try {
        const response = await fetch(`/api/evidence/upload?taskId=${taskId}`, {
            method: 'POST',
            headers: { 'X-Empleado-Id': currentEmpleadoId },
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        const data = await response.json();
        alert('✅ Evidencia subida a la base de datos. ID: ' + (data.evidenceId || 'OK'));
        document.getElementById('evidenceModal').hidden = true;
        loadTasks();
    } catch (err) {
        alert('❌ Error al subir evidencia: ' + err.message);
        console.error(err);
    }
}

// Load tasks from database only
async function loadTasks() {
    console.log('🔄 loadTasks() called');

    const empleadoId = document.getElementById('empleadoId').value;
    currentEmpleadoId = empleadoId;

    const tbody = document.getElementById('checklistTableBody');
    tbody.innerHTML = '<tr><td colspan="5" class="muted">Cargando...</td></tr>';

    try {
        const result = await callApi(`${API_BASE}/today?empleadoId=${empleadoId}`);
        const tasks = result.data || [];

        console.log('✅ Tasks loaded from database:', tasks.length);
        renderTasks(tasks);
    } catch (err) {
        console.error('❌ Failed to load tasks:', err);
        tbody.innerHTML = `<tr><td colspan="5" class="danger">Error al cargar tareas: ${err.message}</td></tr>`;
    }
}

// Render tasks in table
function renderTasks(tasks) {
    console.log('🎨 renderTasks() called with', tasks?.length || 0, 'tasks');

    const tbody = document.getElementById('checklistTableBody');
    if (!tbody) return;

    if (!tasks || tasks.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="muted">No hay tareas para hoy.</td></tr>';
        return;
    }

    tbody.innerHTML = tasks.map(task => {
        const statusClass = task.isCompleted ? 'badge-success' : 'badge-warning';
        const statusText = task.isCompleted ? 'Completada' : 'Pendiente';

        return `
            <tr>
                <td>${escapeHtml(task.taskId)}</td>
                <td>${escapeHtml(task.description)}</td>
                <td>${escapeHtml(task.responsible || '—')}</td>
                <td><span class="badge ${statusClass}">${statusText}</span></td>
                <td class="right">
                    ${!task.isCompleted ?
                `<button class="btn btn-small btn-complete" data-id="${task.taskId}">Completar</button>`
                : ''}
                    <button class="btn btn-small btn-upload" data-id="${task.taskId}">Subir evidencia</button>
                    <button class="btn btn-small btn-danger btn-delete" data-id="${task.taskId}">Eliminar</button>
                </td>
            </tr>
        `;
    }).join('');

    // Attach event listeners
    document.querySelectorAll('.btn-complete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = e.target.dataset.id;
            markComplete(taskId);
        });
    });

    document.querySelectorAll('.btn-upload').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = e.target.dataset.id;
            openEvidenceModal(taskId);
        });
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = e.target.dataset.id;
            deleteTask(taskId);
        });
    });
}

// Initialize the page
export function init() {
    console.log('🚀 Initializing checklist with REAL DATABASE...');

    // Load tasks immediately
    loadTasks();

    // Event listeners
    document.getElementById('refreshTasks')?.addEventListener('click', (e) => {
        e.preventDefault();
        loadTasks();
    });

    document.getElementById('btnNuevaTarea')?.addEventListener('click', (e) => {
        e.preventDefault();
        abrirModalNuevaTarea();
    });

    document.getElementById('closeNuevaTareaModal')?.addEventListener('click', (e) => {
        e.preventDefault();
        cerrarModalNuevaTarea();
    });

    document.getElementById('btnGuardarNuevaTarea')?.addEventListener('click', (e) => {
        e.preventDefault();
        guardarNuevaTarea();
    });

    document.getElementById('uploadEvidenceBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        uploadEvidence();
    });

    document.getElementById('closeEvidenceModal')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('evidenceModal').hidden = true;
    });
}

// Auto-run if loaded directly
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}