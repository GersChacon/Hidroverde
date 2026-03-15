// wwwroot/assets/js/pages/consumos.js

const MOCK_CONSUMOS = [
    { consumoId: 1, cicloId: 1, tipoRecursoId: 1, recursoNombre: "Agua", unidad: "L", cantidad: 150, fechaConsumo: new Date().toISOString(), registradoPorEmpleadoId: 1 },
    { consumoId: 2, cicloId: 1, tipoRecursoId: 2, recursoNombre: "Nutriente A", unidad: "ml", cantidad: 30, fechaConsumo: new Date(Date.now() - 86400000).toISOString(), registradoPorEmpleadoId: 2 },
    { consumoId: 3, cicloId: 2, tipoRecursoId: 1, recursoNombre: "Agua", unidad: "L", cantidad: 200, fechaConsumo: new Date().toISOString(), registradoPorEmpleadoId: 1 }
];

// In cargarConsumos(), wrap the apiFetch in try/catch
async function cargarConsumos() {
    const filtros = leerFiltros();
    const url = `${API_BASE}${qsFromFilters(filtros)}`;

    try {
        const data = await apiFetch(url);
        renderTablaConsumos(Array.isArray(data) ? data : []);
    } catch (err) {
        console.warn("Offline mode, showing mock consumos", err);
        // Optionally disable "Nuevo consumo" button
        const btnNuevo = getElem("btnNuevoConsumo");
        if (btnNuevo) btnNuevo.disabled = true;
        // Apply filters to mock (simple)
        let mock = MOCK_CONSUMOS;
        if (filtros.cicloId) mock = mock.filter(c => c.cicloId == filtros.cicloId);
        if (filtros.fechaDesde) mock = mock.filter(c => new Date(c.fechaConsumo) >= new Date(filtros.fechaDesde));
        if (filtros.fechaHasta) mock = mock.filter(c => new Date(c.fechaConsumo) <= new Date(filtros.fechaHasta));
        renderTablaConsumos(mock);
    }
}
const $ = (id) => document.getElementById(id);

const EMPLEADO_ID = 1;          // fijo por ahora (tu convención actual)
const API_BASE = "/api/consumos";

let modoEdicion = false;
let consumoEditandoId = null;

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
    if (v === null || v === undefined) return "";
    return String(v)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
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

function fmtCantidad(val, unidad) {
    if (val === null || val === undefined || val === "") return "-";
    const n = Number(val);
    const s = Number.isFinite(n) ? n.toFixed(2) : String(val);
    return `${s}${unidad ? " " + unidad : ""}`;
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
    if (contentType.includes("application/json")) return await res.json();
    return await res.text();
}

/* =========================
   Filtros (✅ IDs reales de tu HTML)
   ========================= */
function leerFiltros() {
    return {
        cicloId: $("filtroCicloId")?.value || "",
        fechaDesde: $("filtroDesde")?.value || "",
        fechaHasta: $("filtroHasta")?.value || "",
    };
}

function limpiarFiltros() {
    if ($("filtroCicloId")) $("filtroCicloId").value = "";
    if ($("filtroDesde")) $("filtroDesde").value = "";
    if ($("filtroHasta")) $("filtroHasta").value = "";
}

/* =========================
   Modal (✅ IDs reales de tu HTML)
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

function abrirModalNuevo() {
    modoEdicion = false;
    consumoEditandoId = null;

    if ($("modalConsumoTitle")) $("modalConsumoTitle").textContent = "Nuevo consumo";

    // defaults: si viene filtro cicloId, lo pre-cargamos
    if ($("consumoCicloId")) $("consumoCicloId").value = $("filtroCicloId")?.value || "";
    if ($("consumoTipoRecursoId")) $("consumoTipoRecursoId").value = "";
    if ($("consumoCantidad")) $("consumoCantidad").value = "";
    if ($("consumoFecha")) {
        const hoy = new Date();
        const yyyy = hoy.getFullYear();
        const mm = String(hoy.getMonth() + 1).padStart(2, "0");
        const dd = String(hoy.getDate()).padStart(2, "0");
        $("consumoFecha").value = `${yyyy}-${mm}-${dd}`;
    }

    openModal("modalConsumo");
}

/* =========================
   Render (✅ pinta tu tabla)
   ========================= */
