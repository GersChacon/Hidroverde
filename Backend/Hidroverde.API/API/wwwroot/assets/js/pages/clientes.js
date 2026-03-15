

const API_BASE = '/api/cliente';

let modoEdicion = false;
let clienteEditandoId = null;


function getElem(id) { return document.getElementById(id); }
function showModal(modalId, show) { const m = getElem(modalId); if (m) m.hidden = !show; }
function setModalTitle(modalId, title) { const t = getElem(modalId)?.querySelector('h3'); if (t) t.textContent = title; }
function getTrim(id) { return getElem(id)?.value.trim() ?? ''; }
function setValue(id, val) { const e = getElem(id); if (e) e.value = val ?? ''; }
function escapeHtml(unsafe) { return String(unsafe ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] || c); }

async function api(url, options = {}) {
    if (options.body && typeof options.body === 'object') options.body = JSON.stringify(options.body);

    const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });

    if (!res.ok) {
        const errorText = await res.text().catch(() => 'Error desconocido');
        throw new Error(`HTTP ${res.status}: ${errorText}`);
    }

    return { data: await res.json().catch(() => ({})) };
}

// Load clients from API only
async function cargarClientes() {
    const tbody = getElem("clientesTableBody");
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="8" class="muted">Cargando...</td></tr>`;

    try {
        const params = new URLSearchParams({
            tipoCliente: getElem("filtroTipo")?.value || '',
            ubicacion: getElem("filtroUbicacion")?.value || ''
        }).toString();
        const url = API_BASE + (params ? '?' + params : '');
        const { data } = await api(url);
        const clientes = Array.isArray(data) ? data : [];

        if (clientes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="muted">No hay clientes registrados</td></tr>`;
        } else {
            renderClientes(clientes);
        }
    } catch (err) {
        console.error('Error loading clients:', err);
        tbody.innerHTML = `<tr><td colspan="8" class="danger">Error al cargar clientes: ${err.message}</td></tr>`;
    }
}

function renderClientes(clientes) {
    const tbody = getElem("clientesTableBody");
    if (!tbody) return;

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

    try {
        const { data } = await api(`${API_BASE}/${id}`);
        fillForm(data);
        getElem("clienteMsg").textContent = "";
    } catch (err) {
        getElem("clienteMsg").textContent = "Error al cargar cliente: " + err.message;
        showModal("modalCliente", false);
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

    try {
        await api(`${API_BASE}/${id}`, { method: "DELETE" });
        await cargarClientes();
    } catch (err) {
        alert("Error: " + err.message);
    }
}

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