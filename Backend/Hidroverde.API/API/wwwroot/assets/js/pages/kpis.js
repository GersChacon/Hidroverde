import { api } from "../lib/http.js";

let chartKpi = null;
let tabActivo = "cosechas";
let resumenCache = null;

// ─── Metas ────────────────────────────────────────────────
const METAS_KEY = "hidroverde_metas";

function cargarMetas() {
    try { const r = localStorage.getItem(METAS_KEY); if (r) return JSON.parse(r); } catch (_) {}
    return { cosechas: 10, ventas: 500000, consumos: 50 };
}
function guardarMetas(m) { localStorage.setItem(METAS_KEY, JSON.stringify(m)); }
function leerMetasDelForm() {
    return {
        cosechas: Number(document.getElementById("inputMetaCosechas")?.value || 10),
        ventas:   Number(document.getElementById("inputMetaVentas")?.value   || 500000),
        consumos: Number(document.getElementById("inputMetaConsumos")?.value || 50),
    };
}
function aplicarMetasAlForm(m) {
    [["inputMetaCosechas", m.cosechas], ["inputMetaVentas", m.ventas], ["inputMetaConsumos", m.consumos]]
        .forEach(([id, v]) => { const el = document.getElementById(id); if (el) el.value = v; });
}

// ─── Período ──────────────────────────────────────────────
function leerPeriodo() { return document.getElementById("kpiPeriodo")?.value || "mes_actual"; }

function rangoDesdePeriodo(periodo) {
    const ahora = new Date();
    let desde, hasta = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);
    if (periodo === "mes_actual")     desde = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    else if (periodo === "trimestre") desde = new Date(ahora.getFullYear(), ahora.getMonth() - 2, 1);
    else                              desde = new Date(ahora.getFullYear(), 0, 1);
    return { fechaDesde: desde.toISOString().slice(0, 10), fechaHasta: hasta.toISOString().slice(0, 10) };
}

function labelPeriodo(p) {
    return p === "mes_actual" ? "Este mes" : p === "trimestre" ? "Último trimestre" : "Este año";
}

// Devuelve los meses del período seleccionado en formato YYYY-MM
function mesesDelPeriodo(periodo) {
    const { fechaDesde, fechaHasta } = rangoDesdePeriodo(periodo);
    const meses = [];
    const d = new Date(fechaDesde + "T00:00:00");
    const h = new Date(fechaHasta + "T00:00:00");
    while (d <= h) {
        meses.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
        d.setMonth(d.getMonth() + 1);
    }
    return meses;
}

// ─── Cards ────────────────────────────────────────────────
function actualizarCard(id, { actual, meta, hint, esMoneda }) {
    const pct        = meta > 0 ? Math.min(100, Math.round((actual / meta) * 100)) : 0;
    const colorClass = pct >= 100 ? "ok" : pct >= 60 ? "warn" : "danger";
    const emoji      = pct >= 100 ? "✅" : pct >= 60 ? "🟡" : "🔴";
    const fmt        = (v) => esMoneda ? `₡${Math.round(v).toLocaleString("es-CR")}` : v.toLocaleString("es-CR");
    const set        = (elId, val) => { const el = document.getElementById(elId); if (el) el.textContent = val; };

    set(`num${id}`,    fmt(actual));
    set(`meta${id}`,   fmt(meta));
    set(`pct${id}`,    `${pct}%`);
    set(`hint${id}`,   hint);
    set(`estado${id}`, `${emoji} ${pct}%`);

    const barra = document.getElementById(`barra${id}`);
    if (barra) {
        barra.style.width = `${pct}%`;
        barra.classList.remove("barra-ok", "barra-warn", "barra-danger");
        barra.classList.add(`barra-${colorClass}`);
    }
    const card = document.getElementById(`card${id}`);
    if (card) {
        card.classList.remove("kpi-logrado", "kpi-riesgo");
        if (pct >= 100) card.classList.add("kpi-logrado");
        else if (pct < 40) card.classList.add("kpi-riesgo");
    }
}

