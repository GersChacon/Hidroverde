// wwwroot/assets/js/pages/consumos.js
let modoEdicion = false;
let consumoEditandoId = null;

const EMPLEADO_ID = 1; // fijo por ahora (tu convención actual)
const API_BASE = "/api/consumos";

// ===== Helpers (sin replaceAll) =====
function safe(str) {
    return String(str ?? "").replace(/[&<>"']/g, (m) => {
        switch (m) {
            case "&": return "&amp;";
            case "<": return "&lt;";
            case ">": return "&gt;";
            case '"': return "&quot;";
            case "'": return "&#39;";
            default: return m;
        }
    });
}

function $(id) {
    return document.getElementById(id);
}

function toIsoDateOnly(value) {
    // value puede ser Date, string ISO, o "yyyy-mm-dd"
    if (!value) return "";
    const d = (value instanceof Date) ? value : new Date(value);
    if (Number.isNaN(d.getTime())) {
        // si ya viene yyyy-mm-dd
        const s = String(value);
        return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : "";
    }
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function qsFromFilters(filters) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
        if (v === null || v === undefined) return;
        const s = String(v).trim();
        if (s.length === 0) return;
        params.set(k, s);
    });
    const q = params.toString();
    return q ? `?${q}` : "";
}

async function apiFetch(url, { method = "GET", body = null, headers = {} } = {}) {
    const opts = {
        method,
        headers: {
            "accept": "application/json",
            ...headers
        }
    };

    if (body !== null) {
        opts.headers["content-type"] = "application/json";
        opts.body = JSON.stringify(body);
    }

    const res = await fetch(url, opts);

    if (!res.ok) {
        // tu regla: leer res.text() para mostrar error real
        const txt = await res.text();
        const msg = txt || `${res.status} ${res.statusText}`;
        throw new Error(msg);
    }

    // Puede venir vacío en algunos PUT/POST, manejamos.
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) return await res.json();
    return await res.text();
}

// ===== Modal helpers (sin depender de libs externas) =====
function openModal(id) {
    const el = $(id);
    if (!el) return;
    el.setAttribute("aria-hidden", "false");
    el.classList.add("is-open");
}

function closeModal(id) {
    const el = $(id);
    if (!el) return;
    el.setAttribute("aria-hidden", "true");
    el.classList.remove("is-open");
}

function bindModalClose() {
    document.addEventListener("click", (ev) => {
        const btn = ev.target.closest("[data-close]");
        if (!btn) return;
        const id = btn.getAttribute("data-close");
        if (id) closeModal(id);
    });
}

// ===== Lectura de filtros / formulario =====
function leerFiltros() {
    return {
        cicloId: $("fCicloId")?.value || "",
        tipoRecursoId: $("fTipoRecursoId")?.value || "",
        fechaDesde: $("fFechaDesde")?.value || "",
        fechaHasta: $("fFechaHasta")?.value || ""
    };
}

function limpiarFiltros() {
    if ($("fCicloId")) $("fCicloId").value = "";
    if ($("fTipoRecursoId")) $("fTipoRecursoId").value = "";
    if ($("fFechaDesde")) $("fFechaDesde").value = "";
    if ($("fFechaHasta")) $("fFechaHasta").value = "";
}

function leerFormConsumoParaCrear() {
    // Respeta tu modelo C#:
    // ConsumoRequest { CicloId, TipoRecursoId, Cantidad, FechaConsumo, Notas }
    const cicloId = Number($("cicloId")?.value || 0);
    const tipoRecursoId = Number($("tipoRecursoId")?.value || 0);
    const cantidad = Number($("cantidad")?.value || 0);
    const fechaConsumo = $("fechaConsumo")?.value || "";
    const notas = $("nota")?.value || null;

    if (!cicloId || cicloId <= 0) throw new Error("CicloId es requerido.");
    if (!tipoRecursoId || tipoRecursoId <= 0) throw new Error("TipoRecursoId es requerido.");
    if (!(cantidad >= 0)) throw new Error("Cantidad inválida.");
    if (!fechaConsumo) throw new Error("FechaConsumo es requerida.");

    // ASP.NET deserializa case-insensitive, pero enviamos camelCase consistente
    return {
        cicloId,
        tipoRecursoId,
        cantidad,
        fechaConsumo, // yyyy-mm-dd
        notas: (notas && String(notas).trim().length) ? notas : null
    };
}

