import { api } from "../lib/http.js";
import { $ } from "../lib/dom.js";

let chartPlagasInicio = null;

export async function init() {
    // goTo dispara el click en el botón del sidebar
    // Si el botón no existe (raro), usa un CustomEvent que app.js puede escuchar
    const goTo = (page) => {
        const btn = document.querySelector(`.nav button[data-page="${page}"]`);
        if (btn) {
            btn.click();
        } else {
            document.dispatchEvent(new CustomEvent("hidroverde:navigate", { detail: { page } }));
        }
    };

    $("#goCiclos")?.addEventListener("click", () => goTo("ciclos"));
    $("#goConsumos")?.addEventListener("click", () => goTo("consumos"));
    $("#goAlertas")?.addEventListener("click", () => goTo("alertas"));
    // El badge de alertas también navega directamente a la página de alertas
    const badge = document.getElementById("badgeAlertas");
    if (badge) badge.addEventListener("click", () => goTo("alertas"));
    $("#goPlagas")?.addEventListener("click", (e) => {
        e.preventDefault();
        goTo("plagas");
    });

    cargarKpis().catch(console.error);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            cargarGraficoPlagasInicio().catch((err) => {
                console.error(err);
                const hint = document.getElementById("plagasMiniHint");
                if (hint) hint.textContent = "No se pudo cargar el gráfico";
            });
        });
    });
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
                : typeof d?.badgeCount === "number"
                    ? d.badgeCount
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

    // 3) Consumos hoy
    setText("kpiConsumosHoy", "—");
    setText("kpiConsumosHint", "Ver módulo de consumos");

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
    if (!periodoISO) return "";
    if (agrupacion === "ANIO") return periodoISO.slice(0, 4);
    if (agrupacion === "MES") return periodoISO.slice(0, 7);
    return periodoISO;
}

async function cargarGraficoPlagasInicio() {
    // ✅ FIX: verificar que el canvas exista antes de continuar
    const canvas = document.getElementById("chartPlagasInicio");
    if (!canvas) {
        console.warn("Canvas chartPlagasInicio no encontrado en el DOM");
        return;
    }

    await ensureChartJs();

    const hasta = new Date();
    const desde = new Date();
    desde.setMonth(hasta.getMonth() - 6);
    desde.setDate(1);
    desde.setHours(0, 0, 0, 0);

    const finMes = new Date(hasta.getFullYear(), hasta.getMonth() + 1, 0);
    finMes.setHours(23, 59, 59, 999);

    const agrupacion = "MES";

    const qs = new URLSearchParams({
        fechaDesde: isoDate(desde),
        fechaHasta: isoDate(finMes),
        agrupacion
    }).toString();

    let data = [];
    try {
        const r = await api(`/api/plagas/grafica?${qs}`);
        data = r?.data ?? [];
    } catch (e) {
        console.error("Error cargando gráfica de plagas:", e);
        const hint = document.getElementById("plagasMiniHint");
        if (hint) hint.textContent = "No se pudo cargar el gráfico";
        return;
    }

    const rows = (Array.isArray(data) ? data : []).map((x) => ({
        periodo: (x.periodo || x.Periodo || "").toString().slice(0, 10),
        plaga: x.plagaNombre ?? x.PlagaNombre ?? "",
        total: x.totalCantidad ?? x.TotalCantidad ?? 0
    }));

    const labels = [...new Set(rows.map((r) => formatPeriodoLabel(r.periodo, agrupacion)))].sort();
    const plagas = [...new Set(rows.map((r) => r.plaga))].sort();

    // Paleta de colores consistente
    const COLORS = [
        "rgba(99,205,132,.9)", "rgba(99,179,237,.9)", "rgba(246,173,85,.9)",
        "rgba(252,129,129,.9)", "rgba(154,117,255,.9)", "rgba(72,187,120,.9)"
    ];

    const datasets = plagas.map((p, i) => {
        const map = new Map(
            rows
                .filter((r) => r.plaga === p)
                .map((r) => [formatPeriodoLabel(r.periodo, agrupacion), r.total])
        );

        return {
            label: p,
            data: labels.map((d) => map.get(d) ?? 0),
            backgroundColor: COLORS[i % COLORS.length],
            borderColor: COLORS[i % COLORS.length].replace(".9)", "1)"),
            borderWidth: 1,
            borderRadius: 4
        };
    });

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        resizeDelay: 100,
        plugins: {
            legend: { position: "bottom" },
            tooltip: {
                callbacks: {
                    footer: (items) => {
                        const total = items.reduce((s, i) => s + i.parsed.y, 0);
                        return `Total: ${total}`;
                    }
                }
            }
        },
        scales: {
            x: { stacked: true },
            y: { stacked: true, beginAtZero: true, ticks: { precision: 0 } }
        }
    };

    const chartType = "bar";

    // ✅ FIX: destruir instancia previa si existe (evita "Canvas already in use")
    if (chartPlagasInicio) {
        chartPlagasInicio.destroy();
        chartPlagasInicio = null;
    }

    chartPlagasInicio = new window.Chart(canvas, {
        type: chartType,
        data: { labels, datasets },
        options
    });

    const hint = document.getElementById("plagasMiniHint");
    if (hint) {
        hint.textContent = rows.length === 0
            ? "Sin datos en los últimos 6 meses"
            : `Últimos 6 meses · ${labels.length} mes(es) con datos`;
    }
}
