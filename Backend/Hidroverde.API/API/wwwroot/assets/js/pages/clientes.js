// clientes.js – with offline localStorage fallback

const STORAGE_KEY = 'hidroverde_clientes';
const API_BASE = '/api/cliente';

// Default mock data (used only when both API and storage are empty)
const DEFAULT_MOCK = [
    { clienteId: 1, nombreRazonSocial: "Supermercados ABC", email: "contacto@abc.com", telefono: "8888-1111", direccion: "San José, Centro", tipoCliente: "Mayorista", identificadorUnico: "3-101-123456", activo: true },
    { clienteId: 2, nombreRazonSocial: "Restaurante El Jardín", email: "info@eljardin.com", telefono: "8888-2222", direccion: "Heredia, Barreal", tipoCliente: "Minorista", identificadorUnico: "2-404-789012", activo: true },
    { clienteId: 3, nombreRazonSocial: "Exportaciones CR", email: "ventas@exportcr.com", telefono: "8888-3333", direccion: "Alajuela, Zona Franca", tipoCliente: "Corporativo", identificadorUnico: "3-202-345678", activo: true }
];

let modoEdicion = false;
let clienteEditandoId = null;
let offlineMode = false;

// Helper functions (same as before)
function getElem(id) { return document.getElementById(id); }
function showModal(modalId, show) { const m = getElem(modalId); if (m) m.hidden = !show; }
function setModalTitle(modalId, title) { const t = getElem(modalId)?.querySelector('h3'); if (t) t.textContent = title; }
function getTrim(id) { return getElem(id)?.value.trim() ?? ''; }
function setValue(id, val) { const e = getElem(id); if (e) e.value = val ?? ''; }
function escapeHtml(unsafe) { return String(unsafe ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] || c); }

async function api(url, options = {}) {
    if (options.body && typeof options.body === 'object') options.body = JSON.stringify(options.body);
    try {
        const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return { data: await res.json().catch(() => ({})) };
    } catch (err) {
        offlineMode = true;
        throw err; // let caller handle
    }
}

// Load clients – try API, then storage, then default mock
async function cargarClientes() {
    const tbody = getElem("clientesTableBody");
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="8" class="muted">Cargando...</td></tr>`;

    offlineMode = false;
    try {
        const params = new URLSearchParams({
            tipoCliente: getElem("filtroTipo")?.value || '',
            ubicacion: getElem("filtroUbicacion")?.value || ''
        }).toString();
        const url = API_BASE + (params ? '?' + params : '');
        const { data } = await api(url);
        const clientes = Array.isArray(data) ? data : [];
        renderClientes(clientes);
        // update storage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(clientes));
    } catch {
        offlineMode = true;
        // load from storage or default mock
        let clientes = [];
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            clientes = JSON.parse(stored);
        } else {
            clientes = DEFAULT_MOCK;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(clientes));
        }
        // apply filters manually (since API didn't)
        const filtroTipo = getElem("filtroTipo")?.value?.toLowerCase();
        const filtroUbic = getElem("filtroUbicacion")?.value?.toLowerCase();
        if (filtroTipo || filtroUbic) {
            clientes = clientes.filter(c =>
                (!filtroTipo || c.tipoCliente.toLowerCase().includes(filtroTipo)) &&
                (!filtroUbic || c.direccion?.toLowerCase().includes(filtroUbic))
            );
        }
        renderClientes(clientes);
    }
}

function renderClientes(clientes) {
    const tbody = getElem("clientesTableBody");
    if (!tbody) return;
    if (!clientes.length) {
        tbody.innerHTML = `<tr><td colspan="8" class="muted">No hay clientes.</td></tr>`;
        return;
    }
    tbody.innerHTML = clientes.map(c => `
    <tr>
      <td>${escapeHtml(c.clienteId)}</td>
      <td>${escapeHtml(c.nombreRazonSocial)}</td>
      <td>${escapeHtml(c.email)}</td>
      <td>${escapeHtml(c.telefono || '-')}</td>
      <td>${escapeHtml(c.direccion || '-')}</td>
      <td>${escapeHtml(c.tipoCliente)}</td>
      <td>${escapeHtml(c.identificadorUnico || '-')}</td>
      <td>
        <button class="btn" data-action="edit" data-id="${c.clienteId}">Editar</button>
        <button class="btn danger" data-action="delete" data-id="${c.clienteId}">Eliminar</button>
      </td>
    </tr>
  `).join('');
    // re-attach listeners
    document.querySelectorAll("[data-action='edit']").forEach(btn =>
        btn.addEventListener('click', () => abrirModalEditar(btn.dataset.id)));
    document.querySelectorAll("[data-action='delete']").forEach(btn =>
        btn.addEventListener('click', () => eliminarCliente(btn.dataset.id)));
}

function abrirModalNuevo() {
    modoEdicion = false;
    clienteEditandoId = null;
    setModalTitle("modalCliente", "Nuevo cliente");
    limpiarFormModal();
    getElem("clienteMsg").textContent = "";
    showModal("modalCliente", true);
}

async function abrirModalEditar(id) {
    modoEdicion = true;
    clienteEditandoId = Number(id);
    setModalTitle("modalCliente", `Editar cliente #${id}`);
    limpiarFormModal();
    getElem("clienteMsg").textContent = "Cargando...";
    showModal("modalCliente", true);

    // Try API first, if offline load from storage
    try {
        const { data } = await api(`${API_BASE}/${id}`);
        fillForm(data);
        getElem("clienteMsg").textContent = "";
    } catch {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const clientes = JSON.parse(stored);
            const cliente = clientes.find(c => c.clienteId == id);
            if (cliente) fillForm(cliente);
        }
        getElem("clienteMsg").textContent = offlineMode ? "Modo offline - los cambios se guardarán localmente." : "";
    }
}

