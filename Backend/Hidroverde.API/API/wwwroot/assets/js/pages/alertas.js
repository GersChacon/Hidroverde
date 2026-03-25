import { api } from "../lib/http.js";
import { $ } from "../lib/dom.js";

let alertaSeleccionada = null;
let todasLasAlertas = [];
let filtroActivo = "todos";

// ─── Helpers ─────────────────────────────────────────────
function setStatus(msg) {
    const el = $("#alertasStatus");
    if (el) el.textContent = msg;
}

function formatFecha(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("es-CR", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    });
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function getSeveridad(a) {
    if (a.snapshotMinimo <= 0) return "ok";
    const pct = a.snapshotDisponible / a.snapshotMinimo;
    if (pct <= 0.25) return "critica";
    if (pct <= 0.60) return "advertencia";
    return "ok";
}

function getSeveridadMeta(sev) {
    if (sev === "critica")     return { label: "🔴 Crítica",    color: "rgba(255,99,99,1)" };
    if (sev === "advertencia") return { label: "🟡 Advertencia", color: "rgba(246,173,85,1)" };
    return                              { label: "🟢 Monitoreo",  color: "rgba(99,205,132,1)" };
}

// ─── Actualizar tarjetas de resumen ──────────────────────
function actualizarResumen(alertas) {
    const criticas     = alertas.filter(a => getSeveridad(a) === "critica").length;
    const advertencias = alertas.filter(a => getSeveridad(a) === "advertencia").length;
    const ok           = alertas.filter(a => getSeveridad(a) === "ok").length;

    const setEl = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    setEl("summaryCriticaCount", criticas);
    setEl("summaryWarnCount",    advertencias);
    setEl("summaryOkCount",      ok);
    setEl("summaryTotalCount",   alertas.length);

    const grid    = document.getElementById("alertasSummaryGrid");
    const filtros = document.getElementById("alertasFiltros");
    if (grid)    grid.style.display    = alertas.length > 0 ? "grid" : "none";
    if (filtros) filtros.style.display = alertas.length > 0 ? "flex" : "none";
}

// ─── Renderizar lista de alertas ─────────────────────────
function renderizarAlertas(alertas) {
    const outer = document.getElementById("alertasLista");
    if (!outer) return;
    outer.innerHTML = "";

    const vacio = document.getElementById("alertasVacio");

    if (alertas.length === 0) {
        if (vacio) vacio.style.display = "flex";
        return;
    }
    if (vacio) vacio.style.display = "none";

    const lista = document.createElement("div");
    lista.className = "alertas-tabla";
    outer.appendChild(lista);

    // Ordenar: críticas primero, luego advertencias, luego ok; dentro por stock asc
    const orden = { critica: 0, advertencia: 1, ok: 2 };
    const sorted = [...alertas].sort((a, b) => {
        const sa = orden[getSeveridad(a)];
        const sb = orden[getSeveridad(b)];
        if (sa !== sb) return sa - sb;
        return a.snapshotDisponible - b.snapshotDisponible;
    });

    sorted.forEach((a) => {
        const sev = getSeveridad(a);
        const { label: sevLabel, color: sevColor } = getSeveridadMeta(sev);

        const pct = a.snapshotMinimo > 0
            ? Math.min(100, Math.round((a.snapshotDisponible / a.snapshotMinimo) * 100))
            : 100;

        const card = document.createElement("div");
        card.className = `alerta-fila alerta-fila-sev-${sev}`;
        card.dataset.severidad = sev;
        card.dataset.alertaId  = a.alertaId;

        card.innerHTML = `
            <span class="alerta-fila-icon">${sev === "critica" ? "🚨" : sev === "advertencia" ? "⚠️" : "ℹ️"}</span>
            <div class="alerta-fila-main">
                <div class="alerta-fila-nombre">${escapeHtml(a.nombreProducto ?? "")}</div>
                <div class="alerta-fila-msg">${escapeHtml(a.mensaje ?? "")}</div>
            </div>
            <div class="alerta-fila-stock">
                <div class="alerta-fila-bar-wrap">
                    <div class="alerta-fila-bar" style="width:${pct}%; background:${sevColor};"></div>
                </div>
                <span class="alerta-fila-pct" style="color:${sevColor};">${pct}%</span>
            </div>
            <div class="alerta-fila-nums">
                <strong style="color:${sevColor};">${a.snapshotDisponible}</strong>
                <span class="muted"> / ${a.snapshotMinimo}</span>
            </div>
            <span class="alerta-fila-tipo">${escapeHtml(a.tipoAlerta ?? "")}</span>
            <button class="btn-aceptar-sm btn-aceptar" type="button"
                data-alerta-id="${a.alertaId}"
                data-producto="${escapeHtml(a.nombreProducto ?? "")}"
                data-disponible="${a.snapshotDisponible}"
                data-minimo="${a.snapshotMinimo}"
                data-severidad="${sevLabel}">
                ✔ Revisar
            </button>
        `;

        lista.appendChild(card);
    });

    // Eventos botones aceptar
    lista.querySelectorAll(".btn-aceptar").forEach((btn) => {
        btn.addEventListener("click", () => {
            alertaSeleccionada = Number(btn.dataset.alertaId);
            document.getElementById("modalProducto").textContent   = btn.dataset.producto;
            document.getElementById("modalDisponible").textContent = btn.dataset.disponible;
            document.getElementById("modalMinimo").textContent     = btn.dataset.minimo;
            document.getElementById("modalSeveridad").textContent  = btn.dataset.severidad;
            abrirModal();
        });
    });
}

