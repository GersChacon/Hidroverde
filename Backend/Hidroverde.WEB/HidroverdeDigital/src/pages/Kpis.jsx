// KpiResumenResponse: { totales: KpiTotalDto[], tendencia: KpiTendenciaDto[] }
// KpiTotalDto: { kpi: "cosechas"|"ventas"|"consumos", valor: number }
// KpiTendenciaDto: { kpi: string, periodo: "YYYY-MM", valor: number }
// GET /api/Kpis/resumen?fechaDesde=&fechaHasta=

import { useState, useEffect, useCallback, useRef } from "react";
import { api, fmt } from "../services/api";
import { useChartJs } from "../hooks/useChartJs";
import Spinner from "../components/Spinner";

const METAS_KEY = "hidroverde_metas";

function loadMetas() {
  try { const r = localStorage.getItem(METAS_KEY); if (r) return JSON.parse(r); } catch (_) {}
  return { cosechas: 10, ventas: 500000, consumos: 50 };
}

function rangoDesdePeriodo(p) {
  const ahora = new Date();
  const hasta = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);
  let desde;
  if (p === "mes_actual")   desde = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  else if (p === "trimestre") desde = new Date(ahora.getFullYear(), ahora.getMonth() - 2, 1);
  else                       desde = new Date(ahora.getFullYear(), 0, 1);
  return {
    fechaDesde: desde.toISOString().slice(0, 10),
    fechaHasta: hasta.toISOString().slice(0, 10),
  };
}

const KPI_META = {
  cosechas: { label: "Cosechas", sub: "Ciclos cosechados",    icon: "🌾", color: "green",  esMoneda: false },
  ventas:   { label: "Ventas",   sub: "Ingresos del período", icon: "💰", color: "blue",   esMoneda: true  },
  consumos: { label: "Consumos", sub: "Recursos utilizados",  icon: "🧪", color: "orange", esMoneda: false },
};

const BAR_COLORS = {
  green:  "bg-green-400",
  blue:   "bg-blue-400",
  orange: "bg-orange-400",
};

