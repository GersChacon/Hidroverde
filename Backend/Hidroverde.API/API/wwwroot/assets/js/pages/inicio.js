import { api } from "../lib/http.js";
import { $ } from "../lib/dom.js";

let chartPlagasInicio = null;

export async function init() {
    // Navegación: usa botones del sidebar
    const goTo = (page) =>
        document.querySelector(`.nav button[data-page="${page}"]`)?.click();

    $("#goCiclos")?.addEventListener("click", () => goTo("ciclos"));
    $("#goConsumos")?.addEventListener("click", () => goTo("consumos"));
    $("#goAlertas")?.addEventListener("click", () => goTo("alertas"));
    $("#goPlagas")?.addEventListener("click", (e) => {
        e.preventDefault();
        goTo("plagas");
    });

    // Cargar KPIs (no bloquear el gráfico si falla algo)
    cargarKpis().catch(console.error);

    // Cargar gráfico plagas
    setTimeout(() => {
        cargarGraficoPlagasInicio().catch((err) => {
            console.error(err);
            const hint = document.getElementById("plagasMiniHint");
            if (hint) hint.textContent = "No se pudo cargar el gráfico";
        });
    }, 400);
}

/* =========================
   KPIs
   ========================= */

async function cargarKpis() {
    setStatus("Cargando KPIs...");

    // 1) Ciclos activos
    try {
        const r = await api("/api/ciclos/activos");
        const ciclos = Array.isArray(r.data) ? r.data : [];
        setText("kpiCiclos", ciclos.length);
        setText(
            "kpiCiclosHint",
            ciclos.length ? "Hay ciclos en curso" : "No hay ciclos activos"
        );
    } catch (e) {
        setText("kpiCiclos", "—");
        setText("kpiCiclosHint", "No se pudo cargar");
        console.error(e);
    }

    // 2) Alertas activas (badge)
    let alertasCount = null;

    try {
        const r = await api("/api/alertas/badge");
        const d = r.data;
        alertasCount =
            typeof d === "number"
                ? d
                : typeof d?.count === "number"
                    ? d.count
                    : typeof d?.total === "number"
                        ? d.total
                        : null;
    } catch (e) {
        console.error(e);
    }

    // Fallback: si badge no sirve, intentamos activas
    if (alertasCount === null) {
        try {
            const r = await api("/api/alertas/activas");
            const arr = Array.isArray(r.data) ? r.data : [];
            alertasCount = arr.length;
        } catch (e) {
            alertasCount = 0;
            console.error(e);
        }
    }

    setText("kpiAlertas", alertasCount);
    setBadge(alertasCount);

    // 3) Consumos hoy (placeholder)
    setText("kpiConsumosHoy", "—");
    setText("kpiConsumosHint", "Conecta el reporte diario cuando definamos su formato");

    setStatus("KPIs cargados");
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = String(val ?? "");
}

function setStatus(msg) {
    setText("inicioStatus", msg);
}

function setBadge(n) {
    const badge = document.getElementById("badgeAlertas");
    const dot = badge?.querySelector(".dot");
    if (!badge || !dot) return;

    dot.textContent = String(n ?? 0);
    badge.classList.toggle("badge-red", (n ?? 0) > 0);
}

/* =========================
   Gráfico Plagas (Inicio)
   ========================= */

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

function isoDate(d) {
    return d.toISOString().slice(0, 10);
}

function formatPeriodoLabel(periodoISO, agrupacion) {
    // periodoISO viene como "YYYY-MM-DD"
    if (!periodoISO) return "";
    if (agrupacion === "ANIO") return periodoISO.slice(0, 4); // YYYY
    if (agrupacion === "MES") return periodoISO.slice(0, 7);  // YYYY-MM
    return periodoISO; // DIA -> YYYY-MM-DD
}

async function cargarGraficoPlagasInicio() {
    await ensureChartJs();

    // ✅ Para MES: usar un rango por meses (no "últimos 30 días") para que aparezcan varios meses
    const hasta = new Date();
    const desde = new Date();

    // últimos 6 meses (ajusta a 3 si querés)
    desde.setMonth(hasta.getMonth() - 6);
    desde.setDate(1);
    desde.setHours(0, 0, 0, 0);

    // fin del mes actual
    const finMes = new Date(hasta.getFullYear(), hasta.getMonth() + 1, 0);
    finMes.setHours(23, 59, 59, 999);

    const agrupacion = "MES";

    const qs = new URLSearchParams({
        fechaDesde: isoDate(desde),
        fechaHasta: isoDate(finMes),
        agrupacion
    }).toString();

    const r = await api(`/api/plagas/grafica?${qs}`);
    const data = r?.data;

    const rows = (Array.isArray(data) ? data : []).map((x) => ({
        periodo: (x.periodo || x.Periodo || "").toString().slice(0, 10),
        plaga: x.plagaNombre ?? x.PlagaNombre ?? "",
        total: x.totalCantidad ?? x.TotalCantidad ?? 0
    }));

    // Labels formateados por agrupación (MES => YYYY-MM)
    const labels = [...new Set(rows.map((r) => formatPeriodoLabel(r.periodo, agrupacion)))].sort();
    const plagas = [...new Set(rows.map((r) => r.plaga))].sort();

    // Dataset por plaga
    const datasets = plagas.map((p) => {
        const map = new Map(
            rows
                .filter((r) => r.plaga === p)
                .map((r) => [formatPeriodoLabel(r.periodo, agrupacion), r.total])
        );

        return {
            label: p,
            data: labels.map((d) => map.get(d) ?? 0),
            tension: 0.25
        };
    });

    const canvas = document.getElementById("chartPlagasInicio");
    if (!canvas) return;

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        resizeDelay: 150,
        plugins: { legend: { position: "bottom" } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    };

    // ✅ Si solo hay 1 mes, se ve mejor como barras
    const chartType = labels.length <= 1 ? "bar" : "line";

    if (!chartPlagasInicio) {
        chartPlagasInicio = new window.Chart(canvas, {
            type: chartType,
            data: { labels, datasets },
            options
        });
    } else {
        // Si cambia el tipo (bar/line), hay que recrear
        if (chartPlagasInicio.config.type !== chartType) {
            chartPlagasInicio.destroy();
            chartPlagasInicio = new window.Chart(canvas, {
                type: chartType,
                data: { labels, datasets },
                options
            });
        } else {
            chartPlagasInicio.data.labels = labels;
            chartPlagasInicio.data.datasets = datasets;
            chartPlagasInicio.options = options;
            chartPlagasInicio.update("none");
        }
    }

    const hint = document.getElementById("plagasMiniHint");
    if (hint) hint.textContent = `Últimos 6 meses · ${labels.length} meses con datos`;
}