function leerFormConsumoParaEditar() {
    // ConsumoEditRequest { NuevaCantidad, NuevaFechaConsumo, Notas, MotivoCambio }
    const nuevaCantidad = Number($("cantidad")?.value || 0);
    const nuevaFechaConsumo = $("fechaConsumo")?.value || "";
    const notas = $("nota")?.value || null;

    if (!(nuevaCantidad >= 0)) throw new Error("NuevaCantidad inválida.");
    if (!nuevaFechaConsumo) throw new Error("NuevaFechaConsumo es requerida.");

    // MotivoCambio: como tu HTML no lo traía fijo, lo pedimos por prompt
    let motivoCambio = "";
    const motivoEl = $("motivoCambio");
    if (motivoEl) motivoCambio = motivoEl.value || "";
    if (!motivoCambio.trim()) {
        motivoCambio = prompt("Motivo del cambio (recomendado/posible requerido por SP):", "") || "";
    }

    return {
        nuevaCantidad,
        nuevaFechaConsumo,
        notas: (notas && String(notas).trim().length) ? notas : null,
        motivoCambio: motivoCambio.trim().length ? motivoCambio.trim() : null
    };
}

// ===== Render =====
function setTotal(n) {
    const lbl = $("lblTotalConsumos");
    if (lbl) lbl.textContent = String(n ?? 0);
}

function renderTablaConsumos(items) {
    const tb = $("tbConsumos");
    if (!tb) return;

    if (!items || !items.length) {
        tb.innerHTML = `<tr><td colspan="7" class="muted">Sin datos con los filtros actuales.</td></tr>`;
        setTotal(0);
        return;
    }

    setTotal(items.length);

    tb.innerHTML = items.map((x) => {
        const id = x.consumoId ?? x.ConsumoId;
        const cicloId = x.cicloId ?? x.CicloId;
        const tipoRecursoId = x.tipoRecursoId ?? x.TipoRecursoId;
        const recursoNombre = x.recursoNombre ?? x.RecursoNombre ?? "";
        const unidad = x.unidad ?? x.Unidad ?? "";
        const cantidad = x.cantidad ?? x.Cantidad ?? "";
        const fechaConsumo = toIsoDateOnly(x.fechaConsumo ?? x.FechaConsumo);

        return `
      <tr
        data-consumo='${safe(JSON.stringify({
            consumoId: id,
            cicloId,
            tipoRecursoId,
            recursoNombre,
            unidad,
            cantidad,
            fechaConsumo,
            notas: x.notas ?? x.Notas ?? null
        }))}'
      >
        <td>${safe(id)}</td>
        <td>${safe(cicloId)}</td>
        <td>${safe(recursoNombre || tipoRecursoId)}</td>
        <td>${safe(fechaConsumo)}</td>
        <td>${safe(cantidad)}</td>
        <td>${safe(unidad)}</td>
        <td class="text-right">
          <button class="btn btn--sm" data-action="editar" data-id="${safe(id)}">Editar</button>
          <button class="btn btn--sm" data-action="historial" data-id="${safe(id)}">Historial</button>
        </td>
      </tr>
    `;
    }).join("");
}

