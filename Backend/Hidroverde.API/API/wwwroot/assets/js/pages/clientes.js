<<<<<<< HEAD
﻿// clientes.js – with offline localStorage fallback

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
=======
﻿import { api } from "../lib/http.js";
import { showModal, setModalTitle } from "../lib/modal.js";
import { getTrim, setValue } from "../lib/form.js";
import { escapeHtml } from "../lib/dom.js";

let modoEdicion = false;
let clienteEditandoId = null;

export function init() {
    document.getElementById("btnRefrescar")?.addEventListener("click", cargarClientes);
    document.getElementById("btnNuevoCliente")?.addEventListener("click", abrirModalNuevo);
    document.getElementById("btnFiltrar")?.addEventListener("click", cargarClientes);
    document.getElementById("btnLimpiar")?.addEventListener("click", limpiarFiltros);
    document.getElementById("btnCerrarModal")?.addEventListener("click", () => showModal("modalCliente", false));
    document.getElementById("btnGuardarCliente")?.addEventListener("click", guardarCliente);

    cargarClientes();
}

function getFiltros() {
    return {
        tipoCliente: document.getElementById("filtroTipo")?.value || undefined,
        ubicacion: document.getElementById("filtroUbicacion")?.value || undefined
    };
}

function limpiarFiltros() {
    document.getElementById("filtroTipo").value = "";
    document.getElementById("filtroUbicacion").value = "";
    cargarClientes();
}

async function cargarClientes() {
    const tbody = document.getElementById("clientesTableBody");
    tbody.innerHTML = `<tr><td colspan="8" class="muted">Cargando...</td></tr>`;

    const filtros = getFiltros();
    const params = new URLSearchParams(filtros).toString();
    const url = `/api/cliente${params ? "?" + params : ""}`;

    try {
        const { data } = await api(url);
        renderClientes(Array.isArray(data) ? data : []);
    } catch (err) {
        console.warn("API failed, using mock data", err);
        // Mock data fallback
        const mockClientes = [
            { clienteId: 1, nombreRazonSocial: "Supermercados ABC", email: "contacto@abc.com", telefono: "8888-1111", direccion: "San José, Centro", tipoCliente: "Mayorista", identificadorUnico: "3-101-123456" },
            { clienteId: 2, nombreRazonSocial: "Restaurante El Jardín", email: "info@eljardin.com", telefono: "8888-2222", direccion: "Heredia, Barreal", tipoCliente: "Minorista", identificadorUnico: "2-404-789012" },
            { clienteId: 3, nombreRazonSocial: "Exportaciones CR", email: "ventas@exportcr.com", telefono: "8888-3333", direccion: "Alajuela, Zona Franca", tipoCliente: "Corporativo", identificadorUnico: "3-202-345678" }
        ];

        // Apply filters to mock data
        let filtered = mockClientes;
        if (filtros.tipoCliente) {
            filtered = filtered.filter(c => c.tipoCliente.toLowerCase().includes(filtros.tipoCliente.toLowerCase()));
        }
        if (filtros.ubicacion) {
            filtered = filtered.filter(c => c.direccion?.toLowerCase().includes(filtros.ubicacion.toLowerCase()));
        }

        renderClientes(filtered);
>>>>>>> c258a47c036e1f2f3bda8cbc9ae982b2e22d35a1
    }
}

function renderClientes(clientes) {
<<<<<<< HEAD
    const tbody = getElem("clientesTableBody");
    if (!tbody) return;
=======
    const tbody = document.getElementById("clientesTableBody");
>>>>>>> c258a47c036e1f2f3bda8cbc9ae982b2e22d35a1
    if (!clientes.length) {
        tbody.innerHTML = `<tr><td colspan="8" class="muted">No hay clientes.</td></tr>`;
        return;
    }
<<<<<<< HEAD
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
=======

    tbody.innerHTML = clientes.map(c => `
        <tr>
            <td>${escapeHtml(c.clienteId)}</td>
            <td>${escapeHtml(c.nombreRazonSocial)}</td>
            <td>${escapeHtml(c.email)}</td>
            <td>${escapeHtml(c.telefono || "-")}</td>
            <td>${escapeHtml(c.direccion || "-")}</td>
            <td>${escapeHtml(c.tipoCliente)}</td>
            <td>${escapeHtml(c.identificadorUnico || "-")}</td>
            <td>
                <button class="btn" data-action="edit" data-id="${c.clienteId}">Editar</button>
                <button class="btn danger" data-action="delete" data-id="${c.clienteId}">Eliminar</button>
            </td>
        </tr>
    `).join("");

    // Attach event listeners for edit/delete
    document.querySelectorAll("[data-action='edit']").forEach(btn => {
        btn.addEventListener("click", () => abrirModalEditar(btn.dataset.id));
    });
    document.querySelectorAll("[data-action='delete']").forEach(btn => {
        btn.addEventListener("click", () => eliminarCliente(btn.dataset.id));
    });
>>>>>>> c258a47c036e1f2f3bda8cbc9ae982b2e22d35a1
}

