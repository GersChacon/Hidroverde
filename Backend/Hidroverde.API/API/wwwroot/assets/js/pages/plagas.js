import { api } from "../lib/http.js";
import { $, escapeHtml } from "../lib/dom.js";

const API_BASE = "/api/plagas";
let chart = null;

// Helpers
function leerFiltros() {
    const fechaDesde = $("#fDesde")?.value || null;
    const fechaHasta = $("#fHasta")?.value || null;
    const plagaId = $("#fPlaga")?.value || null;
    const agrupacion = $("#fAgrupacion")?.value || "DIA";

    return {
        fechaDesde,
        fechaHasta,
        plagaId: plagaId ? Number(plagaId) : null,
        agrupacion
    };
}

function qs(params) {
    const u = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== "") u.append(k, v);
    });
    const s = u.toString();
    return s ? `?${s}` : "";
}

function setChartTitle(agrupacion) {
    const el = $("#chartTitle");
    if (!el) return;

    const t =
        agrupacion === "ANIO" ? "Incidencias (Anual)" :
            agrupacion === "MES" ? "Incidencias (Mensual)" :
                "Incidencias (Diario)";

    el.textContent = t;
}

function formatPeriodoLabel(periodoISO, agrupacion) {
    // periodoISO viene como "YYYY-MM-DD"
    if (!periodoISO) return "";

    if (agrupacion === "ANIO") return periodoISO.slice(0, 4);      // YYYY
    if (agrupacion === "MES") return periodoISO.slice(0, 7);       // YYYY-MM
    return periodoISO;                                            // YYYY-MM-DD
}

function abrirModal() {
    $("#modalPlaga")?.classList.remove("hidden");
}

function cerrarModal() {
    $("#modalPlaga")?.classList.add("hidden");
    $("#frmPlaga")?.reset();
    const cant = $("#mCantidad");
    if (cant) cant.value = 1;
}

async function ensureChartJs() {
    if (window.Chart) return;

    await new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js";
        s.onload = resolve;
        s.onerror = () => reject(new Error("No se pudo cargar Chart.js"));
        document.head.appendChild(s);
    });
}

// Cargas
async function cargarCatalogo() {
    const { data } = await api(`${API_BASE}/catalogo`);
    const selFiltro = $("#fPlaga");
    const selModal = $("#mPlaga");

    if (!selFiltro || !selModal) return;

    selFiltro.innerHTML = `<option value="">Todas</option>`;
    selModal.innerHTML = `<option value="">Seleccione</option>`;

    (Array.isArray(data) ? data : []).forEach((x) => {
        const id = x.plagaId ?? x.PlagaId;
        const nombre = x.nombre ?? x.Nombre;

        const opt1 = document.createElement("option");
        opt1.value = id;
        opt1.textContent = nombre;
        selFiltro.appendChild(opt1);

        const opt2 = opt1.cloneNode(true);
        selModal.appendChild(opt2);
    });
}

async function cargarTabla() {
    const f = leerFiltros();
    const { data } = await api(`${API_BASE}${qs(f)}`);
    const tbody = $("#tblPlagas tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    (Array.isArray(data) ? data : []).forEach((r) => {
        const tr = document.createElement("tr");
        const fecha = (r.fechaHallazgo || r.FechaHallazgo || "").toString().slice(0, 10);

        tr.innerHTML = `
      <td>${escapeHtml(fecha)}</td>
      <td>${escapeHtml(r.plagaNombre ?? r.PlagaNombre ?? "")}</td>
      <td>${escapeHtml(r.cantidad ?? r.Cantidad ?? 0)}</td>
      <td>${escapeHtml(r.comentario ?? r.Comentario ?? "")}</td>
      <td>${escapeHtml(r.empleadoNombre ?? r.EmpleadoNombre ?? r.usuarioId ?? r.UsuarioId ?? "")}</td>
    `;
        tbody.appendChild(tr);
    });
}

async function cargarGrafica() {
    await ensureChartJs();

    const f = leerFiltros();
    setChartTitle(f.agrupacion);

    const { data } = await api(`${API_BASE}/grafica${qs(f)}`);

    const rows = (Array.isArray(data) ? data : []).map((x) => ({
        periodo: (x.periodo || x.Periodo || "").toString().slice(0, 10),
        plaga: x.plagaNombre ?? x.PlagaNombre ?? "",
        total: x.totalCantidad ?? x.TotalCantidad ?? 0
    }));

    const labelsRaw = [...new Set(rows.map((r) => r.periodo))].sort();
    const labels = labelsRaw.map((p) => formatPeriodoLabel(p, f.agrupacion));

    const plagas = [...new Set(rows.map((r) => r.plaga))].sort();

    // Mapear por label formateado (para MES/ANIO)
    const datasets = plagas.map((p) => {
        const map = new Map(
            rows
                .filter(r => r.plaga === p)
                .map(r => [formatPeriodoLabel(r.periodo, f.agrupacion), r.total])
        );

        return {
            label: p,
            data: labels.map((d) => map.get(d) ?? 0),
            tension: 0.25
        };
    });

    const canvas = $("#chartPlagas");
    if (!canvas) return;

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        resizeDelay: 150,
        plugins: { legend: { position: "bottom" } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    };

    if (!chart) {
        chart = new window.Chart(canvas, {
            type: "line",
            data: { labels, datasets },
            options
        });
    } else {
        chart.data.labels = labels;
        chart.data.datasets = datasets;
        chart.options = options;
        chart.update("none");
    }
}

async function refrescarTodo() {
    await cargarTabla();
    await cargarGrafica();
}

// Guardar
async function registrarPlaga() {
    const payload = {
        plagaId: Number($("#mPlaga")?.value),
        fechaHallazgo: $("#mFecha")?.value,
        cantidad: Number($("#mCantidad")?.value || 1),
        comentario: $("#mComentario")?.value || null
    };

    if (!payload.plagaId) throw new Error("Seleccione una plaga.");
    if (!payload.fechaHallazgo) throw new Error("Seleccione la fecha.");

    await api(API_BASE, { method: "POST", body: payload });

    cerrarModal();
    await refrescarTodo();
}

// Init
export async function init() {
    console.log("✅ plagas.init() ejecutado");

    $("#btnRegistrarPlaga")?.addEventListener("click", abrirModal);
    $("#btnCerrarModal")?.addEventListener("click", cerrarModal);
    $("#btnCancelar")?.addEventListener("click", cerrarModal);

    $("#btnAplicar")?.addEventListener("click", () => refrescarTodo().catch(e => alert(e.message)));

    $("#btnLimpiar")?.addEventListener("click", async () => {
        $("#fDesde").value = "";
        $("#fHasta").value = "";
        $("#fPlaga").value = "";
        if ($("#fAgrupacion")) $("#fAgrupacion").value = "DIA";
        await refrescarTodo();
    });

    $("#btnRefrescar")?.addEventListener("click", () => refrescarTodo().catch(e => alert(e.message)));

    $("#fAgrupacion")?.addEventListener("change", () =>
        refrescarTodo().catch(e => alert(e.message))
    );

    $("#frmPlaga")?.addEventListener("submit", (ev) => {
        ev.preventDefault();
        registrarPlaga().catch(e => alert(e.message));
    });

    const hoy = new Date().toISOString().slice(0, 10);
    if ($("#mFecha")) $("#mFecha").value = hoy;

    // Set título inicial
    setChartTitle($("#fAgrupacion")?.value || "DIA");

    await cargarCatalogo();
    await refrescarTodo();
}