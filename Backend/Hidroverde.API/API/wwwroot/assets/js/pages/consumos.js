const $ = (id) => document.getElementById(id);

const EMPLEADO_ID = 1;
const API_BASE = "/api/consumos";

let modoEdicion = false;
let consumoEditandoId = null;
let tiposRecursoCache = [];

/* =========================
   Helpers
   ========================= */
function safe(v) {
    if (v === null || v === undefined) return "";
    return String(v)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function esc(v) {
    return safe(v);
}

function fmtDateTime(v) {
    if (!v) return "-";
    const d = new Date(v);
    if (isNaN(d.getTime())) return String(v);

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

function fmtDateOnly(v) {
    if (!v) return "";
    const d = new Date(v);
    if (isNaN(d.getTime())) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function fmtCantidad(val, unidad) {
    if (val === null || val === undefined || val === "") return "-";
    const n = Number(val);
    const s = Number.isFinite(n) ? n.toFixed(2) : String(val);
    return `${s}${unidad ? " " + unidad : ""}`;
}

function fmtPeriodicidad(codigo) {
    const c = String(codigo || "").toUpperCase();
    if (c === "SEMANAL") return "Semanal";
    if (c === "MENSUAL") return "Mensual";
    return "Único";
}

function qsFromFilters(filters) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([k, v]) => {
        if (v === null || v === undefined) return;
        const s = String(v).trim();
        if (!s) return;
        params.set(k, s);
    });

    const q = params.toString();
    return q ? `?${q}` : "";
}

async function apiFetch(url, { method = "GET", body = null, headers = {} } = {}) {
    const opts = {
        method,
        headers: {
            accept: "application/json",
            ...headers,
        },
    };

    if (body !== null) {
        opts.headers["content-type"] = "application/json";
        opts.body = JSON.stringify(body);
    }

    const res = await fetch(url, opts);

    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `${res.status} ${res.statusText}`);
    }

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
        return await res.json();
    }

    return await res.text();
}

/* =========================
   Modal
   ========================= */
function openModal(id) {
    const el = $(id);
    if (!el) return;
    el.hidden = false;
    el.setAttribute("aria-hidden", "false");
}

function closeModal(id) {
    const el = $(id);
    if (!el) return;
    el.hidden = true;
    el.setAttribute("aria-hidden", "true");
}

/* =========================
   Filtros
   ========================= */
function leerFiltros() {
    return {
        cicloId: $("filtroCicloId")?.value || "",
        tipoRecursoId: $("filtroTipoRecursoId")?.value || "",
        fechaDesde: $("filtroDesde")?.value || "",
        fechaHasta: $("filtroHasta")?.value || "",
    };
}

function limpiarFiltros() {
    if ($("filtroCicloId")) $("filtroCicloId").value = "";
    if ($("filtroTipoRecursoId")) $("filtroTipoRecursoId").value = "";
    if ($("filtroDesde")) $("filtroDesde").value = "";
    if ($("filtroHasta")) $("filtroHasta").value = "";
}

/* =========================
   Catálogo tipos de recurso
   ========================= */
function textoTipoRecurso(item) {
    const nombre = item?.nombre ?? "Sin nombre";
    const unidad = item?.unidad ? ` (${item.unidad})` : "";
    const categoria = item?.categoria ? ` — ${item.categoria}` : "";
    return `${nombre}${unidad}${categoria}`;
}

async function cargarTiposRecurso() {
    const data = await apiFetch(`${API_BASE}/tipos-recurso`);
    tiposRecursoCache = Array.isArray(data) ? data : [];
    renderSelectTiposRecurso();
}

function renderSelectTiposRecurso() {
    const select = $("consumoTipoRecursoId");
    if (!select) return;

    const actual = select.value || "";

    select.innerHTML = `
        <option value="">Seleccione una opción</option>
        ${tiposRecursoCache
            .map((item) => `
                <option value="${safe(item.tipoRecursoId)}">
                    ${safe(textoTipoRecurso(item))}
                </option>
            `)
            .join("")}
    `;

    if (actual) {
        select.value = actual;
    }
}

/* =========================
   Formulario modal
   ========================= */