function abrirModalNuevo() {
    modoEdicion = false;
    clienteEditandoId = null;
    setModalTitle("modalCliente", "Nuevo cliente");
    limpiarFormModal();
<<<<<<< HEAD
    getElem("clienteMsg").textContent = "";
=======
    document.getElementById("clienteMsg").textContent = "";
>>>>>>> c258a47c036e1f2f3bda8cbc9ae982b2e22d35a1
    showModal("modalCliente", true);
}

async function abrirModalEditar(id) {
    modoEdicion = true;
<<<<<<< HEAD
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
=======
    clienteEditandoId = id;
    setModalTitle("modalCliente", `Editar cliente #${id}`);
    limpiarFormModal();
    document.getElementById("clienteMsg").textContent = "Cargando...";
    showModal("modalCliente", true);

    try {
        const { data } = await api(`/api/cliente/${id}`);
        setValue("clienteNombre", data.nombreRazonSocial);
        setValue("clienteEmail", data.email);
        setValue("clienteTelefono", data.telefono);
        setValue("clienteDireccion", data.direccion);
        setValue("clienteTipo", data.tipoCliente);
        setValue("clienteIdentificador", data.identificadorUnico);
        document.getElementById("clienteMsg").textContent = "";
    } catch (err) {
        document.getElementById("clienteMsg").textContent = "Error al cargar cliente.";
    }
}

function limpiarFormModal() {
    ["clienteNombre", "clienteEmail", "clienteTelefono", "clienteDireccion", "clienteIdentificador"].forEach(id => {
        document.getElementById(id).value = "";
    });
    document.getElementById("clienteTipo").value = "Minorista";
>>>>>>> c258a47c036e1f2f3bda8cbc9ae982b2e22d35a1
}

async function guardarCliente() {
    const payload = {
        nombreRazonSocial: getTrim("clienteNombre"),
        email: getTrim("clienteEmail"),
        telefono: getTrim("clienteTelefono"),
        direccion: getTrim("clienteDireccion"),
<<<<<<< HEAD
        tipoCliente: getElem("clienteTipo")?.value || "Minorista",
=======
        tipoCliente: document.getElementById("clienteTipo").value,
>>>>>>> c258a47c036e1f2f3bda8cbc9ae982b2e22d35a1
        identificadorUnico: getTrim("clienteIdentificador")
    };

    if (!payload.nombreRazonSocial || !payload.email || !payload.identificadorUnico) {
<<<<<<< HEAD
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
=======
        document.getElementById("clienteMsg").textContent = "Campos obligatorios (*) faltan.";
        return;
    }

    const url = modoEdicion ? `/api/cliente/${clienteEditandoId}` : "/api/cliente";
    const method = modoEdicion ? "PUT" : "POST";

>>>>>>> c258a47c036e1f2f3bda8cbc9ae982b2e22d35a1
    try {
        await api(url, { method, body: payload });
        showModal("modalCliente", false);
        await cargarClientes();
    } catch (err) {
<<<<<<< HEAD
        getElem("clienteMsg").textContent = err.message || "Error al guardar cliente.";
=======
        document.getElementById("clienteMsg").textContent = err.message;
>>>>>>> c258a47c036e1f2f3bda8cbc9ae982b2e22d35a1
    }
}

async function eliminarCliente(id) {
    if (!confirm("¿Eliminar este cliente?")) return;
<<<<<<< HEAD
    if (offlineMode) {
        let clientes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        clientes = clientes.filter(c => c.clienteId != id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(clientes));
        await cargarClientes();
        return;
    }
    try {
        await api(`${API_BASE}/${id}`, { method: "DELETE" });
=======
    try {
        await api(`/api/cliente/${id}`, { method: "DELETE" });
>>>>>>> c258a47c036e1f2f3bda8cbc9ae982b2e22d35a1
        await cargarClientes();
    } catch (err) {
        alert("Error: " + err.message);
    }
<<<<<<< HEAD
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
=======
>>>>>>> c258a47c036e1f2f3bda8cbc9ae982b2e22d35a1
}