// ─── Carga ────────────────────────────────────────────────
async function cargarKpis() {
    const periodo = leerPeriodo();
    const { fechaDesde, fechaHasta } = rangoDesdePeriodo(periodo);
    const metas = cargarMetas();
    const label = labelPeriodo(periodo);

    let resumen;
    try {
        const r = await api(`/api/kpis/resumen?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`);
        resumen = r.data;
    } catch (e) {
        console.error("Error KPIs:", e);
        ["Cosechas", "Ventas", "Consumos"].forEach(id =>
            actualizarCard(id, { actual: 0, meta: metas[id.toLowerCase()], hint: "Error al cargar", esMoneda: id === "Ventas" })
        );
        return;
    }

    resumenCache = resumen;

    const t = {};
    (resumen?.totales ?? []).forEach(x => { t[x.kpi] = Number(x.valor); });

    actualizarCard("Cosechas", { actual: t.cosechas ?? 0, meta: metas.cosechas, hint: `${t.cosechas ?? 0} ciclos cosechados · ${label}`, esMoneda: false });
    actualizarCard("Ventas",   { actual: t.ventas   ?? 0, meta: metas.ventas,   hint: `Ventas del período · ${label}`,                    esMoneda: true  });
    actualizarCard("Consumos", { actual: t.consumos ?? 0, meta: metas.consumos, hint: `${t.consumos ?? 0} registros · ${label}`,           esMoneda: false });

    renderGrafica(tabActivo);
}

// ─── Chart.js ─────────────────────────────────────────────
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

const COLORES = {
    cosechas: { solid: "rgba(99,205,132,1)",   mid: "rgba(99,205,132,.7)",   bg: "rgba(99,205,132,.12)"  },
    ventas:   { solid: "rgba(99,179,237,1)",   mid: "rgba(99,179,237,.7)",   bg: "rgba(99,179,237,.12)"  },
    consumos: { solid: "rgba(246,173,85,1)",   mid: "rgba(246,173,85,.7)",   bg: "rgba(246,173,85,.12)"  },
};

