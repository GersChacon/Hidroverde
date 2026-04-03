import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api, fmt } from "../services/api";
import { useChartJs } from "../hooks/useChartJs";
import KpiCard from "../components/KpiCard";
import Spinner from "../components/Spinner";

const PALETTE = [
  "#4ade80","#60a5fa","#f97316","#f43f5e","#a78bfa","#facc15","#2dd4bf",
];

export default function Inicio() {
  const nav        = useNavigate();
  const chartReady = useChartJs();
  const canvasRef  = useRef(null);
  const chartRef   = useRef(null);

  const [kpis, setKpis]           = useState({ ciclos: null, alertas: null, consumosHoy: null, inventario: null, ventas: null });
  const [loading, setLoading]     = useState(true);
  const [plagasData, setPlagasData] = useState(null);
  const [ventasRecientes, setVentasRecientes] = useState([]);

  useEffect(() => {
    async function cargar() {
      setLoading(true);
      const res = { ciclos: "—", alertas: "—", consumosHoy: "—", inventario: "—", ventas: "—" };

      try {
        const r = await api("/api/ciclos/activos");
        res.ciclos = Array.isArray(r.data) ? r.data.length : 0;
      } catch { /* no-op */ }

      try {
        const r = await api("/api/alertas/badge");
        const d = r.data;
        res.alertas =
          typeof d === "number" ? d :
          typeof d?.badgeCount === "number" ? d.badgeCount :
          typeof d?.count === "number" ? d.count : 0;
      } catch { /* no-op */ }

      try {
        const today = new Date().toISOString().slice(0, 10);
        const r = await api(`/api/consumos?desde=${today}&hasta=${today}`);
        const arr = Array.isArray(r.data) ? r.data : r.data?.items ?? [];
        res.consumosHoy = arr.length;
      } catch { /* no-op */ }

      try {
        const r = await api("/api/inventario/actual?soloDisponibles=true");
        const arr = Array.isArray(r.data) ? r.data : [];
        res.inventario = arr.reduce((s, i) => s + Number(i.cantidadDisponible ?? 0), 0);
      } catch { /* no-op */ }

      try {
        const r = await api("/api/Venta");
        const arr = Array.isArray(r.data) ? r.data : [];
        res.ventas = arr.length;
        setVentasRecientes(arr.slice(0, 5));
      } catch { /* no-op */ }

      setKpis(res);
      setLoading(false);
    }
    cargar();
  }, []);

  // Plagas chart
  useEffect(() => {
    async function cargarPlagas() {
      try {
        const hoy   = new Date();
        const desde = new Date(hoy.getFullYear(), hoy.getMonth() - 5, 1).toISOString().slice(0,10);
        const hasta = hoy.toISOString().slice(0,10);
        const r = await api(`/api/plagas/grafica?agrupacion=MES&fechaDesde=${desde}&fechaHasta=${hasta}`);
        if (Array.isArray(r.data) && r.data.length) setPlagasData(r.data);
      } catch { /* optional */ }
    }
    cargarPlagas();
  }, []);

  useEffect(() => {
    if (!chartReady || !plagasData || !canvasRef.current) return;
    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }

    const periodos = [...new Set(plagasData.map(d => d.periodo))].sort();
    const plagas   = [...new Set(plagasData.map(d => d.plagaNombre))];

    const datasets = plagas.map((plaga, idx) => ({
      label: plaga,
      data:  periodos.map(p => {
        const item = plagasData.find(d => d.periodo === p && d.plagaNombre === plaga);
        return item?.totalIncidencias ?? 0;
      }),
      backgroundColor: PALETTE[idx % PALETTE.length] + "bb",
      borderColor: PALETTE[idx % PALETTE.length],
      borderWidth: 1,
      borderRadius: 6,
    }));

    chartRef.current = new window.Chart(canvasRef.current, {
      type: "bar",
      data: { labels: periodos, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } } },
        scales: {
          x: { stacked: false, grid: { display: false } },
          y: { stacked: false, beginAtZero: true, grid: { color: "rgba(0,0,0,0.04)" }, ticks: { stepSize: 1 } },
        },
      },
    });

    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [chartReady, plagasData]);

  const hora = new Date().getHours();
  const saludo = hora < 12 ? "Buenos días" : hora < 18 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-gray-900">{saludo} 👋</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            Resumen de tu sistema hidropónico ·{" "}
            {new Date().toLocaleDateString("es-CR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <button onClick={() => nav("/alertas")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-50 border border-yellow-200
                     text-yellow-700 font-bold text-sm hover:bg-yellow-100 transition-all">
          🔔 Alertas
          <span className="bg-yellow-200 text-yellow-800 rounded-full px-2 text-xs font-black">
            {kpis.alertas ?? "…"}
          </span>
        </button>
      </div>

      {/* KPI Cards */}
      {loading ? <Spinner /> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <KpiCard icon="🌱" label="Ciclos activos"  value={kpis.ciclos}      hint={kpis.ciclos > 0 ? "Hay ciclos en curso" : "Sin ciclos activos"} color="green" />
          <KpiCard icon="🔔" label="Alertas"         value={kpis.alertas}     hint="Stock bajo / notificaciones" color="orange" />
          <KpiCard icon="💧" label="Consumos hoy"    value={kpis.consumosHoy} hint="Registros del día" color="blue" />
          <KpiCard icon="📦" label="Stock total"      value={kpis.inventario}  hint="Unidades disponibles" color="green" />
          <KpiCard icon="💰" label="Ventas"           value={kpis.ventas}      hint="Total registradas" color="blue" />
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left: Chart */}
        <div className="lg:col-span-3 card">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-gray-900">Incidencias de plagas</h3>
              <p className="text-xs text-gray-400">
                {plagasData ? `Últimos 6 meses · ${[...new Set(plagasData.map(d => d.periodo))].length} mes(es)` : "Últimos 6 meses"}
              </p>
            </div>
            <button onClick={() => nav("/plagas")} className="text-green-600 font-bold text-sm hover:text-green-800">
              Ver detalle ↗
            </button>
          </div>
          <div style={{ position: "relative", height: 220 }}>
            {!plagasData ? (
              <div className="flex items-center justify-center h-full text-gray-300 text-sm">Sin datos de plagas</div>
            ) : (
              <canvas ref={canvasRef} />
            )}
          </div>
        </div>

        {/* Right: Quick actions + recent sales */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Quick actions */}
          <div className="card">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Acciones rápidas</h3>
            <div className="flex flex-col gap-2">
              {[
                { icon: "🌱", title: "Nueva siembra",       to: "/ciclos" },
                { icon: "💧", title: "Registrar consumo",   to: "/consumos" },
                { icon: "💰", title: "Nueva venta",         to: "/ventas" },
                { icon: "📦", title: "Ver inventario",      to: "/inventario-real" },
                { icon: "🎯", title: "KPIs & Metas",        to: "/kpis" },
              ].map(({ icon, title, to }) => (
                <button key={to} onClick={() => nav(to)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left
                             hover:bg-green-50 transition-all cursor-pointer group">
                  <span className="text-lg w-7 text-center">{icon}</span>
                  <span className="font-semibold text-gray-700 text-sm group-hover:text-green-700 transition-colors">{title}</span>
                  <span className="ml-auto text-gray-300 group-hover:text-green-400 text-xs">→</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent sales */}
          {ventasRecientes.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900 text-sm">Últimas ventas</h3>
                <button onClick={() => nav("/ventas")} className="text-green-600 font-bold text-xs hover:text-green-800">
                  Ver todas ↗
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {ventasRecientes.map(v => (
                  <div key={v.ventaId} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <div className="font-semibold text-sm text-gray-800">
                        {v.nombreCliente ?? `Venta #${v.ventaId}`}
                      </div>
                      <div className="text-xs text-gray-400">{fmt.fecha(v.fechaPedido)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-gray-900">{fmt.moneda(v.total)}</div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                        ${v.nombreEstadoVenta?.toLowerCase() === "entregado"
                          ? "bg-green-100 text-green-700"
                          : v.nombreEstadoVenta?.toLowerCase() === "cancelado"
                          ? "bg-red-100 text-red-600"
                          : "bg-yellow-100 text-yellow-700"
                        }`}>
                        {v.nombreEstadoVenta ?? "—"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* System status */}
      <div className="card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <div>
            <span className="font-bold text-gray-900 text-sm">Sistema operativo</span>
            <span className="text-xs text-gray-400 ml-2">Todos los servicios activos</span>
          </div>
        </div>
        <a href="/swagger" target="_blank" rel="noreferrer"
           className="text-green-600 font-bold text-sm hover:text-green-800">
          API Swagger ↗
        </a>
      </div>
    </div>
  );
}
