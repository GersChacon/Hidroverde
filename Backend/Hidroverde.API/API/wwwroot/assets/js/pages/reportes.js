import { api } from "../lib/http.js";

const USE_MOCK = false;

console.log("📊 reportes.js cargado");

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

let definiciones = [];
let generados = [];
let programaciones = [];
let reporteActual = null;

export async function init() {
    console.log("🚀 Inicializando reportes...");

    const requiredIds = [
        "tablaGenerados", "tablaProgramaciones", "filtroReporte", "progReporteId",
        "btnRefrescar", "btnAplicarFiltro", "btnLimpiarFiltro", "btnNuevaProgramacion",
        "btnGuardarProgramacion", "btnExportPdf", "btnExportExcel", "btnGenerarAhora"
    ];
    requiredIds.forEach(id => {
        if (!document.getElementById(id)) {
            console.warn(`⚠️ Elemento con id "${id}" no encontrado en el DOM.`);
        } else {
            console.log(`✅ Elemento "${id}" encontrado.`);
        }
    });

    await cargarDefiniciones();

    document.getElementById("btnRefrescar")?.addEventListener("click", () => {
        cargarGenerados();
        cargarProgramaciones();
    });

    document.querySelectorAll("[data-tab]").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const tab = e.target.dataset.tab;
            document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            document.getElementById("tabGenerados").style.display = tab === "generados" ? "block" : "none";
            document.getElementById("tabProgramaciones").style.display = tab === "programaciones" ? "block" : "none";
        });
    });

    document.getElementById("btnAplicarFiltro")?.addEventListener("click", () => {
        const reporteId = document.getElementById("filtroReporte")?.value;
        renderGenerados(reporteId ? generados.filter(g => g.reporteId == reporteId) : generados);
    });
    document.getElementById("btnLimpiarFiltro")?.addEventListener("click", () => {
        document.getElementById("filtroReporte").value = "";
        renderGenerados(generados);
    });

    document.getElementById("btnNuevaProgramacion")?.addEventListener("click", abrirModalNuevaProgramacion);
    document.getElementById("btnGuardarProgramacion")?.addEventListener("click", guardarProgramacion);
    document.querySelectorAll("[data-close='modalProgramacion']").forEach(el => {
        el.addEventListener("click", () => cerrarModal("modalProgramacion"));
    });

    document.getElementById("btnExportPdf")?.addEventListener("click", () => exportarReporte("pdf"));
    document.getElementById("btnExportExcel")?.addEventListener("click", () => exportarReporte("excel"));
    document.querySelectorAll("[data-close='modalVerReporte']").forEach(el => {
        el.addEventListener("click", () => cerrarModal("modalVerReporte"));
    });

    document.getElementById("btnGenerarAhora")?.addEventListener("click", async () => {
        const reporteId = document.getElementById("filtroReporte").value;
        if (!reporteId) return alert("Seleccione un reporte en el filtro.");
        const params = prompt("Ingrese parámetros JSON (opcional):", '{"fecha_desde":"2025-01-01","fecha_hasta":"2025-01-31"}');
        try {
            const { data } = await api("/api/reportes/generar", {
                method: "POST",
                body: { reporteId: parseInt(reporteId), parametros: params || null }
            });
            alert(`Reporte generado. ID: ${data.generadoId}`);
            await cargarGenerados();
        } catch (e) {
            alert(e.message);
        }
    });

    await Promise.all([cargarGenerados(), cargarProgramaciones()]);
}

async function cargarDefiniciones() {
    try {
        const { data } = await api("/api/reportes/definiciones");
        definiciones = Array.isArray(data) ? data : [];
        llenarSelectReportes();
        console.log("📋 Definiciones cargadas:", definiciones);
    } catch (e) {
        console.error("Error cargando definiciones", e);
    }
}

function llenarSelectReportes() {
    const selFiltro = document.getElementById("filtroReporte");
    const selProg = document.getElementById("progReporteId");
    if (selFiltro) {
        selFiltro.innerHTML = '<option value="">Todos los reportes</option>' +
            definiciones.map(d => `<option value="${d.reporteId}">${escapeHtml(d.nombre)}</option>`).join("");
    }
    if (selProg) {
        selProg.innerHTML = '<option value="">Seleccione...</option>' +
            definiciones.map(d => `<option value="${d.reporteId}">${escapeHtml(d.nombre)}</option>`).join("");
    }
}

