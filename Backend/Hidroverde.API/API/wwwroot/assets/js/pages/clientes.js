import { api } from "../lib/http.js";
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
    }
}

function renderClientes(clientes) {
    const tbody = document.getElementById("clientesTableBody");
    if (!clientes.length) {
        tbody.innerHTML = `<tr><td colspan="8" class="muted">No hay clientes.</td></tr>`;
        return;
    }

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
}

function abrirModalNuevo() {
    modoEdicion = false;
    clienteEditandoId = null;
    setModalTitle("modalCliente", "Nuevo cliente");
    limpiarFormModal();
    document.getElementById("clienteMsg").textContent = "";
    showModal("modalCliente", true);
}

async function abrirModalEditar(id) {
    modoEdicion = true;
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
}

async function guardarCliente() {
    const payload = {
        nombreRazonSocial: getTrim("clienteNombre"),
        email: getTrim("clienteEmail"),
        telefono: getTrim("clienteTelefono"),
        direccion: getTrim("clienteDireccion"),
        tipoCliente: document.getElementById("clienteTipo").value,
        identificadorUnico: getTrim("clienteIdentificador")
    };

    if (!payload.nombreRazonSocial || !payload.email || !payload.identificadorUnico) {
        document.getElementById("clienteMsg").textContent = "Campos obligatorios (*) faltan.";
        return;
    }

    const url = modoEdicion ? `/api/cliente/${clienteEditandoId}` : "/api/cliente";
    const method = modoEdicion ? "PUT" : "POST";

    try {
        await api(url, { method, body: payload });
        showModal("modalCliente", false);
        await cargarClientes();
    } catch (err) {
        document.getElementById("clienteMsg").textContent = err.message;
    }
}

async function eliminarCliente(id) {
    if (!confirm("¿Eliminar este cliente?")) return;
    try {
        await api(`/api/cliente/${id}`, { method: "DELETE" });
        await cargarClientes();
    } catch (err) {
        alert("Error: " + err.message);
    }
}