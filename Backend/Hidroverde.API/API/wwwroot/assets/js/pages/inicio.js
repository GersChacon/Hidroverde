import { api } from "../lib/http.js";

export async function init() {
    // Navegación: usa los botones del sidebar
    const goTo = (page) => document.querySelector(`.nav button[data-page="${page}"]`)?.click();

    document.getElementById("goCiclos")?.addEventListener("click", () => goTo("ciclos"));
    document.getElementById("goConsumos")?.addEventListener("click", () => goTo("consumos"));
    document.getElementById("goAlertas")?.addEventListener("click", () => goTo("alertas"));

    // Cargar todos los KPIs
    await cargarKpis();
}

async function cargarKpis() {
    setStatus("Cargando KPIs...");

    // Cargar todos los KPIs en paralelo
    await Promise.allSettled([
        cargarCiclosKpi(),
        cargarAlertasKpi(),
        cargarChecklistKpi(),
        cargarConsumosKpi()
    ]);

    setStatus("KPIs cargados");
}

// Helper function to set text content
function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = String(val ?? "");
}

function setStatus(msg) {
    setText("inicioStatus", msg);
}

// 1. CICLOS KPI
async function cargarCiclosKpi() {
    try {
        const r = await api("/api/ciclos/activos");
        const ciclos = Array.isArray(r.data) ? r.data : [];
        setText("kpiCiclos", ciclos.length);
        setText("kpiCiclosHint", ciclos.length ? "Hay ciclos en curso" : "No hay ciclos activos");
    } catch (e) {
        console.warn("Error loading ciclos KPI, using mock", e);
        setText("kpiCiclos", "3");
        setText("kpiCiclosHint", "Ciclos activos (mock)");
    }
}

// 2. ALERTAS KPI
async function cargarAlertasKpi() {
    let alertasCount = null;

    try {
        const r = await api("/api/alertas/badge");
        const d = r.data;
        alertasCount =
            typeof d === "number" ? d :
                typeof d?.count === "number" ? d.count :
                    typeof d?.total === "number" ? d.total :
                        null;
    } catch (e) {
        console.warn("Error loading badge, trying active alerts", e);
    }

    // Fallback: if badge fails, try activas
    if (alertasCount === null) {
        try {
            const r = await api("/api/alertas/activas");
            const arr = Array.isArray(r.data) ? r.data : [];
            alertasCount = arr.length;
        } catch (e) {
            console.warn("Error loading active alerts, using mock", e);
            alertasCount = 2; // mock value
        }
    }

    setText("kpiAlertas", alertasCount);
    setBadge(alertasCount);
}

// 3. CHECKLIST KPI (NEW)
async function cargarChecklistKpi() {
    try {
        const { data } = await api("/api/checklist/kpi/summary");
        setText("kpiChecklist", `${data.tareasCompletadas}/${data.totalTareas}`);
        setText("kpiChecklistHint", `${data.porcentajeCumplimiento}% completado · ${data.estado}`);

        // Color code based on status
        const el = document.getElementById("kpiChecklist");
        if (el) {
            if (data.porcentajeCumplimiento >= 80) {
                el.style.color = "#16a34a"; // green
            } else if (data.porcentajeCumplimiento >= 50) {
                el.style.color = "#eab308"; // yellow
            } else {
                el.style.color = "#dc2626"; // red
            }
        }
    } catch (err) {
        console.warn("Could not load checklist KPI, using mock", err);
        setText("kpiChecklist", "8/12");
        setText("kpiChecklistHint", "67% completado · REGULAR (mock)");
    }
}

// 4. CONSUMOS KPI
async function cargarConsumosKpi() {
    try {
        // Get today's date
        const hoy = new Date();
        const yyyy = hoy.getFullYear();
        const mm = String(hoy.getMonth() + 1).padStart(2, "0");
        const dd = String(hoy.getDate()).padStart(2, "0");
        const fechaStr = `${yyyy}-${mm}-${dd}`;

        // Call your consumos endpoint with today's date
        const { data } = await api(`/api/consumos?fechaDesde=${fechaStr}&fechaHasta=${fechaStr}`);

        if (Array.isArray(data) && data.length > 0) {
            const total = data.reduce((sum, item) => sum + (item.cantidad || 0), 0);
            setText("kpiConsumosHoy", total.toFixed(1) + " L");
            setText("kpiConsumosHint", `${data.length} registros hoy`);
        } else {
            setText("kpiConsumosHoy", "0");
            setText("kpiConsumosHint", "Sin consumos hoy");
        }
    } catch (e) {
        console.warn("Error loading consumos, using mock", e);
        setText("kpiConsumosHoy", "45 L");
        setText("kpiConsumosHint", "3 registros hoy (mock)");
    }
}

// Helper for alert badge styling
function setBadge(n) {
    const badge = document.getElementById("badgeAlertas");
    const dot = badge?.querySelector(".dot");
    if (!badge || !dot) return;

    dot.textContent = String(n ?? 0);
    badge.classList.toggle("badge-red", (n ?? 0) > 0);
}