async function renderGrafica(tab) {
    await ensureChartJs();
    const canvas = document.getElementById("chartKpi");
    if (!canvas) return;

    const hint      = document.getElementById("chartKpiHint");
    const tendencia = (resumenCache?.tendencia ?? []).filter(t => t.kpi === tab);
    const metas     = cargarMetas();
    const metaValor = metas[tab];
    const color     = COLORES[tab];
    const nombre    = tab.charAt(0).toUpperCase() + tab.slice(1);
    const esMoneda  = tab === "ventas";
    const periodo   = leerPeriodo();

    // Meses resaltados (los del período seleccionado en el filtro)
    const mesesActivos = new Set(mesesDelPeriodo(periodo));

    if (chartKpi) { chartKpi.destroy(); chartKpi = null; }

    if (tendencia.length === 0) {
        if (hint) hint.textContent = "Sin datos en los últimos 6 meses";
        // Mostrar gráfica vacía con mensaje
        chartKpi = new window.Chart(canvas, {
            type: "bar",
            data: { labels: ["Sin datos"], datasets: [{ data: [0], backgroundColor: "rgba(255,255,255,.05)" }] },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                scales: { y: { beginAtZero: true, max: 1 } }
            }
        });
        return;
    }

    // Asegurar que todos los 6 meses aparezcan (relleno con 0 los que no tienen datos)
    const hoy   = new Date();
    const todos = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
        todos.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }

    // Construir valores con los 6 meses completos
    const mapaValores = new Map(tendencia.map(t => [t.periodo, Number(t.valor)]));
    const labels  = todos;
    const valores = todos.map(m => mapaValores.get(m) ?? 0);

    // Colores de puntos/barras: resaltar período activo
    const puntosColor = labels.map(m =>
        mesesActivos.has(m) ? color.solid : color.mid
    );
    const barrasBg = labels.map(m =>
        mesesActivos.has(m) ? color.mid : color.bg
    );
    const barrasBorder = labels.map(m =>
        mesesActivos.has(m) ? color.solid : "transparent"
    );

    // Línea de meta
    const metaDataset = {
        type: "line",
        label: "Meta",
        data: labels.map(() => metaValor),
        borderColor: "rgba(255,99,99,.5)",
        borderDash: [5, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
        tension: 0,
        order: 0
    };

    // Dataset principal como barras (siempre más legible que línea con pocos períodos)
    const dataDataset = {
        type: "bar",
        label: nombre,
        data: valores,
        backgroundColor: barrasBg,
        borderColor: barrasBorder,
        borderWidth: 2,
        borderRadius: 6,
        order: 1
    };

    // Línea de tendencia encima de las barras
    const tendenciaDataset = {
        type: "line",
        label: `Tendencia`,
        data: valores,
        borderColor: color.solid,
        borderWidth: 2,
        pointRadius: labels.map(m => mesesActivos.has(m) ? 6 : 3),
        pointBackgroundColor: puntosColor,
        pointBorderColor: "#fff",
        pointBorderWidth: 1.5,
        fill: false,
        tension: 0.3,
        order: 2
    };

    const maxValor = Math.max(...valores, metaValor);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 400, easing: "easeOutQuart" },
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    filter: (item) => item.text !== "Tendencia", // ocultar tendencia de la leyenda
                    usePointStyle: true,
                    padding: 16
                }
            },
            tooltip: {
                callbacks: {
                    title: (items) => {
                        const label = items[0].label;
                        return mesesActivos.has(label) ? `${label} ← período activo` : label;
                    },
                    label: (ctx) => {
                        if (ctx.dataset.label === "Tendencia") return null; // no duplicar
                        const v = ctx.parsed.y;
                        const fmt = esMoneda ? `₡${Math.round(v).toLocaleString("es-CR")}` : v.toLocaleString("es-CR");
                        return ` ${ctx.dataset.label}: ${fmt}`;
                    },
                    afterBody: (items) => {
                        const v = items[0].parsed.y;
                        const pct = metaValor > 0 ? Math.round((v / metaValor) * 100) : 0;
                        const metaFmt = esMoneda ? `₡${metaValor.toLocaleString("es-CR")}` : metaValor;
                        return [``, `Meta: ${metaFmt}`, `Avance: ${pct}%`];
                    }
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    color: (ctx) => mesesActivos.has(labels[ctx.index]) ? "var(--text, #fff)" : "var(--muted, #8b9eb0)",
                    font: { weight: (ctx) => mesesActivos.has(labels[ctx?.index]) ? "bold" : "normal" }
                }
            },
            y: {
                beginAtZero: true,
                suggestedMax: maxValor * 1.2,
                ticks: {
                    precision: 0,
                    callback: (v) => esMoneda ? `₡${(v / 1000).toFixed(0)}k` : v
                },
                grid: { color: "rgba(255,255,255,.05)" }
            }
        }
    };

    chartKpi = new window.Chart(canvas, {
        type: "bar", // tipo base (los datasets pueden sobreescribir con `type`)
        data: { labels, datasets: [metaDataset, dataDataset, tendenciaDataset] },
        options
    });

    // Texto de pie del gráfico
    if (hint) {
        const total   = valores.reduce((a, b) => a + b, 0);
        const totFmt  = esMoneda ? `₡${Math.round(total).toLocaleString("es-CR")}` : total.toLocaleString("es-CR");
        const metaFmt = esMoneda ? `₡${metaValor.toLocaleString("es-CR")}` : metaValor;
        const mesesConDatos = valores.filter(v => v > 0).length;
        const resaltados = [...mesesActivos].filter(m => labels.includes(m)).join(", ");
        hint.textContent = `${nombre} · Últimos 6 meses · Total: ${totFmt} · Meta mensual: ${metaFmt}  ${resaltados ? `· Período activo: ${resaltados}` : ""}`;
    }
}

// ─── Init ─────────────────────────────────────────────────
export async function init() {
    console.log("✅ kpis.init()");
    aplicarMetasAlForm(cargarMetas());

    document.getElementById("btnKpiRefrescar")?.addEventListener("click", () => cargarKpis().catch(console.error));
    document.getElementById("kpiPeriodo")?.addEventListener("change", () => cargarKpis().catch(console.error));

    document.querySelectorAll(".kpi-tab").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".kpi-tab").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            tabActivo = btn.dataset.tab;
            renderGrafica(tabActivo);
        });
    });

    document.getElementById("btnGuardarMetas")?.addEventListener("click", () => {
        guardarMetas(leerMetasDelForm());
        cargarKpis().catch(console.error);
        const btn = document.getElementById("btnGuardarMetas");
        if (btn) {
            const orig = btn.textContent;
            btn.textContent = "✅ Guardado";
            setTimeout(() => { btn.textContent = orig; }, 1800);
        }
    });

    await cargarKpis();
}