function fillForm(c) {
    setValue("clienteNombre", c.nombreRazonSocial);
    setValue("clienteEmail", c.email);
    setValue("clienteTelefono", c.telefono);
    setValue("clienteDireccion", c.direccion);
    setValue("clienteTipo", c.tipoCliente);
    setValue("clienteIdentificador", c.identificadorUnico);
}

function limpiarFormModal() {
    ["clienteNombre", "clienteEmail", "clienteTelefono", "clienteDireccion", "clienteIdentificador"].forEach(id => setValue(id, ""));
    const tipo = getElem("clienteTipo");
    if (tipo) tipo.value = "Minorista";
}

async function guardarCliente() {
    const payload = {
        nombreRazonSocial: getTrim("clienteNombre"),
        email: getTrim("clienteEmail"),
        telefono: getTrim("clienteTelefono"),
        direccion: getTrim("clienteDireccion"),
        tipoCliente: getElem("clienteTipo")?.value || "Minorista",
        identificadorUnico: getTrim("clienteIdentificador")
    };

    if (!payload.nombreRazonSocial || !payload.email || !payload.identificadorUnico) {
        getElem("clienteMsg").textContent = "Nombre, email e identificador son obligatorios.";
        return;
    }
    if (!payload.email.includes('@')) {
        getElem("clienteMsg").textContent = "Email inválido.";
        return;
    }

    if (offlineMode) {
        // Save to localStorage
        let clientes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        if (modoEdicion) {
            const index = clientes.findIndex(c => c.clienteId === clienteEditandoId);
            if (index !== -1) {
                clientes[index] = { ...payload, clienteId: clienteEditandoId, activo: true };
            } else {
                // fallback – assign new id
                payload.clienteId = Date.now();
                clientes.push(payload);
            }
        } else {
            payload.clienteId = Date.now();
            payload.activo = true;
            clientes.push(payload);
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(clientes));
        showModal("modalCliente", false);
        await cargarClientes(); // re-render
        return;
    }

    // Online mode
    const url = modoEdicion ? `${API_BASE}/${clienteEditandoId}` : API_BASE;
    const method = modoEdicion ? "PUT" : "POST";
    try {
        await api(url, { method, body: payload });
        showModal("modalCliente", false);
        await cargarClientes();
    } catch (err) {
        getElem("clienteMsg").textContent = err.message || "Error al guardar cliente.";
    }
}

async function eliminarCliente(id) {
    if (!confirm("¿Eliminar este cliente?")) return;
    if (offlineMode) {
        let clientes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        clientes = clientes.filter(c => c.clienteId != id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(clientes));
        await cargarClientes();
        return;
    }
    try {
        await api(`${API_BASE}/${id}`, { method: "DELETE" });
        await cargarClientes();
    } catch (err) {
        alert("Error: " + err.message);
    }
}

// Initialise
export function init() {
    getElem("btnRefrescar")?.addEventListener("click", cargarClientes);
    getElem("btnNuevoCliente")?.addEventListener("click", abrirModalNuevo);
    getElem("btnFiltrar")?.addEventListener("click", cargarClientes);
    getElem("btnLimpiar")?.addEventListener("click", () => {
        getElem("filtroTipo").value = "";
        getElem("filtroUbicacion").value = "";
        cargarClientes();
    });
    getElem("btnCerrarModal")?.addEventListener("click", () => showModal("modalCliente", false));
    getElem("btnGuardarCliente")?.addEventListener("click", guardarCliente);
    cargarClientes();
}