// ─── Carga principal ─────────────────────────────────────
async function cargarAlertas() {
    setStatus("Cargando alertas...");
    const vacio = document.getElementById("alertasVacio");
    if (vacio) vacio.style.display = "none";
    const lista = document.getElementById("alertasLista");
    if (lista) lista.innerHTML = "";
    const grid    = document.getElementById("alertasSummaryGrid");
    const filtros = document.getElementById("alertasFiltros");
    if (grid)    grid.style.display    = "none";
    if (filtros) filtros.style.display = "none";

    try {
        const r = await api("/api/alertas/activas");
        todasLasAlertas = Array.isArray(r.data) ? r.data : [];
    } catch (e) {
        setStatus(`Error al cargar alertas: ${e.message}`);
        return;
    }

    actualizarResumen(todasLasAlertas);

    if (todasLasAlertas.length === 0) {
        setStatus("");
        if (vacio) vacio.style.display = "flex";
        return;
    }

    setStatus(`${todasLasAlertas.length} alerta(s) activa(s)`);
    aplicarFiltro(filtroActivo);
}

// ─── Filtrado ─────────────────────────────────────────────
function aplicarFiltro(filtro) {
    filtroActivo = filtro;
    document.querySelectorAll(".filtro-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.filtro === filtro);
    });
    const filtradas = filtro === "todos"
        ? todasLasAlertas
        : todasLasAlertas.filter(a => getSeveridad(a) === filtro);
    renderizarAlertas(filtradas);
}

// ─── Modal ───────────────────────────────────────────────
function abrirModal()  { document.getElementById("modalAceptar")?.classList.remove("hidden"); }
function cerrarModal() { document.getElementById("modalAceptar")?.classList.add("hidden"); alertaSeleccionada = null; }

async function confirmarAceptar() {
    if (!alertaSeleccionada) return;
    const empleadoId = Number(localStorage.getItem("empleadoId") || "1");
    try {
        await api(`/api/alertas/${alertaSeleccionada}/aceptar?empleadoId=${empleadoId}`, { method: "POST" });
        cerrarModal();
        await cargarAlertas();
    } catch (e) {
        alert(`Error al aceptar alerta: ${e.message}`);
    }
}

// ─── Init ────────────────────────────────────────────────
export async function init() {
    console.log("✅ alertas.init()");

    document.getElementById("btnRefrescarAlertas")?.addEventListener("click", () =>
        cargarAlertas().catch((e) => alert(e.message))
    );
    document.getElementById("btnCancelarModal")?.addEventListener("click", cerrarModal);
    document.getElementById("btnConfirmarAceptar")?.addEventListener("click", confirmarAceptar);
    document.getElementById("modalAceptar")?.addEventListener("click", (e) => {
        if (e.target === document.getElementById("modalAceptar")) cerrarModal();
    });
    document.querySelectorAll(".filtro-btn").forEach(btn => {
        btn.addEventListener("click", () => aplicarFiltro(btn.dataset.filtro));
    });

    await cargarAlertas();
}