async function cargarGenerados() {
    const tbody = document.getElementById("tablaGenerados");
    if (!tbody) {
        console.error("❌ tablaGenerados no encontrada");
        return;
    }
    tbody.innerHTML = `<tr><td colspan="3" class="table-empty">Cargando...</td></tr>`;

    try {
        const { data } = await api("/api/reportes/generados");
        generados = Array.isArray(data) ? data : [];
        renderGenerados(generados);
    } catch (e) {
        console.error(e);
        tbody.innerHTML = `<tr><td colspan="3" class="danger">Error cargando reportes: ${e.message}</td></tr>`;
    }
}

function renderGenerados(lista) {
    const tbody = document.getElementById("tablaGenerados");
    if (!tbody) return;
    if (!lista.length) {
        tbody.innerHTML = `<tr><td colspan="3" class="table-empty">No hay reportes generados.</td></tr>`;
        return;
    }
    tbody.innerHTML = lista.map(g => `
    <tr>
      <td>${escapeHtml(g.reporteNombre)}</td>
      <td>${new Date(g.fechaGeneracion).toLocaleString('es-CR')}</td>
      <td>
        <button class="btn btn-sm" data-action="ver" data-id="${g.generadoId}">Ver</button>
        <button class="btn btn-sm" data-action="pdf" data-id="${g.generadoId}">PDF</button>
        <button class="btn btn-sm" data-action="excel" data-id="${g.generadoId}">Excel</button>
      </td>
    </tr>
  `).join("");
    attachGeneradosListeners();
}

function attachGeneradosListeners() {
    document.querySelectorAll("[data-action='ver']").forEach(btn => {
        btn.addEventListener("click", () => verReporte(btn.dataset.id));
    });
    document.querySelectorAll("[data-action='pdf']").forEach(btn => {
        btn.addEventListener("click", () => exportarReporteDirecto(btn.dataset.id, "pdf"));
    });
    document.querySelectorAll("[data-action='excel']").forEach(btn => {
        btn.addEventListener("click", () => exportarReporteDirecto(btn.dataset.id, "excel"));
    });
}

async function cargarProgramaciones() {
    const tbody = document.getElementById("tablaProgramaciones");
    if (!tbody) {
        console.error("❌ tablaProgramaciones no encontrada");
        return;
    }
    tbody.innerHTML = `<tr><td colspan="6" class="table-empty">Cargando...</td></tr>`;

    try {
        const { data } = await api("/api/reportes/programaciones");
        programaciones = Array.isArray(data) ? data : [];
        renderProgramaciones();
    } catch (e) {
        console.error(e);
        tbody.innerHTML = `<tr><td colspan="6" class="danger">Error cargando programaciones: ${e.message}</td></tr>`;
    }
}

function renderProgramaciones() {
    const tbody = document.getElementById("tablaProgramaciones");
    if (!tbody) return;
    if (!programaciones.length) {
        tbody.innerHTML = `<tr><td colspan="6" class="table-empty">No hay programaciones.</td></tr>`;
        return;
    }
    tbody.innerHTML = programaciones.map(p => `
    <tr>
      <td>${escapeHtml(p.reporteNombre)}</td>
      <td>${p.frecuencia}</td>
      <td>${new Date(p.proximaEjecucion).toLocaleString('es-CR')}</td>
      <td><pre style="margin:0;font-size:0.8rem;">${escapeHtml(p.parametros || '')}</pre></td>
      <td>${p.activo ? 'Activa' : 'Inactiva'}</td>
      <td>
        <button class="btn btn-sm danger" data-action="eliminar" data-id="${p.programacionId}">Eliminar</button>
      </td>
    </tr>
  `).join("");
    document.querySelectorAll("[data-action='eliminar']").forEach(btn => {
        btn.addEventListener("click", () => eliminarProgramacion(btn.dataset.id));
    });
}

