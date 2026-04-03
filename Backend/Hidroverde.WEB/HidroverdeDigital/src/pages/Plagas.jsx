// Plagas — tabla y gráfico con filtros INDEPENDIENTES
// La tabla filtra por: fechaDesde, fechaHasta, plagaId
// El gráfico filtra por: agrupacion + rango propio (semana/quincena/mes/trimestre)

import { useState, useEffect, useCallback, useRef } from "react";
import { api, fmt } from "../services/api";
import { useChartJs } from "../hooks/useChartJs";
import { usePaginacion } from "../hooks/usePaginacion";
import Modal from "../components/Modal";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import Paginacion from "../components/Paginacion";

const PALETTE = ["#4ade80","#60a5fa","#f97316","#f43f5e","#a78bfa","#facc15","#2dd4bf"];

// Agrupa datos diarios por semana en el frontend
function agruparPorSemana(data) {
  const grupos = {};
  data.forEach(item => {
    const fecha = new Date((item.periodo ?? "").split("T")[0]);
    if (isNaN(fecha)) return;
    // Lunes de la semana como clave
    const day = fecha.getDay(); // 0=dom
    const diff = (day === 0 ? -6 : 1 - day);
    const lunes = new Date(fecha);
    lunes.setDate(fecha.getDate() + diff);
    const key = lunes.toISOString().slice(0, 10);
    if (!grupos[key]) grupos[key] = {};
    const plaga = item.plagaNombre;
    if (!grupos[key][plaga]) grupos[key][plaga] = 0;
    grupos[key][plaga] += item.totalIncidencias ?? item.totalCantidad ?? 0;
  });
  // Convertir a array con mismo formato que la API
  const result = [];
  Object.entries(grupos).sort(([a],[b]) => a.localeCompare(b)).forEach(([semana, plagas]) => {
    Object.entries(plagas).forEach(([plagaNombre, total]) => {
      result.push({ periodo: semana, plagaNombre, totalIncidencias: total });
    });
  });
  return result;
}

function rangoDesde(tipo) {
  const hoy  = new Date();
  const hasta = hoy.toISOString().slice(0, 10);
  const d = new Date(hoy);
  if (tipo === "semana")    d.setDate(d.getDate() - 7);
  else if (tipo === "quincena") d.setDate(d.getDate() - 15);
  else if (tipo === "mes")  d.setMonth(d.getMonth() - 1);
  else                      d.setMonth(d.getMonth() - 3); // trimestre
  return { desde: d.toISOString().slice(0, 10), hasta };
}