export default function Kpis() {
  const [periodo, setPeriodo]   = useState("mes_actual");
  const [loading, setLoading]   = useState(true);
  const [totales, setTotales]   = useState({});    // { cosechas: N, ventas: N, consumos: N }
  const [tendencia, setTendencia] = useState([]);  // KpiTendenciaDto[]
  const [metas, setMetas]       = useState(loadMetas());
  const [metasForm, setMetasForm] = useState(loadMetas());
  const [tabActivo, setTabActivo] = useState("cosechas");

  const chartReady = useChartJs();
  const canvasRef  = useRef(null);
  const chartRef   = useRef(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    const { fechaDesde, fechaHasta } = rangoDesdePeriodo(periodo);
    try {
      const r = await api(`/api/Kpis/resumen?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`);
      const data = r.data;
      // totales → array de KpiTotalDto
      const tot = {};
      if (Array.isArray(data?.totales)) {
        data.totales.forEach(t => { tot[t.kpi?.toLowerCase()] = t.valor; });
      }
      setTotales(tot);
      setTendencia(Array.isArray(data?.tendencia) ? data.tendencia : []);
    } catch { setTotales({}); setTendencia([]); }
    setLoading(false);
  }, [periodo]);

  useEffect(() => { cargar(); }, [cargar]);

  // Renderizar gráfico de tendencia
  useEffect(() => {
    if (!chartReady || !canvasRef.current) return;
    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }

    const datosFiltrados = tendencia.filter(t => t.kpi?.toLowerCase() === tabActivo);
    if (!datosFiltrados.length) return;

    const periodos = [...new Set(datosFiltrados.map(t => t.periodo))].sort();
    const valores  = periodos.map(p => {
      const item = datosFiltrados.find(t => t.periodo === p);
      return item?.valor ?? 0;
    });

    const meta = metas[tabActivo] ?? 0;
    const metaLine = periodos.map(() => meta / Math.max(periodos.length, 1));

    const colorMap = { cosechas: "#4ade80", ventas: "#60a5fa", consumos: "#fb923c" };
    const color = colorMap[tabActivo] ?? "#4ade80";

    chartRef.current = new window.Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels: periodos,
        datasets: [
          {
            label: KPI_META[tabActivo]?.label ?? tabActivo,
            data: valores,
            backgroundColor: color + "99",
            borderColor: color,
            borderWidth: 2,
            borderRadius: 6,
            order: 2,
          },
          {
            label: "Meta",
            data: metaLine,
            type: "line",
            borderColor: "#f87171",
            borderDash: [6, 3],
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
            order: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const v = ctx.parsed.y;
                if (ctx.dataset.label === "Meta") return `Meta: ${fmt.moneda ? (KPI_META[tabActivo]?.esMoneda ? fmt.moneda(v) : v) : v}`;
                return KPI_META[tabActivo]?.esMoneda ? fmt.moneda(v) : v;
              },
            },
          },
        },
        scales: { y: { beginAtZero: true } },
      },
    });

    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [chartReady, tendencia, tabActivo, metas]);

  function guardarMetas() {
    localStorage.setItem(METAS_KEY, JSON.stringify(metasForm));
    setMetas({ ...metasForm });
    alert("Metas guardadas ✓");
  }

  const pct = (kpiKey) => {
    const actual = totales[kpiKey] ?? 0;
    const meta   = metas[kpiKey] ?? 1;
    return Math.min(100, Math.round((actual / meta) * 100));
  };

  const labelPeriodo = { mes_actual: "Este mes", trimestre: "Último trimestre", anio: "Este año" };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900">KPIs & Metas</h2>
          <p className="text-gray-400 text-sm">Seguimiento visual de Cosechas · Ventas · Consumos</p>
        </div>
        <div className="flex gap-2 items-center">
          <select
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-green-300"
            value={periodo} onChange={e => setPeriodo(e.target.value)}>
            <option value="mes_actual">Este mes</option>
            <option value="trimestre">Último trimestre</option>
            <option value="anio">Este año</option>
          </select>
          <button className="btn-primary" onClick={cargar}>↺ Refrescar</button>
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? <Spinner /> : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(KPI_META).map(([key, meta]) => {
            const actual = totales[key] ?? 0;
            const metaVal = metas[key] ?? 1;
            const p = pct(key);
            const estadoEmoji = p >= 100 ? "✅" : p >= 60 ? "🟡" : "🔴";
            const fmtVal = meta.esMoneda ? fmt.moneda(actual) : actual.toLocaleString("es-CR");
            const fmtMeta = meta.esMoneda ? fmt.moneda(metaVal) : metaVal.toLocaleString("es-CR");
            const hint = `${p}% · ${labelPeriodo[periodo]}`;

            return (
              <div key={key} className="card flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-black text-gray-900">{meta.label}</div>
                    <div className="text-xs text-gray-400">{meta.sub}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500">{estadoEmoji} {p}%</span>
                    <span className="text-2xl">{meta.icon}</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-gray-900">{fmtVal}</span>
                  <span className="text-sm text-gray-400">/ {fmtMeta} meta</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${BAR_COLORS[meta.color]}`}
                       style={{ width: `${p}%`, transition: "width 0.5s" }} />
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{p}%</span>
                  <span>{hint}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Gráfica de tendencia */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-gray-900">Tendencia de KPIs</h3>
          <div className="flex gap-2">
            {Object.entries(KPI_META).map(([key, meta]) => (
              <button key={key} onClick={() => setTabActivo(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ` +
                  (tabActivo === key
                    ? "bg-green-100 border-green-300 text-green-800"
                    : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50")}>
                {meta.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ position: "relative", height: 220 }}>
          {!tendencia.filter(t => t.kpi?.toLowerCase() === tabActivo).length ? (
            <div className="flex items-center justify-center h-full text-gray-300 text-sm">
              Sin datos de tendencia para este período
            </div>
          ) : (
            <canvas ref={canvasRef} />
          )}
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">
          {KPI_META[tabActivo]?.label} · {labelPeriodo[periodo]}
          {tendencia.filter(t => t.kpi?.toLowerCase() === tabActivo).length > 0
            ? ` · Total: ${tendencia.filter(t => t.kpi?.toLowerCase() === tabActivo).reduce((s,t) => s + t.valor, 0).toLocaleString("es-CR")}`
            : ""}
        </p>
      </div>

      {/* Configurar metas */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-black text-gray-900">⚙ Configurar metas</h3>
            <p className="text-xs text-gray-400 mt-0.5">Las metas se guardan localmente en tu navegador</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="field">
            <label>🌾 Meta cosechas (ciclos/período)</label>
            <input type="number" min="1" value={metasForm.cosechas}
              onChange={e => setMetasForm(f => ({ ...f, cosechas: Number(e.target.value) }))} />
          </label>
          <label className="field">
            <label>💰 Meta ventas (monto CRC)</label>
            <input type="number" min="1" step="1000" value={metasForm.ventas}
              onChange={e => setMetasForm(f => ({ ...f, ventas: Number(e.target.value) }))} />
          </label>
          <label className="field">
            <label>🧪 Meta consumos (registros)</label>
            <input type="number" min="1" value={metasForm.consumos}
              onChange={e => setMetasForm(f => ({ ...f, consumos: Number(e.target.value) }))} />
          </label>
        </div>
        <div className="flex justify-end mt-4">
          <button className="btn-primary" onClick={guardarMetas}>💾 Guardar metas</button>
        </div>
      </div>
    </div>
  );
}