function limpiarFormConsumo() {
    if ($("consumoTipoRecursoId")) $("consumoTipoRecursoId").value = "";
    if ($("consumoCantidad")) $("consumoCantidad").value = "";
    if ($("consumoPeriodicidad")) $("consumoPeriodicidad").value = "UNICO";
    if ($("consumoNotas")) $("consumoNotas").value = "";

    if ($("consumoFecha")) {
        $("consumoFecha").value = fmtDateOnly(new Date());
    }
}

function abrirModalNuevo() {
    modoEdicion = false;
    consumoEditandoId = null;

    if ($("modalConsumoTitle")) $("modalConsumoTitle").textContent = "Nuevo consumo";
    if ($("modalConsumoSubtitle")) {
        $("modalConsumoSubtitle").textContent =
            "Registra un consumo operativo de forma simple.";
    }

    limpiarFormConsumo();
    openModal("modalConsumo");
}

function leerFormConsumoParaCrear() {
    const tipoRecursoId = Number($("consumoTipoRecursoId")?.value || 0);
    const cantidad = Number($("consumoCantidad")?.value || 0);
    const fecha = $("consumoFecha")?.value || "";
    const periodicidadCodigo = ($("consumoPeriodicidad")?.value || "UNICO").trim().toUpperCase();
    const notas = $("consumoNotas")?.value?.trim() || null;

    if (!tipoRecursoId || tipoRecursoId <= 0) {
        throw new Error("Debes seleccionar un tipo de recurso.");
    }

    if (!Number.isFinite(cantidad) || cantidad <= 0) {
        throw new Error("Cantidad inválida.");
    }

    if (!fecha) {
        throw new Error("La fecha es requerida.");
    }

    if (!["UNICO", "SEMANAL", "MENSUAL"].includes(periodicidadCodigo)) {
        throw new Error("Periodicidad inválida.");
    }

    const fechaConsumo = new Date(`${fecha}T00:00:00`).toISOString();

    return {
        cicloId: null,
        tipoRecursoId,
        cantidad,
        fechaConsumo,
        periodicidadCodigo,
        notas,
    };
}

/* =========================
   Tabla principal
   ========================= */
