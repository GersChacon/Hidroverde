import { api } from "../lib/http.js";
import { escapeHtml } from "../lib/dom.js";

export function init() {
    // Add period change listener to enable/disable month input
    const periodoSelect = document.getElementById("periodoSelect");
    const mesInput = document.getElementById("mesInput");

    if (periodoSelect && mesInput) {
        periodoSelect.addEventListener("change", function (e) {
            mesInput.disabled = e.target.value !== "mensual";
            if (e.target.value !== "mensual") {
                mesInput.value = "";
            }
        });
    }

    document.getElementById("btnActualizar")?.addEventListener("click", cargarKpis);
    cargarKpis();
}

async function cargarKpis() {
    const periodo = document.getElementById("periodoSelect").value;
    const añoInput = document.getElementById("anioInput").value;
    const mesInput = document.getElementById("mesInput").value;

    // Build params properly
    const params = new URLSearchParams();
    params.append('periodo', periodo);

    if (añoInput && añoInput.trim() !== '') {
        params.append('año', añoInput);
    }

    if (mesInput && mesInput.trim() !== '' && periodo === 'mensual') {
        params.append('mes', mesInput);
    }

    const url = `/api/kpi/comparison?${params.toString()}`;
    console.log('Fetching KPIs from:', url);

    const grid = document.getElementById("kpiGrid");
    grid.innerHTML = '<div class="muted">Cargando...</div>';

    try {
        const { data } = await api(url);

        if (!data || data.length === 0) {
            grid.innerHTML = '<div class="muted">No hay datos para el período seleccionado</div>';
            return;
        }

        renderKpis(data);
    } catch (err) {
        console.error("API failed:", err);
        grid.innerHTML = `<div class="danger">Error al cargar KPIs: ${err.message}</div>`;
    }
}

function renderKpis(kpis) {
    const grid = document.getElementById("kpiGrid");
    if (!kpis || kpis.length === 0) {
        grid.innerHTML = '<div class="muted">No hay datos</div>';
        return;
    }

    grid.innerHTML = kpis.map(k => {
        const pct = k.percentage || ((k.actual / k.target) * 100);
        const displayPct = Math.min(pct, 100);

        return `
            <div class="kpi-card">
                <div class="kpi-name">${escapeHtml(k.kpiName)}</div>
                <div class="kpi-row">
                    <span>Actual:</span>
                    <span class="kpi-actual">${formatNumber(k.actual)} ${escapeHtml(k.unit)}</span>
                </div>
                <div class="kpi-row">
                    <span>Objetivo:</span>
                    <span class="kpi-target">${formatNumber(k.target)} ${escapeHtml(k.unit)}</span>
                </div>
                <div class="kpi-bar">
                    <div class="kpi-fill" style="width: ${displayPct}%;"></div>
                </div>
                <div class="kpi-row">
                    <span>Cumplimiento:</span>
                    <span class="kpi-percentage">${displayPct.toFixed(1)}%</span>
                </div>
                <div class="kpi-period muted">${escapeHtml(k.period || 'Período actual')}</div>
            </div>
        `;
    }).join("");
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toFixed(1);
}