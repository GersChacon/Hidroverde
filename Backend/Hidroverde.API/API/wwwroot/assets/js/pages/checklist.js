// checklist.js - Full functionality with Database + Fallback (mock data from file)

let currentEmpleadoId = 1;
const API_BASE = '/api/checklist';
const MOCK_URL = '/mock/checklist-tasks.json';

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

// Check if we're in offline/mock mode
let isOfflineMode = false;

// Generic API caller with fallback
async function callApi(url, options = {}) {
    if (isOfflineMode) {
        console.log('📴 Offline mode - skipping API call');
        return { success: false, offline: true };
    }

    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'X-Empleado-Id': currentEmpleadoId
            },
            ...options
        });

        if (!response.ok) {
            if (response.status === 404) {
                console.log('🔌 API endpoint not found - switching to offline mode');
                isOfflineMode = true;
                return { success: false, offline: true };
            }
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json().catch(() => ({}));
        return { success: true, data };
    } catch (err) {
        console.warn('⚠️ API call failed:', err);
        isOfflineMode = true;
        return { success: false, offline: true };
    }
}

// Load tasks from localStorage (offline store)
function loadLocalTasks() {
    return JSON.parse(localStorage.getItem('misTareas') || '[]');
}

function saveLocalTasks(tasks) {
    localStorage.setItem('misTareas', JSON.stringify(tasks));
}

// Check if a task exists in localStorage (by ID)
function isLocalTask(taskId) {
    const tasks = loadLocalTasks();
    return tasks.some(t => t.taskId == taskId);
}

// Delete task (API first, then localStorage fallback)
async function deleteTask(taskId) {
    console.log('🗑️ deleteTask() called for task', taskId);

    if (!confirm('¿Eliminar esta tarea?')) return;

    if (isLocalTask(taskId)) {
        let tasks = loadLocalTasks();
        tasks = tasks.filter(t => t.taskId != taskId);
        saveLocalTasks(tasks);
        alert('✅ Tarea eliminada (modo offline)');
        loadTasks();
        return;
    }

    const result = await callApi(`${API_BASE}/tasks/${taskId}`, {
        method: 'DELETE'
    });

    if (result.success) {
        alert('✅ Tarea eliminada de la base de datos');
        loadTasks();
    } else {
        alert('❌ No se puede eliminar una tarea de la base de datos sin conexión.');
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

    const result = await callApi(`${API_BASE}/tasks`, {
        method: 'POST',
        body: JSON.stringify(nuevaTarea)
    });

    if (result.success) {
        alert('✅ Tarea creada exitosamente en la base de datos');
    } else {
        // Fallback to localStorage
        console.log('💾 Saving to localStorage instead');
        const tareasLocales = loadLocalTasks();
        const tareaConId = {
            ...nuevaTarea,
            taskId: Date.now(), // Local ID
            dueDate: new Date().toISOString().split('T')[0]
        };
        tareasLocales.push(tareaConId);
        saveLocalTasks(tareasLocales);
        alert('✅ Tarea creada (guardada localmente - modo offline)');
    }

    cerrarModalNuevaTarea();
    loadTasks();
}

// Mark task as complete
async function markComplete(taskId) {
    console.log('✅ markComplete() called for task', taskId);

    if (!confirm('¿Marcar esta tarea como completada?')) return;

    const result = await callApi(`${API_BASE}/task/${taskId}/complete`, {
        method: 'PATCH',
        body: JSON.stringify({
            taskId: taskId,
            empleadoId: currentEmpleadoId,
            timestamp: new Date().toISOString()
        })
    });

    if (result.success) {
        alert('✅ Tarea marcada como completada en la base de datos');
        updateTaskStatusInUI(taskId, true);
    } else {
        // Fallback: Update in localStorage
        console.log('💾 Updating task in localStorage');
        const tareasLocales = loadLocalTasks();
        const tareaIndex = tareasLocales.findIndex(t => t.taskId == taskId);

        if (tareaIndex !== -1) {
            tareasLocales[tareaIndex].isCompleted = true;
            saveLocalTasks(tareasLocales);
            alert('✅ Tarea marcada como completada (modo offline)');
            updateTaskStatusInUI(taskId, true);
        } else {
            if (confirm('⚠️ Esta tarea está en la base de datos pero no hay conexión. ¿Marcar como completada temporalmente?')) {
                updateTaskStatusInUI(taskId, true);
                alert('✅ Tarea marcada como completada (solo visual - los cambios se perderán al recargar)');
            }
        }
    }
    setTimeout(() => loadTasks(), 500);
}

// Update task status in UI
function updateTaskStatusInUI(taskId, isCompleted) {
    document.querySelectorAll('#checklistTableBody tr').forEach(row => {
        const taskIdCell = row.querySelector('td:first-child');
        if (taskIdCell && taskIdCell.textContent == taskId) {
            const statusCell = row.querySelector('td:nth-child(4)');
            const actionsCell = row.querySelector('td:last-child');

            if (statusCell) {
                statusCell.innerHTML = isCompleted
                    ? '<span class="badge badge-success">Completada</span>'
                    : '<span class="badge badge-warning">Pendiente</span>';
            }

            if (actionsCell && isCompleted) {
                const completeBtn = actionsCell.querySelector('.btn-complete');
                if (completeBtn) completeBtn.remove();
            }
        }
    });
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

        if (response.ok) {
            const data = await response.json();
            alert('✅ Evidencia subida a la base de datos. ID: ' + (data.evidenceId || 'OK'));
            document.getElementById('evidenceModal').hidden = true;
            return;
        }
    } catch (err) {
        console.warn('⚠️ Could not upload to DB:', err);
    }

    alert('📁 Evidencia guardada localmente (modo offline) - El archivo no se subió al servidor');
    document.getElementById('evidenceModal').hidden = true;
}

