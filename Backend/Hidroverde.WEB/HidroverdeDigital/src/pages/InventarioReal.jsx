import { useState, useEffect, useCallback } from "react";
import { api, fmt } from "../services/api";
import { usePaginacion } from "../hooks/usePaginacion";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import Paginacion from "../components/Paginacion";

function CaducidadBadge({ fecha, cantidad }) {
  if (!fecha) return <span className="text-gray-400">—</span>;
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  const cad = new Date(fecha); cad.setHours(0,0,0,0);
  const diff = Math.floor((cad - hoy) / 86400000);
  const label = fmt.fecha(fecha);
  if (cantidad > 0 && diff < 0)
    return <><div>{label}</div><span className="tag badge-critica mt-0.5">Vencido</span></>;
  if (cantidad > 0 && diff <= 7)
    return <><div>{label}</div><span className="tag badge-advertencia mt-0.5">Por vencer ({diff}d)</span></>;
  return <div>{label}</div>;
}

export default function InventarioReal() {
  const [items, setItems]         = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filtros, setFiltros]     = useState({
    productoId: "", lote: "", desde: "", hasta: "", soloDisponibles: false,
  });
  const [modal, setModal]               = useState(null);
  const [loadingModal, setLoadingModal] = useState(false);

  const { paginados, pagina, totalPaginas, setPagina } = usePaginacion(items);

  const buildQs = useCallback(() => {
    const p = new URLSearchParams();
    if (filtros.productoId)      p.set("productoId", filtros.productoId);
    if (filtros.lote)            p.set("lote", filtros.lote);
    if (filtros.desde)           p.set("desde", filtros.desde);
    if (filtros.hasta)           p.set("hasta", filtros.hasta);
    if (filtros.soloDisponibles) p.set("soloDisponibles", "true");
    return p.toString();
  }, [filtros]);

  const cargar = useCallback(async () => {
    setLoading(true);
    setPagina(1);
    try {
      const qs = buildQs();
      const r = await api(`/api/inventario/actual${qs ? "?" + qs : ""}`);
      setItems(Array.isArray(r.data) ? r.data : []);
    } catch { setItems([]); }
    setLoading(false);
  }, [buildQs, setPagina]);

  useEffect(() => { cargar(); }, [cargar]);

  useEffect(() => {
    api("/api/Producto")
      .then(r => setProductos(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
  }, []);

  function limpiar() {
    setFiltros({ productoId: "", lote: "", desde: "", hasta: "", soloDisponibles: false });
  }

  async function verDetalle(id) {
    setModal({ tipo: "detalle", id, data: null });
    setLoadingModal(true);
    try {
      const r = await api(`/api/inventario/actual/${id}`);
      setModal({ tipo: "detalle", id, data: r.data });
    } catch {
      setModal({ tipo: "detalle", id, data: null, error: true });
    }
    setLoadingModal(false);
  }

  async function verMovimientos(id) {
    setModal({ tipo: "movs", id, data: null });
    setLoadingModal(true);
    try {
      const r = await api(`/api/inventario/movimientos?inventarioId=${id}`);
      setModal({ tipo: "movs", id, data: Array.isArray(r.data) ? r.data : [] });
    } catch {
      setModal({ tipo: "movs", id, data: [], error: true });
    }
    setLoadingModal(false);
  }

  // KPIs
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  const addDays = (n) => { const x = new Date(hoy); x.setDate(x.getDate() + n); return x; };
  const kpis = items.reduce((acc, it) => {
    const qty = Number(it.cantidadDisponible ?? 0);
    acc.unidades += qty;
    if (qty <= 0) acc.sinStock++;
    if (it.fechaCaducidad) {
      const cad = new Date(it.fechaCaducidad); cad.setHours(0,0,0,0);
      if (qty > 0 && cad < hoy)                acc.vencidos++;
      if (qty > 0 && cad >= hoy && cad <= addDays(7)) acc.porVencer++;
    }
    return acc;
  }, { unidades: 0, vencidos: 0, porVencer: 0, sinStock: 0 });

  const modalTitle = modal?.tipo === "detalle"
    ? `Detalle inventario #${modal?.id}`
    : `Movimientos #${modal?.id}`;

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventario</h1>
          <p className="page-subtitle">Inventario actual y movimientos por lote.</p>
        </div>
        <button className="btn" onClick={cargar}>↺ Refrescar</button>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-gray-900">Filtros de búsqueda</h3>
            <p className="text-xs text-gray-400 mt-0.5">Por producto, lote y rango de fechas.</p>
          </div>
          <div className="flex gap-2">
            <button className="btn" onClick={limpiar}>Limpiar</button>
            <button className="btn-primary" onClick={cargar}>Buscar</button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <label className="field">
            <label>Producto</label>
            <select value={filtros.productoId}
              onChange={e => setFiltros(f => ({ ...f, productoId: e.target.value }))}>
              <option value="">Todos</option>
              {productos.map(p => (
                <option key={p.productoId} value={p.productoId}>{p.nombreProducto}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <label>Lote</label>
            <input type="text" placeholder="EJ: LEC-001-021726"
              value={filtros.lote}
              onChange={e => setFiltros(f => ({ ...f, lote: e.target.value }))} />
          </label>
          <label className="field">
            <label>Desde</label>
            <input type="date" value={filtros.desde}
              onChange={e => setFiltros(f => ({ ...f, desde: e.target.value }))} />
          </label>
          <label className="field">
            <label>Hasta</label>
            <input type="date" value={filtros.hasta}
              onChange={e => setFiltros(f => ({ ...f, hasta: e.target.value }))} />
          </label>
        </div>
        <div className="mt-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input type="checkbox" checked={filtros.soloDisponibles}
              onChange={e => setFiltros(f => ({ ...f, soloDisponibles: e.target.checked }))}
              className="rounded border-gray-300" />
            Solo disponibles
          </label>
        </div>
      </div>

      {/* KPIs */}
      {!loading && items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Ítems",           val: items.length, cls: "bg-gray-50 text-gray-700" },
            { label: "Unidades",        val: kpis.unidades, cls: "bg-blue-50 text-blue-800" },
            { label: "Vencidos",        val: kpis.vencidos, cls: kpis.vencidos > 0 ? "bg-red-50 text-red-700" : "bg-gray-50 text-gray-500" },
            { label: "Por vencer (7d)", val: kpis.porVencer, cls: kpis.porVencer > 0 ? "bg-yellow-50 text-yellow-700" : "bg-gray-50 text-gray-500" },
            { label: "Sin stock",       val: kpis.sinStock, cls: kpis.sinStock > 0 ? "bg-orange-50 text-orange-700" : "bg-gray-50 text-gray-500" },
          ].map(({ label, val, cls }) => (
            <div key={label} className={`card ${cls} text-center py-3`}>
              <div className="text-xs font-bold text-gray-500 uppercase">{label}</div>
              <div className="text-2xl font-black mt-1">{val}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabla */}
      <div className="card overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">
            Inventario actual
            {!loading && (
              <span className="text-gray-400 font-normal text-sm ml-2">({items.length})</span>
            )}
          </h3>
        </div>

        {loading ? (
          <Spinner />
        ) : items.length === 0 ? (
          <EmptyState icon="📦" title="Sin registros de inventario"
            subtitle="Ajustá los filtros o recargá la página" />
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Producto</th>
                  <th>Lote</th>
                  <th className="text-right">Cantidad</th>
                  <th>Ubicación</th>
                  <th>Caducidad</th>
                  <th>Calidad</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginados.map(it => (
                  <tr key={it.inventarioId}>
                    <td className="text-xs text-gray-500 font-mono">{it.productoCodigo ?? "—"}</td>
                    <td className="font-semibold">{it.productoNombre ?? "—"}</td>
                    <td className="font-mono text-xs text-gray-600">{it.lote ?? "—"}</td>
                    <td className="text-right font-bold">
                      <span className={Number(it.cantidadDisponible) <= 0 ? "text-red-600" : "text-gray-900"}>
                        {it.cantidadDisponible ?? 0}
                      </span>
                    </td>
                    <td className="text-gray-500 text-sm">{`#${it.ubicacionId ?? "—"}`}</td>
                    <td>
                      <CaducidadBadge fecha={it.fechaCaducidad}
                        cantidad={Number(it.cantidadDisponible)} />
                    </td>
                    <td className="text-sm">{`#${it.estadoCalidadId ?? "—"}`}</td>
                    <td className="text-right">
                      <div className="flex gap-1 justify-end">
                        <button className="btn-ghost"
                          onClick={() => verDetalle(it.inventarioId)}>
                          Detalle
                        </button>
                        <button className="btn-ghost"
                          onClick={() => verMovimientos(it.inventarioId)}>
                          Movimientos
                        </button>
                        <button className="btn-ghost opacity-40 cursor-not-allowed" disabled
                          title="Próximamente">
                          Salida
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Paginacion pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} />
          </>
        )}
      </div>

      {/* Modal detalle / movimientos */}
      <Modal open={!!modal} onClose={() => setModal(null)} title={modalTitle}>
        {loadingModal ? (
          <Spinner text="Cargando…" />
        ) : modal?.error ? (
          <EmptyState icon="⚠️" title="Error cargando datos" />
        ) : modal?.tipo === "detalle" && modal?.data ? (
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ["Lote",          modal.data.lote],
              ["Cantidad",      modal.data.cantidadDisponible],
              ["Producto",      modal.data.productoNombre ?? `#${modal.data.productoId}`],
              ["Código",        modal.data.productoCodigo ?? "—"],
              ["Ubicación",     `#${modal.data.ubicacionId}`],
              ["Caducidad",     fmt.fecha(modal.data.fechaCaducidad)],
              ["Fecha entrada", fmt.fecha(modal.data.fechaEntrada)],
              ["Ciclo origen",  modal.data.cicloOrigenId ?? "—"],
              ["Notas",         modal.data.notas ?? "—"],
            ].map(([k, v]) => (
              <div key={k} className="bg-gray-50 rounded-xl p-3">
                <div className="text-xs text-gray-400 font-bold uppercase">{k}</div>
                <div className="font-bold text-gray-900 mt-0.5">{v ?? "—"}</div>
              </div>
            ))}
          </div>
        ) : modal?.tipo === "movs" ? (
          !modal.data?.length ? (
            <EmptyState icon="📋" title="Sin movimientos registrados" />
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th className="text-right">Cantidad</th>
                  <th>Fecha</th>
                  <th>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {modal.data.map(m => (
                  <tr key={m.movimientoId}>
                    <td>
                      <span className={`tag ${m.tipoMovimientoCodigo === "ENTRADA" ? "badge-ok" : "badge-advertencia"}`}>
                        {m.tipoMovimientoNombre || m.tipoMovimientoCodigo}
                      </span>
                    </td>
                    <td className="text-right font-bold">{m.cantidad}</td>
                    <td>{fmt.fechaHora(m.fechaMovimiento)}</td>
                    <td className="text-xs text-gray-400">{m.motivo ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : null}
      </Modal>

    </div>
  );
}