function abrirModalNuevaProgramacion() {
    document.getElementById("modalProgramacionTitle").textContent = "Nueva programación";
    document.getElementById("progReporteId").value = "";
    document.getElementById("progFrecuencia").value = "DIARIO";
    document.getElementById("progParametros").value = "";
    abrirModal("modalProgramacion");
}

async function guardarProgramacion() {
    const reporteId = document.getElementById("progReporteId").value;
    const frecuencia = document.getElementById("progFrecuencia").value;
    const parametros = document.getElementById("progParametros").value.trim() || null;
    if (!reporteId) return alert("Seleccione un reporte.");
    if (!frecuencia) return alert("Seleccione una frecuencia.");
    try {
        const { data } = await api("/api/reportes/programaciones", {
            method: "POST",
            body: { reporteId: parseInt(reporteId), frecuencia, parametros }
        });
        cerrarModal("modalProgramacion");
        await cargarProgramaciones();
    } catch (e) {
        alert(e.message);
    }
}

async function eliminarProgramacion(id) {
    if (!confirm("¿Eliminar esta programación?")) return;
    try {
        await api(`/api/reportes/programaciones/${id}`, { method: "DELETE" });
        await cargarProgramaciones();
    } catch (e) {
        alert(e.message);
    }
}

async function verReporte(generadoId) {
    try {
        const { data } = await api(`/api/reportes/generados/${generadoId}`);
        if (!data) throw new Error("Reporte no encontrado");
        reporteActual = data;
        document.getElementById("modalVerReporteTitle").textContent = `Reporte: ${data.reporteNombre}`;
        const datos = JSON.parse(data.datosJson);
        let html = '<table class="data-table"><thead><tr>';
        if (datos.length > 0) {
            const cols = Object.keys(datos[0]);
            html += cols.map(c => `<th>${escapeHtml(c)}</th>`).join('');
            html += '</tr></thead><tbody>';
            datos.forEach(row => {
                html += '<tr>' + cols.map(c => `<td>${escapeHtml(row[c]?.toString() || '')}</td>`).join('') + '</tr>';
            });
            html += '</tbody></table>';
        } else {
            html = '<p class="muted">No hay datos.</p>';
        }
        document.getElementById("reporteDatosPreview").innerHTML = html;
        abrirModal("modalVerReporte");
    } catch (e) {
        alert(e.message);
    }
}

async function exportarReporteDirecto(generadoId, formato) {
    try {
        if (USE_MOCK) {
            let content, mimeType, extension;
            if (formato === 'excel') {
                content = `
                    <html><head><meta charset="UTF-8"></head><body>
                    <h3>Reporte de prueba</h3>
                    <table border="1"><tr><th>ID</th><th>Fecha</th><th>Total</th></tr>
                    <tr><td>1</td><td>2025-01-01</td><td>150000</td></tr>
                    <tr><td>2</td><td>2025-01-02</td><td>200000</td></tr>
                    </table></body></html>
                `;
                mimeType = 'application/vnd.ms-excel';
                extension = 'xls';
            } else {
                content = '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 595 842]/Parent 2 0 R/Resources<<>>>>endobj trailer <</Size 4/Root 1 0 R>>\n%%EOF';
                mimeType = 'application/pdf';
                extension = 'pdf';
            }
            const blob = new Blob([content], { type: mimeType });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `reporte.${extension}`;
            link.click();
            URL.revokeObjectURL(link.href);
            return;
        }

        const empleadoId = localStorage.getItem("empleadoId") || "1";
        const url = `/api/reportes/generados/${generadoId}/export?formato=${formato}`;
        const response = await fetch(url, { headers: { "X-Empleado-Id": empleadoId } });
        if (!response.ok) throw new Error(await response.text());
        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `reporte.${formato === 'pdf' ? 'pdf' : 'xlsx'}`;
        link.click();
        URL.revokeObjectURL(link.href);
    } catch (e) {
        alert(e.message);
    }
}

function exportarReporte(formato) {
    if (reporteActual) exportarReporteDirecto(reporteActual.generadoId, formato);
}

function abrirModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.hidden = false;
        modal.setAttribute("aria-hidden", "false");
    }
}

function cerrarModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.hidden = true;
        modal.setAttribute("aria-hidden", "true");
    }
}