export default function Plagas() {
  const [registros, setRegistros]       = useState([]);
  const [graficaData, setGraficaData]   = useState([]);
  const [catalogo, setCatalogo]         = useState([]);
  const [loadingTabla, setLoadingTabla] = useState(true);
  const [loadingGraf, setLoadingGraf]   = useState(true);

  // Filtros TABLA (independientes)
  const [fTabla, setFTabla] = useState({ desde: "", hasta: "", plagaId: "" });
  // Filtros GRÁFICO (independientes)
  const [fGraf, setFGraf]   = useState({ rango: "mes", agrupacion: "DIA" });

  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState({ fecha: new Date().toISOString().slice(0,10), plagaId: "", cantidad: 1, comentario: "" });
  const [saving, setSaving]       = useState(false);

  const chartReady = useChartJs();
  const canvasRef  = useRef(null);
  const chartRef   = useRef(null);

  const { paginados, pagina, totalPaginas, setPagina, total } = usePaginacion(registros);

  useEffect(() => {
    api("/api/plagas/catalogo")
      .then(r => setCatalogo(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
  }, []);

  // Cargar TABLA
  const cargarTabla = useCallback(async () => {
    setLoadingTabla(true);
    setPagina(1);
    const p = new URLSearchParams();
    if (fTabla.desde)   p.set("fechaDesde", fTabla.desde);
    if (fTabla.hasta)   p.set("fechaHasta", fTabla.hasta);
    if (fTabla.plagaId) p.set("plagaId", fTabla.plagaId);
    try {
      const r = await api(`/api/plagas${p.toString() ? "?" + p.toString() : ""}`);
      setRegistros(Array.isArray(r.data) ? r.data : []);
    } catch { setRegistros([]); }
    setLoadingTabla(false);
  }, [fTabla, setPagina]);

  // Cargar GRÁFICO
  const cargarGrafico = useCallback(async () => {
    setLoadingGraf(true);
    const { desde, hasta } = rangoDesde(fGraf.rango);
    const p = new URLSearchParams();
    p.set("fechaDesde", desde);
    p.set("fechaHasta", hasta);
    // Si agrupacion es SEMANA, pedimos DIA y agrupamos en el frontend
    p.set("agrupacion", fGraf.agrupacion === "SEMANA" ? "DIA" : fGraf.agrupacion);
    try {
      const r = await api(`/api/plagas/grafica?${p.toString()}`);
      let data = Array.isArray(r.data) ? r.data : [];
      if (fGraf.agrupacion === "SEMANA") data = agruparPorSemana(data);
      setGraficaData(data);
    } catch { setGraficaData([]); }
    setLoadingGraf(false);
  }, [fGraf]);

  useEffect(() => { cargarTabla(); }, [cargarTabla]);
  useEffect(() => { cargarGrafico(); }, [cargarGrafico]);

  // Renderizar gráfico
  useEffect(() => {
    if (!chartReady || !canvasRef.current) return;
    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
    if (!graficaData.length) return;

    const periodos = [...new Set(graficaData.map(d => d.periodo ?? ""))].sort();
    const plagas   = [...new Set(graficaData.map(d => d.plagaNombre))];

    const datasets = plagas.map((plaga, idx) => ({
      label: plaga,
      data: periodos.map(p => {
        const item = graficaData.find(d => (d.periodo ?? "") === p && d.plagaNombre === plaga);
        return item?.totalIncidencias ?? item?.totalCantidad ?? 0;
      }),
    }));

    // Formatear labels del eje X según agrupación
    const formatLabel = (raw) => {
      if (!raw) return raw;
      const clean = String(raw).split("T")[0];
      if (fGraf.agrupacion === "ANIO") return clean.slice(0, 4);
      if (fGraf.agrupacion === "MES") {
        const [y, m] = clean.split("-");
        const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
        return `${meses[Number(m)-1]} ${y}`;
      }
      if (fGraf.agrupacion === "SEMANA") {
        // Mostrar "Sem dd/MM"
        const [, m, d] = clean.split("-");
        return `Sem ${d}/${m}`;
      }
      // DIA: dd/MM
      const [, m, d] = clean.split("-");
      return `${d}/${m}`;
    };

    const labels = periodos.map(formatLabel);

    chartRef.current = new window.Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels,
        datasets: datasets.map((ds, idx) => ({
          ...ds,
          backgroundColor: PALETTE[idx % PALETTE.length] + "cc",
          borderColor: PALETTE[idx % PALETTE.length],
          borderWidth: 1,
          borderRadius: 3,
          fill: false,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            position: "bottom",
            labels: { boxWidth: 12, font: { size: 11 }, padding: 16 },
          },
          tooltip: {
            callbacks: {
              title: (items) => {
                const raw = periodos[items[0]?.dataIndex] ?? "";
                const clean = String(raw).split("T")[0];
                if (fGraf.agrupacion === "ANIO") return `Año ${clean.slice(0,4)}`;
                if (fGraf.agrupacion === "MES") {
                  const [y, m] = clean.split("-");
                  const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
                  return `${meses[Number(m)-1]} ${y}`;
                }
                if (fGraf.agrupacion === "SEMANA") {
                  const [y, m, d] = clean.split("-");
                  return `Semana del ${d}/${m}/${y}`;
                }
                const [y, m, d] = clean.split("-");
                return `${d}/${m}/${y}`;
              },
              footer: (items) => {
                const total = items.reduce((s, i) => s + (i.parsed.y || 0), 0);
                return `Total: ${total} incidencia${total !== 1 ? "s" : ""}`;
              },
            },
          },
        },
        scales: {
          x: {
            stacked: false,
            grid: { display: false },
            ticks: { font: { size: 11 } },
          },
          y: {
            stacked: false,
            beginAtZero: true,
            grid: { color: "rgba(0,0,0,0.05)" },
            ticks: { stepSize: 1, font: { size: 11 } },
            title: { display: true, text: "Incidencias", font: { size: 11 }, color: "#94a3b8" },
          },
        },
      },
    });
    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [chartReady, graficaData]);

  async function guardar() {
    setSaving(true);
    try {
      await api("/api/plagas", {
        method: "POST",
        body: { plagaId: Number(form.plagaId), fechaHallazgo: form.fecha, cantidad: Number(form.cantidad), comentario: form.comentario || null },
      });
      setShowModal(false);
      setForm({ fecha: new Date().toISOString().slice(0,10), plagaId: "", cantidad: 1, comentario: "" });
      cargarTabla();
      cargarGrafico();
    } catch (err) { alert(err.message); }
    setSaving(false);
  }

  const agrupLabel = { DIA: "Diario", SEMANA: "Semanal", MES: "Mensual", ANIO: "Anual" };
  const rangoLabel = { semana: "Última semana", quincena: "Últimas 2 semanas", mes: "Último mes", trimestre: "Último trimestre" };

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Plagas</h1>
          <p className="page-subtitle">Registro y seguimiento de incidencias</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ Registrar plaga</button>
      </div>

      {/* ── Sección tabla ───────────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Histórico de registros</h3>
          <span className="text-sm text-gray-400">{loadingTabla ? "" : `${total} registro${total !== 1 ? "s" : ""}`}</span>
        </div>

        {/* Filtros tabla */}
        <div className="filter-bar mb-4 pb-4 border-b border-gray-100">
          <label className="field"><label>Desde</label>
            <input type="date" value={fTabla.desde} onChange={e => setFTabla(f => ({ ...f, desde: e.target.value }))} />
          </label>
          <label className="field"><label>Hasta</label>
            <input type="date" value={fTabla.hasta} onChange={e => setFTabla(f => ({ ...f, hasta: e.target.value }))} />
          </label>
          <label className="field" style={{ minWidth: 150 }}>
            <label>Plaga</label>
            <select value={fTabla.plagaId} onChange={e => setFTabla(f => ({ ...f, plagaId: e.target.value }))}>
              <option value="">Todas</option>
              {catalogo.map(c => <option key={c.plagaId} value={c.plagaId}>{c.nombre}</option>)}
            </select>
          </label>
          <div className="filter-actions">
            <button className="btn-primary" onClick={cargarTabla}>Aplicar</button>
            <button className="btn" onClick={() => setFTabla({ desde: "", hasta: "", plagaId: "" })}>Limpiar</button>
          </div>
        </div>

        {loadingTabla ? <Spinner /> : registros.length === 0 ? (
          <EmptyState icon="🐛" title="Sin registros" subtitle="Registrá una incidencia o ajustá los filtros"
            action={<button className="btn-primary" onClick={() => setShowModal(true)}>+ Registrar plaga</button>} />
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fecha</th><th>Plaga</th>
                  <th className="text-center">Cantidad</th>
                  <th>Comentario</th><th>Registrado por</th>
                </tr>
              </thead>
              <tbody>
                {paginados.map(r => (
                  <tr key={r.registroId}>
                    <td>{fmt.fecha(r.fechaHallazgo)}</td>
                    <td className="font-semibold">{r.plagaNombre}</td>
                    <td className="text-center"><span className="tag badge-neutral">{r.cantidad}</span></td>
                    <td className="text-gray-400 text-sm">{r.comentario ?? "—"}</td>
                    <td className="text-gray-500">{r.empleadoNombre ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Paginacion pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} />
          </>
        )}
      </div>

      {/* ── Sección gráfico (filtros propios) ───────────────────── */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-gray-900">Incidencias por período</h3>
            <p className="text-xs text-gray-400 mt-0.5">Filtros independientes de la tabla</p>
          </div>
          {graficaData.length > 0 && (
            <span className="tag badge-neutral">
              {[...new Set(graficaData.map(d => d.plagaNombre))].length} especie(s)
            </span>
          )}
        </div>

        {/* Filtros gráfico */}
        <div className="filter-bar mb-4 pb-4 border-b border-gray-100">
          <label className="field" style={{ minWidth: 190 }}>
            <label>Rango de tiempo</label>
            <select value={fGraf.rango} onChange={e => setFGraf(f => ({ ...f, rango: e.target.value }))}>
              <option value="semana">Última semana</option>
              <option value="quincena">Últimas 2 semanas</option>
              <option value="mes">Último mes</option>
              <option value="trimestre">Último trimestre</option>
            </select>
          </label>
          <label className="field" style={{ minWidth: 150 }}>
            <label>Agrupar por</label>
            <select value={fGraf.agrupacion} onChange={e => setFGraf(f => ({ ...f, agrupacion: e.target.value }))}>
              <option value="DIA">Diario</option>
              <option value="SEMANA">Semanal</option>
              <option value="MES">Mensual</option>
              <option value="ANIO">Anual</option>
            </select>
          </label>
          <div className="filter-actions">
            <button className="btn-primary" onClick={cargarGrafico}>Actualizar gráfico</button>
          </div>
        </div>

        <div style={{ position: "relative", height: 280 }}>
          {loadingGraf ? (
            <div className="flex items-center justify-center h-full"><Spinner text="Cargando gráfico…" /></div>
          ) : !graficaData.length ? (
            <div className="flex items-center justify-center h-full">
              <EmptyState icon="📉" title="Sin datos para graficar"
                subtitle="Seleccioná un rango con registros y aplicá los filtros" />
            </div>
          ) : (
            <canvas ref={canvasRef} />
          )}
        </div>
        {graficaData.length > 0 && (
          <p className="text-xs text-gray-400 text-center mt-3">
            {rangoLabel[fGraf.rango]} · {agrupLabel[fGraf.agrupacion]}
          </p>
        )}
      </div>

      {/* Modal registrar */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Registrar plaga"
        footer={<>
          <button className="btn" onClick={() => setShowModal(false)}>Cancelar</button>
          <button className="btn-primary" onClick={guardar} disabled={saving}>
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </>}>
        <div className="flex flex-col gap-4">
          <label className="field"><label>Fecha hallazgo *</label>
            <input type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} />
          </label>
          <label className="field"><label>Plaga *</label>
            <select value={form.plagaId} onChange={e => setForm(f => ({ ...f, plagaId: e.target.value }))}>
              <option value="">Seleccione</option>
              {catalogo.map(c => <option key={c.plagaId} value={c.plagaId}>{c.nombre}</option>)}
            </select>
          </label>
          <label className="field"><label>Cantidad</label>
            <input type="number" min="1" value={form.cantidad}
              onChange={e => setForm(f => ({ ...f, cantidad: e.target.value }))} />
          </label>
          <label className="field"><label>Comentario</label>
            <textarea rows="3" value={form.comentario}
              onChange={e => setForm(f => ({ ...f, comentario: e.target.value }))}
              placeholder="Opcional" />
          </label>
        </div>
      </Modal>
    </div>
  );
}
