import { api } from "../lib/http.js";

export async function init() {
    // Navegación: usa los botones del sidebar (no dependemos de funciones internas)
    const goTo = (page) => document.querySelector(`.nav button[data-page="${page}"]`)?.click();

    document.getElementById("goCiclos")?.addEventListener("click", () => goTo("ciclos"));
    document.getElementById("goConsumos")?.addEventListener("click", () => goTo("consumos"));
    document.getElementById("goAlertas")?.addEventListener("click", () => goTo("alertas"));

    // Cargar KPIs
    await cargarKpis();
}

async function cargarKpis() {
    setStatus("Cargando KPIs...");

    // 1) Ciclos activos
    try {
        const r = await api("/api/ciclos/activos");
        const ciclos = Array.isArray(r.data) ? r.data : [];
        setText("kpiCiclos", ciclos.length);
        setText("kpiCiclosHint", ciclos.length ? "Hay ciclos en curso" : "No hay ciclos activos");
    } catch (e) {
        setText("kpiCiclos", "—");
        setText("kpiCiclosHint", "No se pudo cargar");
        console.error(e);
    }

    // 2) Badge / alertas activas
    let alertasCount = null;

    try {
        const r = await api("/api/alertas/badge");
        // Soporta varios formatos posibles (número directo o {count: n} o {total: n})
        const d = r.data;
        alertasCount =
            typeof d === "number" ? d :
                typeof d?.count === "number" ? d.count :
                    typeof d?.total === "number" ? d.total :
                        null;
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

    // 3) Consumos hoy (placeholder robusto)
    // No asumo formato del endpoint. Si tu reporte-diario devuelve algo usable,
    // después lo conectamos bien.
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

    // Clase visual: rojo si hay alertas
    badge.classList.toggle("badge-red", (n ?? 0) > 0);
}