function renderTablaConsumos(items) {
    const tbody = $("tblConsumosBody");
    if (!tbody) return;

    if (!Array.isArray(items) || items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="muted">Sin consumos.</td></tr>`;
        return;
    }

    tbody.innerHTML = items
        .map((c) => {
            const fecha = fmtDateTime(c.fechaConsumo);
            const recurso = esc(c.recursoNombre ?? c.codigo ?? `Recurso ${c.tipoRecursoId ?? ""}`);
            const cantidad = esc(fmtCantidad(c.cantidad, c.unidad));
            const periodicidad = esc(fmtPeriodicidad(c.periodicidadCodigo));
            const ciclo = c.cicloId ? esc(c.cicloId) : `<span class="muted">General</span>`;
            const responsable = esc(c.registradoPorNombre ?? c.registradoPorEmpleadoId ?? "-");

            return `
                <tr>
                    <td>${esc(fecha)}</td>
                    <td>${recurso}</td>
                    <td>${cantidad}</td>
                    <td>${periodicidad}</td>
                    <td>${ciclo}</td>
                    <td>${responsable}</td>
                    <td>
                        <button class="btn" data-action="editar" data-id="${esc(c.consumoId)}">Editar</button>
                        <button class="btn" data-action="historial" data-id="${esc(c.consumoId)}">Historial</button>
                    </td>
                </tr>
            `;
        })
        .join("");
}

/* =========================
   Historial
   ========================= */
function renderHistorial(items) {
    const tb = $("tblHistorialBody");
    if (!tb) return;

    if (!Array.isArray(items) || items.length === 0) {
        tb.innerHTML = `<tr><td colspan="6" class="muted">Sin historial.</td></tr>`;
        return;
    }

    tb.innerHTML = items
        .map((h) => `
            <tr>
                <td>${safe(h.versionNo)}</td>
                <td>${safe(fmtDateTime(h.fechaConsumo))}</td>
                <td>${safe(h.cantidad)}</td>
                <td>${safe(h.notas ?? "")}</td>
                <td>${safe(h.motivoCambio ?? "")}</td>
                <td>${safe(fmtDateTime(h.fechaRegistro))}</td>
            </tr>
        `)
        .join("");
}

async function verHistorial(consumoId) {
    const tb = $("tblHistorialBody");
    if (tb) {
        tb.innerHTML = `<tr><td colspan="6" class="muted">Cargando...</td></tr>`;
    }

    openModal("modalHistorial");

    try {
        const data = await apiFetch(`${API_BASE}/${consumoId}/historial`);
        renderHistorial(Array.isArray(data) ? data : []);
    } catch (err) {
        if (tb) {
            tb.innerHTML = `<tr><td colspan="6" class="muted">No se pudo cargar el historial.</td></tr>`;
        }
        alert(err?.message || String(err));
    }
}

/* =========================
   API acciones
   ========================= */
async function cargarConsumos() {
    const filtros = leerFiltros();
    const url = `${API_BASE}${qsFromFilters(filtros)}`;

    const data = await apiFetch(url);
    renderTablaConsumos(Array.isArray(data) ? data : []);
}

async function guardarConsumo() {
    try {
        const body = leerFormConsumoParaCrear();

        const resp = await apiFetch(API_BASE, {
            method: "POST",
            body,
            headers: {
                "X-Empleado-Id": String(EMPLEADO_ID),
            },
        });

        const idCreado = resp?.consumoId ?? resp?.consumo_id ?? "(ok)";
        alert(`Consumo registrado. ID: ${idCreado}`);

        closeModal("modalConsumo");
        await cargarConsumos();
    } catch (err) {
        alert(err?.message || String(err));
    }
}

function exportarReporte(formato) {
    const filtros = leerFiltros();
    const suffix = formato === "excel" ? "excel" : "csv";
    const url = `${API_BASE}/reporte-diario/export/${suffix}${qsFromFilters(filtros)}`;
    window.open(url, "_blank");
}

async function verReporteDiario() {
    try {
        const filtros = leerFiltros();
        const url = `${API_BASE}/reporte-diario${qsFromFilters(filtros)}`;
        const data = await apiFetch(url);
        const total = Array.isArray(data) ? data.length : 0;
        alert(`Reporte diario generado correctamente. Registros: ${total}`);
    } catch (err) {
        alert(err?.message || String(err));
    }
}

/* =========================
   Eventos
   ========================= */
function bindEventosBase() {
    $("btnRefrescarConsumos")?.addEventListener("click", () =>
        cargarConsumos().catch((e) => alert(e.message))
    );

    $("btnNuevoConsumo")?.addEventListener("click", abrirModalNuevo);

    $("btnAplicarFiltros")?.addEventListener("click", () =>
        cargarConsumos().catch((e) => alert(e.message))
    );

    $("btnLimpiarFiltros")?.addEventListener("click", () => {
        limpiarFiltros();
        cargarConsumos().catch((e) => alert(e.message));
    });

    $("btnVerReporteDiario")?.addEventListener("click", () =>
        verReporteDiario().catch((e) => alert(e.message))
    );

    $("btnExportCsv")?.addEventListener("click", () => exportarReporte("csv"));
    $("btnExportExcel")?.addEventListener("click", () => exportarReporte("excel"));

    $("btnCerrarModalConsumo")?.addEventListener("click", () => closeModal("modalConsumo"));
    $("btnCancelarConsumo")?.addEventListener("click", () => closeModal("modalConsumo"));
    $("btnCerrarModalHistorial")?.addEventListener("click", () => closeModal("modalHistorial"));

    $("btnGuardarConsumo")?.addEventListener("click", guardarConsumo);

    document.addEventListener("click", async (ev) => {
        const btn = ev.target.closest("[data-action]");
        if (!btn) return;

        const action = btn.getAttribute("data-action");
        const id = btn.getAttribute("data-id");
        if (!id) return;

        if (action === "editar") {
            alert(`Edición pendiente para consumo #${id}.`);
            return;
        }

        if (action === "historial") {
            await verHistorial(id);
        }
    });
}

/* =========================
   Init
   ========================= */
export async function init() {
    console.log("Módulo Consumos iniciado");
    bindEventosBase();

    try {
        await cargarTiposRecurso();
    } catch (err) {
        console.error(err);
        alert("No se pudieron cargar los tipos de recurso.");
    }

    cargarConsumos().catch((e) => alert(e.message));
}