function renderHistorial(items) {
    const tb = $("tbHistorial");
    if (!tb) return;

    if (!items || !items.length) {
        tb.innerHTML = `<tr><td colspan="6" class="muted">No hay historial para este consumo.</td></tr>`;
        return;
    }

    tb.innerHTML = items.map((h) => {
        // Campos posibles (no me compartiste el modelo del historial),
        // así que lo hago tolerante:
        const v = h.versionNo ?? h.VersionNo ?? h.version ?? "";
        const fecha = toIsoDateOnly(h.fechaConsumo ?? h.FechaConsumo ?? h.fechaRegistro ?? h.FechaRegistro);
        const cantidad = h.cantidad ?? h.Cantidad ?? h.nuevaCantidad ?? h.NuevaCantidad ?? "";
        const tipo = h.recursoNombre ?? h.RecursoNombre ?? (h.tipoRecursoId ?? h.TipoRecursoId ?? "");
        const usuario = h.registradoPorEmpleadoId ?? h.RegistradoPorEmpleadoId ?? h.empleadoId ?? h.EmpleadoId ?? "";
        const obs = h.motivoCambio ?? h.MotivoCambio ?? h.notas ?? h.Notas ?? "";

        return `
      <tr>
        <td>${safe(v)}</td>
        <td>${safe(fecha)}</td>
        <td>${safe(cantidad)}</td>
        <td>${safe(tipo)}</td>
        <td>${safe(usuario)}</td>
        <td>${safe(obs)}</td>
      </tr>
    `;
    }).join("");
}

function renderReporteDiario(items) {
    const tb = $("tbReporteDiario");
    if (!tb) return;

    if (!items || !items.length) {
        tb.innerHTML = `<tr><td colspan="5" class="muted">Sin datos para reporte diario.</td></tr>`;
        return;
    }

    tb.innerHTML = items.map((r) => {
        const fecha = toIsoDateOnly(r.fecha ?? r.Fecha ?? r.fechaConsumo ?? r.FechaConsumo);
        const cicloId = r.cicloId ?? r.CicloId ?? "";
        const tipo = r.recursoNombre ?? r.RecursoNombre ?? r.codigo ?? r.Codigo ?? (r.tipoRecursoId ?? r.TipoRecursoId ?? "");
        const cantidad = r.cantidad ?? r.Cantidad ?? r.total ?? r.Total ?? "";
        const unidad = r.unidad ?? r.Unidad ?? "";

        return `
      <tr>
        <td>${safe(fecha)}</td>
        <td>${safe(cicloId)}</td>
        <td>${safe(tipo)}</td>
        <td>${safe(cantidad)}</td>
        <td>${safe(unidad)}</td>
      </tr>
    `;
    }).join("");
}

// ===== Acciones =====
async function cargarConsumos() {
    const filtros = leerFiltros();
    const url = `${API_BASE}${qsFromFilters(filtros)}`;
    const data = await apiFetch(url);
    renderTablaConsumos(Array.isArray(data) ? data : []);
}

function abrirModalNuevo() {
    modoEdicion = false;
    consumoEditandoId = null;

    if ($("mdlConsumoTitle")) $("mdlConsumoTitle").textContent = "Nuevo consumo";
    if ($("consumoId")) $("consumoId").value = "";

    // limpiar form
    if ($("cicloId")) $("cicloId").value = $("fCicloId")?.value || "";
    if ($("tipoRecursoId")) $("tipoRecursoId").value = $("fTipoRecursoId")?.value || "";
    if ($("cantidad")) $("cantidad").value = "";
    if ($("fechaConsumo")) $("fechaConsumo").value = toIsoDateOnly(new Date());
    if ($("nota")) $("nota").value = "";

    openModal("mdlConsumo");
}

