import { useState, useEffect, useCallback } from "react";
import { api, fmt } from "../services/api";
import { usePaginacion } from "../hooks/usePaginacion";
import Modal from "../components/Modal";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import Paginacion from "../components/Paginacion";

export default function Ventas() {
  const [ventas, setVentas]     = useState([]);
  const [loading, setLoading]   = useState(true);

  const [clientes, setClientes]         = useState([]);
  const [empleados, setEmpleados]       = useState([]);
  const [estadosVenta, setEstadosVenta] = useState([]);
  const [estadosPago, setEstadosPago]   = useState([]);
  const [tiposEntrega, setTiposEntrega] = useState([]);
  const [metodosPago, setMetodosPago]   = useState([]);
  const [productos, setProductos]       = useState([]);
  const [inventario, setInventario]     = useState([]);
  const [direcciones, setDirecciones]   = useState([]);

  const [modalNueva, setModalNueva]         = useState(false);
  const [modalDetalle, setModalDetalle]     = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [modalEstado, setModalEstado]       = useState(false);
  const [modalPago, setModalPago]           = useState(false);
  const [saving, setSaving]                 = useState(false);

  const initNv = () => ({
    clienteId: "", direccionEntregaId: "", vendedorId: "", tipoEntregaId: "",
    fechaEntregaDate: "", fechaEntregaTime: "", ivaMonto: 0, metodoPagoId: "", notas: "",
  });
  const [nvForm, setNv]   = useState(initNv());
  const [lineas, setLineas] = useState([]);
  const [ceForm, setCeForm] = useState({ estadoVentaId: "", notas: "" });
  const [cpForm, setCpForm] = useState({ estadoPagoId: "", metodoPagoId: "", notas: "" });

  const { paginados: ventasPag, pagina, totalPaginas, setPagina } = usePaginacion(ventas);

  const cargarVentas = useCallback(async () => {
    setLoading(true);
    setPagina(1);
    try {
      const r = await api("/api/Venta");
      setVentas(Array.isArray(r.data) ? r.data : []);
    } catch { setVentas([]); }
    setLoading(false);
  }, [setPagina]);

  useEffect(() => {
    cargarVentas();
    Promise.all([
      api("/api/Cliente").then(r => setClientes(Array.isArray(r.data) ? r.data : [])),
      api("/api/Empleado").then(r => setEmpleados(Array.isArray(r.data) ? r.data : [])),
      api("/api/EstadoVenta").then(r => setEstadosVenta(Array.isArray(r.data) ? r.data : [])),
      api("/api/EstadoPago").then(r => setEstadosPago(Array.isArray(r.data) ? r.data : [])),
      api("/api/TipoEntrega").then(r => setTiposEntrega(Array.isArray(r.data) ? r.data : [])),
      api("/api/MetodoPago").then(r => setMetodosPago(Array.isArray(r.data) ? r.data : [])),
      api("/api/Producto").then(r => setProductos(Array.isArray(r.data) ? r.data.filter(p => p.activo) : [])),
      api("/api/inventario/actual").then(r => setInventario(Array.isArray(r.data) ? r.data : [])),
    ]).catch(() => {});
  }, []); // eslint-disable-line

  async function onClienteChange(clienteId) {
    setNv(f => ({ ...f, clienteId, direccionEntregaId: "" }));
    setDirecciones([]);
    if (!clienteId) return;
    try {
      const r = await api(`/api/Cliente/${clienteId}/direcciones`);
      setDirecciones(Array.isArray(r.data) ? r.data : []);
    } catch { /* no-op */ }
  }

  function agregarLinea() {
    setLineas(l => [...l, { productoId: "", cantidad: 1, precioUnitario: 0, notas: "" }]);
  }
  function actualizarLinea(i, campo, val) {
    setLineas(l => l.map((ln, idx) => {
      if (idx !== i) return ln;
      const upd = { ...ln, [campo]: val };
      if (campo === "productoId") {
        const p = productos.find(x => String(x.productoId) === String(val));
        if (p) upd.precioUnitario = p.precioBase ?? 0;
      }
      return upd;
    }));
  }
  function eliminarLinea(i) { setLineas(l => l.filter((_, idx) => idx !== i)); }

  const subtotal = lineas.reduce((s, l) => s + (Number(l.cantidad) * Number(l.precioUnitario)), 0);
  const total    = subtotal + Number(nvForm.ivaMonto);

  async function guardarVenta() {
    if (!nvForm.clienteId || !nvForm.vendedorId || !nvForm.tipoEntregaId || lineas.length === 0) {
      alert("Completá los campos obligatorios y agregá al menos un producto."); return;
    }
    setSaving(true);
    try {
      const fechaEntrega = nvForm.fechaEntregaDate
        ? `${nvForm.fechaEntregaDate}T${nvForm.fechaEntregaTime || "00:00:00"}`
        : null;
      const estadoVentaInicial = estadosVenta.find(e => e.codigo === "PENDIENTE")?.estadoVentaId ?? 1;
      const estadoPagoInicial  = estadosPago.find(e => e.codigo === "PENDIENTE")?.estadoPagoId ?? 1;
      await api("/api/Venta", {
        method: "POST",
        body: {
          clienteId:          Number(nvForm.clienteId),
          direccionEntregaId: nvForm.direccionEntregaId ? Number(nvForm.direccionEntregaId) : 0,
          vendedorId:         Number(nvForm.vendedorId),
          estadoVentaId:      estadoVentaInicial,
          estadoPagoId:       estadoPagoInicial,
          metodoPagoId:       nvForm.metodoPagoId ? Number(nvForm.metodoPagoId) : null,
          tipoEntregaId:      Number(nvForm.tipoEntregaId),
          fechaEntrega,
          ivaMonto:           Number(nvForm.ivaMonto),
          notas:              nvForm.notas || null,
          detalle: lineas.map(l => ({
            productoId: Number(l.productoId), cantidad: Number(l.cantidad),
            precioUnitario: Number(l.precioUnitario), notas: l.notas || null,
          })),
        },
      });
      setModalNueva(false); setNv(initNv()); setLineas([]);
      cargarVentas();
    } catch (err) { alert(err.message); }
    setSaving(false);
  }

  async function abrirDetalle(v) {
    setModalDetalle(v); setLoadingDetalle(true);
    try { const r = await api(`/api/Venta/${v.ventaId}`); setModalDetalle(r.data); }
    catch { /* mantener resumen */ }
    setLoadingDetalle(false);
  }

  async function cambiarEstado() {
    if (!modalDetalle || !ceForm.estadoVentaId) return;
    setSaving(true);
    try {
      await api(`/api/Venta/${modalDetalle.ventaId}/estado`, {
        method: "PATCH",
        body: { estadoVentaId: Number(ceForm.estadoVentaId), notas: ceForm.notas || null },
      });
      setModalEstado(false); setModalDetalle(null); cargarVentas();
    } catch (err) { alert(err.message); }
    setSaving(false);
  }

  async function confirmarPago() {
    if (!modalDetalle || !cpForm.estadoPagoId || !cpForm.metodoPagoId) return;
    setSaving(true);
    try {
      await api(`/api/Venta/${modalDetalle.ventaId}/pago`, {
        method: "PATCH",
        body: { estadoPagoId: Number(cpForm.estadoPagoId), metodoPagoId: Number(cpForm.metodoPagoId), notas: cpForm.notas || null },
      });
      setModalPago(false); setModalDetalle(null); cargarVentas();
    } catch (err) { alert(err.message); }
    setSaving(false);
  }

  async function cancelarVenta() {
    if (!modalDetalle) return;
    const motivo = prompt("Motivo de cancelación (requerido):");
    if (!motivo?.trim()) return;
    try {
      await api(`/api/Venta/${modalDetalle.ventaId}/cancelar`, {
        method: "POST", body: { motivo: motivo.trim() },
      });
      setModalDetalle(null); cargarVentas();
    } catch (err) { alert(err.message); }
  }

  const stockDe = (productoId) => {
    const it = inventario.find(i => i.productoId === Number(productoId));
    return it?.cantidadDisponible ?? "—";
  };

  const fmtCRC   = fmt.moneda;
  const fmtFecha = fmt.fecha;

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Ventas</h1>
          <p className="page-subtitle">Gestiona pedidos, estados y pagos</p>
        </div>
        <div className="page-actions">
          <button className="btn-primary" onClick={() => { setNv(initNv()); setLineas([]); setModalNueva(true); }}>
            + Nueva venta
          </button>
          <button className="btn" onClick={cargarVentas}>↺ Refrescar</button>
        </div>
      </div>

      {/* Tabla */}
      <div className="card overflow-x-auto">
        {loading ? <Spinner /> : ventas.length === 0 ? (
          <EmptyState icon="💰" title="Sin ventas registradas" subtitle="Registrá una venta para comenzar" />
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th><th>Cliente</th><th>Fecha</th>
                  <th>Estado venta</th><th>Estado pago</th>
                  <th>Factura</th><th className="text-right">Total</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ventasPag.map(v => (
                  <tr key={v.ventaId}>
                    <td className="text-gray-400 text-xs font-mono">{v.ventaId}</td>
                    <td className="font-semibold">{v.nombreCliente}</td>
                    <td>{fmtFecha(v.fechaPedido)}</td>
                    <td><StatusBadge label={v.nombreEstadoVenta ?? "—"} variant={(v.nombreEstadoVenta ?? "").toLowerCase()} /></td>
                    <td><StatusBadge label={v.nombreEstadoPago ?? "—"} variant={(v.nombreEstadoPago ?? "").toLowerCase()} /></td>
                    <td className="text-xs text-gray-400">{v.numeroFactura ?? "—"}</td>
                    <td className="text-right font-bold">{fmtCRC(v.total)}</td>
                    <td>
                      <button className="btn-ghost" onClick={() => abrirDetalle(v)}>Ver detalle</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Paginacion pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} />
          </>
        )}
      </div>

      {/* ── Modal nueva venta ───────────────────────────────────── */}
      <Modal open={modalNueva} onClose={() => setModalNueva(false)} title="Nueva venta" wide
        footer={
          <>
            <button className="btn" onClick={() => setModalNueva(false)}>Cancelar</button>
            <button className="btn-primary" onClick={guardarVenta} disabled={saving}>
              {saving ? "Guardando…" : "Guardar venta"}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">

          {/* Fila 1: cliente, dirección, vendedor */}
          <div className="grid grid-cols-2 gap-4">
            <label className="field">
              <label>Cliente *</label>
              <select value={nvForm.clienteId} onChange={e => onClienteChange(e.target.value)}>
                <option value="">Seleccione</option>
                {clientes.map(c => (
                  <option key={c.clienteId} value={c.clienteId}>
                    {c.nombreComercial ?? `${c.nombre ?? ""} ${c.apellidos ?? ""}`.trim()}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <label>Dirección de entrega</label>
              <select value={nvForm.direccionEntregaId}
                onChange={e => setNv(f => ({ ...f, direccionEntregaId: e.target.value }))}>
                <option value="">Seleccione cliente primero</option>
                {direcciones.map(d => (
                  <option key={d.direccionId} value={d.direccionId}>
                    {d.descripcion ?? d.direccion ?? `Dirección #${d.direccionId}`}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <label>Vendedor *</label>
              <select value={nvForm.vendedorId} onChange={e => setNv(f => ({ ...f, vendedorId: e.target.value }))}>
                <option value="">Seleccione</option>
                {empleados.map(e => (
                  <option key={e.empleadoId} value={e.empleadoId}>
                    {`${e.nombre} ${e.apellidos ?? ""}`.trim()}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <label>Tipo de entrega *</label>
              <select value={nvForm.tipoEntregaId} onChange={e => setNv(f => ({ ...f, tipoEntregaId: e.target.value }))}>
                <option value="">Seleccione</option>
                {tiposEntrega.map(t => (
                  <option key={t.tipoEntregaId} value={t.tipoEntregaId}>{t.nombre}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Fila 2: fecha, método pago, IVA, notas */}
          <div className="grid grid-cols-2 gap-4">
            <label className="field">
              <label>Fecha de entrega</label>
              <div className="flex gap-2">
                <input type="date"
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                  value={nvForm.fechaEntregaDate}
                  onChange={e => setNv(f => ({ ...f, fechaEntregaDate: e.target.value }))} />
                <input type="time"
                  className="w-28 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                  value={nvForm.fechaEntregaTime}
                  onChange={e => setNv(f => ({ ...f, fechaEntregaTime: e.target.value }))} />
              </div>
            </label>
            <label className="field">
              <label>Método de pago</label>
              <select value={nvForm.metodoPagoId} onChange={e => setNv(f => ({ ...f, metodoPagoId: e.target.value }))}>
                <option value="">Sin especificar</option>
                {metodosPago.map(m => (
                  <option key={m.metodoPagoId} value={m.metodoPagoId}>{m.nombre}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <label>IVA (₡)</label>
              <input type="number" min="0" step="0.01" value={nvForm.ivaMonto}
                onChange={e => setNv(f => ({ ...f, ivaMonto: e.target.value }))} />
            </label>
            <label className="field">
              <label>Notas</label>
              <input type="text" value={nvForm.notas}
                onChange={e => setNv(f => ({ ...f, notas: e.target.value }))} />
            </label>
          </div>

          {/* Detalle de productos */}
          <div>
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
              <h4 className="font-bold text-gray-900 text-sm">Detalle de productos</h4>
              <button className="btn text-xs py-1 px-2" onClick={agregarLinea}>+ Agregar línea</button>
            </div>

            {lineas.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4 bg-gray-50 rounded-xl">
                Agregá al menos un producto
              </p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Producto</th><th>Stock</th><th>Cant.</th>
                    <th>Precio unit.</th><th>Notas</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {lineas.map((l, i) => (
                    <tr key={i}>
                      <td>
                        <select className="w-full px-2 py-1 rounded-lg border border-gray-200 text-sm"
                          value={l.productoId}
                          onChange={e => actualizarLinea(i, "productoId", e.target.value)}>
                          <option value="">Seleccione</option>
                          {productos.map(p => (
                            <option key={p.productoId} value={p.productoId}>{p.nombreProducto}</option>
                          ))}
                        </select>
                      </td>
                      <td className="text-xs text-gray-400">{l.productoId ? stockDe(l.productoId) : "—"}</td>
                      <td>
                        <input type="number" min="1"
                          className="w-16 px-2 py-1 rounded-lg border border-gray-200 text-sm"
                          value={l.cantidad}
                          onChange={e => actualizarLinea(i, "cantidad", e.target.value)} />
                      </td>
                      <td>
                        <input type="number" step="0.01"
                          className="w-24 px-2 py-1 rounded-lg border border-gray-200 text-sm"
                          value={l.precioUnitario}
                          onChange={e => actualizarLinea(i, "precioUnitario", e.target.value)} />
                      </td>
                      <td>
                        <input type="text"
                          className="w-full px-2 py-1 rounded-lg border border-gray-200 text-sm"
                          value={l.notas}
                          onChange={e => actualizarLinea(i, "notas", e.target.value)} />
                      </td>
                      <td>
                        <button className="btn-danger text-xs py-0.5 px-1.5"
                          onClick={() => eliminarLinea(i)}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {lineas.length > 0 && (
              <div className="flex gap-6 justify-end mt-3 text-sm font-bold text-gray-700 bg-gray-50 px-4 py-2 rounded-xl">
                <span>Subtotal: <strong>{fmtCRC(subtotal)}</strong></span>
                <span>IVA: <strong>{fmtCRC(nvForm.ivaMonto)}</strong></span>
                <span>Total: <strong className="text-green-700">{fmtCRC(total)}</strong></span>
              </div>
            )}
          </div>

        </div>
      </Modal>

      {/* ── Modal detalle venta ──────────────────────────────────── */}
      <Modal open={!!modalDetalle} onClose={() => setModalDetalle(null)}
        title={`Venta #${modalDetalle?.ventaId ?? ""}`} wide
        footer={
          <>
            <button className="btn" onClick={() => { setCeForm({ estadoVentaId: "", notas: "" }); setModalEstado(true); }}>
              Cambiar estado
            </button>
            <button className="btn" onClick={() => { setCpForm({ estadoPagoId: "", metodoPagoId: "", notas: "" }); setModalPago(true); }}>
              Confirmar pago
            </button>
            <button className="btn-danger" onClick={cancelarVenta}>Cancelar venta</button>
          </>
        }
      >
        {loadingDetalle ? <Spinner text="Cargando detalle…" /> : modalDetalle && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Cliente",       modalDetalle.nombreCliente],
                ["Vendedor",      modalDetalle.nombreVendedor ?? "—"],
                ["Fecha pedido",  fmtFecha(modalDetalle.fechaPedido)],
                ["Fecha entrega", fmtFecha(modalDetalle.fechaEntrega)],
                ["Estado venta",  modalDetalle.nombreEstadoVenta ?? "—"],
                ["Estado pago",   modalDetalle.nombreEstadoPago ?? "—"],
                ["Método pago",   modalDetalle.nombreMetodoPago ?? "—"],
                ["Tipo entrega",  modalDetalle.nombreTipoEntrega ?? "—"],
                ["Factura",       modalDetalle.numeroFactura ?? "—"],
                ["IVA",           fmtCRC(modalDetalle.ivaMonto)],
                ["Subtotal",      fmtCRC(modalDetalle.subtotal)],
                ["Total",         fmtCRC(modalDetalle.total)],
              ].map(([k, v]) => (
                <div key={k} className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-400 font-bold uppercase">{k}</div>
                  <div className="font-bold text-gray-900 mt-0.5">{v}</div>
                </div>
              ))}
            </div>

            {modalDetalle.notas && (
              <div className="bg-gray-50 rounded-xl p-3 text-sm">
                <div className="text-xs text-gray-400 font-bold uppercase mb-1">Notas</div>
                <div className="text-gray-700">{modalDetalle.notas}</div>
              </div>
            )}

            {modalDetalle.detalle?.length > 0 && (
              <div>
                <h4 className="font-bold text-gray-900 text-sm mb-2">Detalle de productos</h4>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th className="text-right">Cant.</th>
                      <th className="text-right">Precio unit.</th>
                      <th className="text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalDetalle.detalle.map((d, i) => (
                      <tr key={i}>
                        <td className="font-semibold">{d.nombreProducto ?? `#${d.productoId}`}</td>
                        <td className="text-right">{d.cantidad}</td>
                        <td className="text-right">{fmtCRC(d.precioUnitario)}</td>
                        <td className="text-right font-bold">{fmtCRC(d.cantidad * d.precioUnitario)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ── Modal cambiar estado ─────────────────────────────────── */}
      <Modal open={modalEstado} onClose={() => setModalEstado(false)} title="Cambiar estado de venta"
        footer={
          <>
            <button className="btn" onClick={() => setModalEstado(false)}>Cancelar</button>
            <button className="btn-primary" onClick={cambiarEstado} disabled={saving}>
              {saving ? "Procesando…" : "Confirmar"}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <label className="field">
            <label>Nuevo estado *</label>
            <select value={ceForm.estadoVentaId}
              onChange={e => setCeForm(f => ({ ...f, estadoVentaId: e.target.value }))}>
              <option value="">Seleccione</option>
              {estadosVenta.map(e => (
                <option key={e.estadoVentaId} value={e.estadoVentaId}>{e.nombre}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <label>Notas</label>
            <textarea rows="2" value={ceForm.notas}
              onChange={e => setCeForm(f => ({ ...f, notas: e.target.value }))} />
          </label>
        </div>
      </Modal>

      {/* ── Modal confirmar pago ─────────────────────────────────── */}
      <Modal open={modalPago} onClose={() => setModalPago(false)} title="Confirmar pago"
        footer={
          <>
            <button className="btn" onClick={() => setModalPago(false)}>Cancelar</button>
            <button className="btn-primary" onClick={confirmarPago} disabled={saving}>
              {saving ? "Procesando…" : "Confirmar"}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <label className="field">
            <label>Estado de pago *</label>
            <select value={cpForm.estadoPagoId}
              onChange={e => setCpForm(f => ({ ...f, estadoPagoId: e.target.value }))}>
              <option value="">Seleccione</option>
              {estadosPago.map(e => (
                <option key={e.estadoPagoId} value={e.estadoPagoId}>{e.nombre}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <label>Método de pago *</label>
            <select value={cpForm.metodoPagoId}
              onChange={e => setCpForm(f => ({ ...f, metodoPagoId: e.target.value }))}>
              <option value="">Seleccione</option>
              {metodosPago.map(m => (
                <option key={m.metodoPagoId} value={m.metodoPagoId}>{m.nombre}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <label>Notas</label>
            <textarea rows="2" value={cpForm.notas}
              onChange={e => setCpForm(f => ({ ...f, notas: e.target.value }))} />
          </label>
        </div>
      </Modal>

    </div>
  );
}
