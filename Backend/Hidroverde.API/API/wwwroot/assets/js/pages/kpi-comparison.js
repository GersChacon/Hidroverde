import { api } from "../lib/http.js";
import { escapeHtml } from "../lib/dom.js";

export function init() {
    document.getElementById("btnActualizar")?.addEventListener("click", cargarKpis);
    cargarKpis();
}

async function cargarKpis() {
    const periodo = document.getElementById("periodoSelect").value;
    const año = document.getElementById("anioInput").value || undefined;
    const mes = document.getElementById("mesInput").value || undefined;

    const params = new URLSearchParams({ periodo, año, mes }).toString();
    const url = `/api/kpi/comparison?${params}`;

    const grid = document.getElementById("kpiGrid");
    grid.innerHTML = '<div class="muted">Cargando...</div>';

    try {
        const { data } = await api(url);
        renderKpis(data);
    } catch (err) {
        console.warn("API failed, using mock data", err);
        // Mock data fallback
        const mockKpis = getMockKpis(periodo, año, mes);
        renderKpis(mockKpis);
    }
}

function getMockKpis(periodo, año, mes) {
    const periodText = periodo === 'mensual' && mes && año
        ? `${getMonthName(parseInt(mes))} ${año}`
        : periodo === 'anual' && año
            ? `Año ${año}`
            : 'Período actual';

    return [
        { kpiName: "Cosechas (kg)", actual: 1250, target: 1500, unit: "kg", period: periodText, percentage: 83.3 },
        { kpiName: "Ventas (₡)", actual: 3250000, target: 3000000, unit: "₡", period: periodText, percentage: 108.3 },
        { kpiName: "Consumo agua (L)", actual: 4500, target: 4000, unit: "L", period: periodText, percentage: 112.5 },
        { kpiName: "Eficiencia (kg/L)", actual: 0.28, target: 0.35, unit: "kg/L", period: periodText, percentage: 80.0 }
    ];
}

function getMonthName(month) {
    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre", "Diciembre"];
    return months[month - 1] || "Mes " + month;
}

function renderKpis(kpis) {
    const grid = document.getElementById("kpiGrid");
    if (!kpis || kpis.length === 0) {
        grid.innerHTML = '<div class="muted">No hay datos</div>';
        return;
    }

    grid.innerHTML = kpis.map(k => {
        const pct = Math.min(k.percentage || ((k.actual / k.target) * 100), 100);
        return `
            <div class="kpi-card">
                <div class="kpi-name">${escapeHtml(k.kpiName)}</div>
                <div class="kpi-row">
                    <span>Actual:</span>
                    <span class="kpi-actual">${escapeHtml(k.actual)} ${escapeHtml(k.unit)}</span>
                </div>
                <div class="kpi-row">
                    <span>Objetivo:</span>
                    <span class="kpi-target">${escapeHtml(k.target)} ${escapeHtml(k.unit)}</span>
                </div>
                <div class="kpi-bar">
                    <div class="kpi-fill" style="width: ${pct}%;"></div>
                </div>
                <div class="kpi-row">
                    <span>Cumplimiento:</span>
                    <span class="kpi-percentage">${pct.toFixed(1)}%</span>
                </div>
                <div class="kpi-period muted">${escapeHtml(k.period)}</div>
            </div>
        `;
    }).join("");
}