function renderTablaConsumos(items) {
    const tbody = $("tblConsumosBody");
    if (!tbody) return;

    if (!Array.isArray(items) || items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="muted">Sin consumos.</td></tr>`;
        return;
    }

    tbody.innerHTML = items
        .map((c) => {
            const fecha = fmtDateTime(c.fechaConsumo);
            const recurso = esc(c.recursoNombre ?? c.codigo ?? `Recurso ${c.tipoRecursoId ?? ""}`);
            const cantidad = esc(fmtCantidad(c.cantidad, c.unidad));
            const ciclo = esc(c.cicloId);
            const responsable = safe(c.registradoPorNombre ?? c.registradoPorEmpleadoId ?? "-");

            return `
        <tr>
          <td>${esc(fecha)}</td>
          <td>${recurso}</td>
          <td>${cantidad}</td>
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
   Acciones
   ========================= */
async function cargarConsumos() {
    const filtros = leerFiltros();
    const url = `${API_BASE}${qsFromFilters(filtros)}`;

    const data = await apiFetch(url);
    const arr = Array.isArray(data) ? data : [];

    renderTablaConsumos(arr);
}

/* =========================
   Init
   ========================= */
export function init() {
    console.log("Módulo Consumos iniciado");

    // botones de página (✅ existen en tu HTML)
    $("btnRefrescarConsumos")?.addEventListener("click", () => cargarConsumos().catch((e) => alert(e.message)));
    $("btnNuevoConsumo")?.addEventListener("click", abrirModalNuevo);

    $("btnAplicarFiltros")?.addEventListener("click", () => cargarConsumos().catch((e) => alert(e.message)));
    $("btnLimpiarFiltros")?.addEventListener("click", () => {
        limpiarFiltros();
        cargarConsumos().catch((e) => alert(e.message));
    });

    $("btnVerReporteDiario")?.addEventListener("click", () => alert("Pendiente: reporte diario (lo conectamos luego)"));
    $("btnExportCsv")?.addEventListener("click", () => alert("Pendiente: export CSV (lo conectamos luego)"));
    $("btnExportExcel")?.addEventListener("click", () => alert("Pendiente: export Excel (lo conectamos luego)"));

    // modal close (✅ tu HTML usa btnCerrarModalConsumo)
    $("btnCerrarModalConsumo")?.addEventListener("click", () => closeModal("modalConsumo"));

    // Guardar (lo conectamos luego con tu endpoint POST)
    $("btnGuardarConsumo")?.addEventListener("click", guardarConsumo);

    // Delegación acciones tabla
    document.addEventListener("click", (ev) => {
        const btn = ev.target.closest("[data-action]");
        if (!btn) return;

        const action = btn.getAttribute("data-action");
        const id = btn.getAttribute("data-id");

        if (action === "editar") {
            alert(`Pendiente: editar consumo #${id}`);
            return;
        }
        if (action === "historial") {
            alert(`Pendiente: historial de consumo #${id}`);
            return;
        }
    });

    // carga inicial
    cargarConsumos().catch((e) => alert(e.message));
}
function leerFormConsumoParaCrear() {
    const cicloId = Number($("consumoCicloId")?.value || 0);
    const tipoRecursoId = Number($("consumoTipoRecursoId")?.value || 0);
    const cantidad = Number($("consumoCantidad")?.value || 0);
    const fecha = $("consumoFecha")?.value || ""; // yyyy-mm-dd

    if (!cicloId || cicloId <= 0) throw new Error("CicloId es requerido.");
    if (!tipoRecursoId || tipoRecursoId <= 0) throw new Error("TipoRecursoId es requerido.");
    if (!Number.isFinite(cantidad) || cantidad < 0) throw new Error("Cantidad inválida.");
    if (!fecha) throw new Error("Fecha es requerida.");

    // Convertimos yyyy-mm-dd a ISO (lo que Swagger manda)
    const fechaConsumo = new Date(`${fecha}T00:00:00`).toISOString();

    return {
        cicloId,
        tipoRecursoId,
        cantidad,
        fechaConsumo,
        notas: null // luego lo conectamos si agregas textarea
    };
}

async function guardarConsumo() {
    if (offlineMode) {
        alert("No se puede guardar en modo offline.");
        return;
    }
    try {
        const body = leerFormConsumoParaCrear();

        const resp = await apiFetch(API_BASE, {
            method: "POST",
            body,
            headers: { "X-Empleado-Id": String(EMPLEADO_ID) }
        });

        // tu API puede devolver consumoId o consumo_id según mapeo
        const idCreado = resp?.consumoId ?? resp?.consumo_id ?? "(ok)";
        alert(`Consumo registrado. ID: ${idCreado}`);

        closeModal("modalConsumo");
        await cargarConsumos();
    } catch (err) {
        alert(err?.message || String(err));
    }
    function renderHistorial(items) {
        const tb = document.getElementById("tblHistorialBody");
        if (!tb) return;

        if (!Array.isArray(items) || items.length === 0) {
            tb.innerHTML = `<tr><td colspan="6" class="muted">Sin historial.</td></tr>`;
            return;
        }

        tb.innerHTML = items.map(h => `
    <tr>
      <td>${safe(h.versionNo)}</td>
      <td>${safe(fmtDateTime(h.fechaConsumo))}</td>
      <td>${safe(h.cantidad)}</td>
      <td>${safe(h.notas ?? "")}</td>
      <td>${safe(h.motivoCambio ?? "")}</td>
      <td>${safe(fmtDateTime(h.fechaRegistro))}</td>
    </tr>
  `).join("");
    }

}
