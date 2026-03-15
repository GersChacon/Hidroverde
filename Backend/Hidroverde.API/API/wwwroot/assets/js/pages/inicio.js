
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

// 1. CICLOS KPI - REAL DATA FROM DATABASE
async function cargarCiclosKpi() {
    try {
        const { data } = await api("/api/ciclos/activos");
        const ciclos = Array.isArray(data) ? data : [];
        const count = ciclos.length;

        setText("kpiCiclos", count);

        if (count > 0) {
            // Calculate total plants across all cycles
            const totalPlantas = ciclos.reduce((sum, ciclo) => sum + (ciclo.cantidadPlantas || 0), 0);
            setText("kpiCiclosHint", `${count} ciclos activos · ${totalPlantas} plantas`);
        } else {
            setText("kpiCiclosHint", "No hay ciclos activos");
        }
    } catch (e) {
        console.warn("Error loading ciclos KPI", e);
        setText("kpiCiclos", "0");
        setText("kpiCiclosHint", "Error al cargar");
    }
}

// 2. ALERTAS KPI
async function cargarAlertasKpi() {
    let alertasCount = 0;

    try {
        const { data } = await api("/api/alertas/badge");
        alertasCount = data?.badgeCount || 0;
    } catch (e) {
        console.warn("Error loading badge", e);
    }

    setText("kpiAlertas", alertasCount);
    setBadge(alertasCount);
}

// 3. CHECKLIST KPI
async function cargarChecklistKpi() {
    try {
        const { data } = await api("/api/checklist/kpi/summary");
        if (data) {
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
        }
    } catch (err) {
        console.warn("Could not load checklist KPI", err);
        setText("kpiChecklist", "0/0");
        setText("kpiChecklistHint", "Sin datos");
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

        // Call consumos endpoint with today's date
        const { data } = await api(`/api/consumos?fechaDesde=${fechaStr}&fechaHasta=${fechaStr}`);

        if (Array.isArray(data) && data.length > 0) {
            const total = data.reduce((sum, item) => sum + (item.cantidad || 0), 0);
            const unidad = data[0]?.unidad || 'L';
            setText("kpiConsumosHoy", total.toFixed(1) + ' ' + unidad);
            setText("kpiConsumosHint", `${data.length} registros hoy`);
        } else {
            setText("kpiConsumosHoy", "0");
            setText("kpiConsumosHint", "Sin consumos hoy");
        }
    } catch (e) {
        console.warn("Error loading consumos", e);
        setText("kpiConsumosHoy", "0");
        setText("kpiConsumosHint", "Error al cargar");
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