function abrirModalEditarDesdeFila(tr) {
    if (!tr) return;
    const raw = tr.getAttribute("data-consumo");
    if (!raw) return;

    let obj = null;
    try { obj = JSON.parse(raw); } catch { obj = null; }
    if (!obj) return;

    modoEdicion = true;
    consumoEditandoId = obj.consumoId;

    if ($("mdlConsumoTitle")) $("mdlConsumoTitle").textContent = `Editar consumo #${obj.consumoId}`;
    if ($("consumoId")) $("consumoId").value = obj.consumoId ?? "";

    if ($("cicloId")) $("cicloId").value = obj.cicloId ?? "";
    if ($("tipoRecursoId")) $("tipoRecursoId").value = obj.tipoRecursoId ?? "";
    if ($("cantidad")) $("cantidad").value = obj.cantidad ?? "";
    if ($("fechaConsumo")) $("fechaConsumo").value = obj.fechaConsumo ?? "";
    if ($("nota")) $("nota").value = obj.notas ?? "";

    openModal("mdlConsumo");
}

async function guardarConsumo() {
    try {
        const headers = { "X-Empleado-Id": String(EMPLEADO_ID) };

        if (!modoEdicion) {
            const body = leerFormConsumoParaCrear();
            const r = await apiFetch(API_BASE, { method: "POST", body, headers });
            closeModal("mdlConsumo");
            await cargarConsumos();
            alert(`Consumo registrado. ID: ${r?.consumoId ?? "(ok)"}`);
            return;
        }

        // edición
        if (!consumoEditandoId) throw new Error("No hay consumo seleccionado para editar.");
        const bodyEdit = leerFormConsumoParaEditar();
        await apiFetch(`${API_BASE}/${consumoEditandoId}`, { method: "PUT", body: bodyEdit, headers });
        closeModal("mdlConsumo");
        await cargarConsumos();
        alert("Consumo actualizado con historial (ok).");
    } catch (err) {
        alert(err?.message || String(err));
    }
}

async function verHistorial(consumoId) {
    try {
        const data = await apiFetch(`${API_BASE}/${consumoId}/historial`);
        renderHistorial(Array.isArray(data) ? data : []);
        openModal("mdlHistorial");
    } catch (err) {
        alert(err?.message || String(err));
    }
}

async function verReporteDiario() {
    try {
        const filtros = leerFiltros();
        const url = `${API_BASE}/reporte-diario${qsFromFilters(filtros)}`;
        const data = await apiFetch(url);
        renderReporteDiario(Array.isArray(data) ? data : []);
    } catch (err) {
        alert(err?.message || String(err));
    }
}

function exportar(tipo) {
    // tipo: "csv" | "excel"
    const filtros = leerFiltros();
    const url = `${API_BASE}/reporte-diario/export/${tipo}${qsFromFilters(filtros)}`;
    // descarga/abre en otra pestaña
    window.open(url, "_blank");
}

// ===== Init =====
export function init() {
    console.log("Módulo Consumos iniciado");

    bindModalClose();

    $("btnRefrescarConsumos")?.addEventListener("click", () => cargarConsumos().catch(e => alert(e.message)));
    $("btnNuevoConsumo")?.addEventListener("click", abrirModalNuevo);

    $("btnAplicarFiltros")?.addEventListener("click", () => cargarConsumos().catch(e => alert(e.message)));
    $("btnLimpiarFiltros")?.addEventListener("click", () => {
        limpiarFiltros();
        cargarConsumos().catch(e => alert(e.message));
    });

    $("btnGuardarConsumo")?.addEventListener("click", guardarConsumo);

    $("btnVerReporteDiario")?.addEventListener("click", () => verReporteDiario().catch(e => alert(e.message)));
    $("btnExportCsv")?.addEventListener("click", () => exportar("csv"));
    $("btnExportExcel")?.addEventListener("click", () => exportar("excel"));

    // Delegación de acciones en tabla
    document.addEventListener("click", (ev) => {
        const btn = ev.target.closest("[data-action]");
        if (!btn) return;

        const action = btn.getAttribute("data-action");
        const id = btn.getAttribute("data-id");

        if (action === "editar") {
            const tr = btn.closest("tr");
            abrirModalEditarDesdeFila(tr);
            return;
        }

        if (action === "historial") {
            if (!id) return;
            verHistorial(id);
            return;
        }
    });

    // Carga inicial
    cargarConsumos().catch(e => alert(e.message));
}