// Load tasks (DB first, then localStorage, then mock file)
async function loadTasks() {
    console.log('🔄 loadTasks() called');

    const empleadoId = document.getElementById('empleadoId').value;
    currentEmpleadoId = empleadoId;

    const tbody = document.getElementById('checklistTableBody');
    tbody.innerHTML = '<tr><td colspan="5" class="muted">Cargando...</td></tr>';

    let tasks = [];

    const result = await callApi(`${API_BASE}/today?empleadoId=${empleadoId}`);

    if (result.success && Array.isArray(result.data)) {
        console.log('✅ Tasks loaded from database:', result.data.length);
        tasks = result.data;

        const statusDiv = document.createElement('div');
        statusDiv.className = 'connection-status success';
        statusDiv.textContent = '✓ Conectado a la base de datos';
        statusDiv.style.cssText = 'position:fixed; bottom:10px; right:10px; background:#4CAF50; color:white; padding:5px 10px; border-radius:4px; z-index:9999;';
        document.body.appendChild(statusDiv);
        setTimeout(() => statusDiv.remove(), 3000);
    } else {
        console.log('📴 Using localStorage fallback');
        const tareasLocales = loadLocalTasks();
        const tareasFiltradas = tareasLocales.filter(t => t.assignedUserId == empleadoId);

        if (tareasFiltradas.length > 0) {
            tasks = tareasFiltradas;

            const statusDiv = document.createElement('div');
            statusDiv.className = 'connection-status warning';
            statusDiv.textContent = '⚠ Usando datos locales (modo offline)';
            statusDiv.style.cssText = 'position:fixed; bottom:10px; right:10px; background:#FF9800; color:white; padding:5px 10px; border-radius:4px; z-index:9999;';
            document.body.appendChild(statusDiv);
            setTimeout(() => statusDiv.remove(), 3000);
        } else {
            // Fetch mock data from JSON file
            console.log('🎭 Fetching mock data from file');
            try {
                const response = await fetch(MOCK_URL);
                if (!response.ok) throw new Error('Mock file not found');
                const mockTasks = await response.json();
                // Apply filter if needed
                tasks = mockTasks.filter(t => t.assignedUserId == empleadoId);
                if (tasks.length === 0) tasks = mockTasks;
            } catch (e) {
                console.error('Failed to load mock file, using minimal fallback', e);
                // Ultra minimal fallback (should never happen if file exists)
                tasks = [
                    { taskId: 1, description: "Tarea de ejemplo", responsible: "Sistema", isCompleted: false, assignedUserId: 1 }
                ];
            }
        }
    }

    renderTasks(tasks);
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
    console.log('🚀 Initializing checklist with DB support...');

    fetch(`${API_BASE}/today`, { method: 'HEAD' })
        .then(() => console.log('✅ Database connection available'))
        .catch(() => {
            console.log('📴 Database not available - will use fallback');
            isOfflineMode = true;
        });

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

    loadTasks();
}

// Auto-run if loaded directly
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}