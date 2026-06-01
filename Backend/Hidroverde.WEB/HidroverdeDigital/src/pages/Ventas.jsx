import { useState, useEffect, useCallback } from "react";
import { api, fmt } from "../services/api";
import { usePaginacion } from "../hooks/usePaginacion";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import Paginacion from "../components/Paginacion";

export default function Ventas() {
  const toast = useToast();
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
    fechaEntregaDate: "", fechaEntregaTime: "", metodoPagoId: "",
  });
  const [nvForm, setNv]   = useState(initNv());
  const [lineas, setLineas] = useState([]);
  const [ceForm, setCeForm] = useState({ estadoVentaId: "" });
  const [cpForm, setCpForm] = useState({ estadoPagoId: "" });

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
    setLineas(l => [...l, { inventarioId: "", productoId: "", cantidad: 1, precioUnitario: 0 }]);
  }

  // El precio unitario lo fija el servidor (precio_base); aquí solo se muestra de referencia.
  // Próximo estado logístico permitido: el activo, no cancelado, con el menor orden > actual.
  const siguienteEstadoVenta = (orden) =>
    estadosVenta
      .filter(e => e.activo !== false && e.codigo !== "CANCELADO" && e.orden > (orden ?? 0))
      .sort((a, b) => a.orden - b.orden)[0] ?? null;
  // ¿El pago está finalizado como PAGADO? (habilita avanzar el estado logístico)
  const pagoConfirmado = (v) => {
    const ep = estadosPago.find(e => e.estadoPagoId === v?.estadoPagoId);
    return !!(ep && (ep.permiteEntrega || ep.codigo === "PAGADO"));
  };
  // ¿El estado de pago actual es terminal? (pagado / anulado / vencido)
  const pagoTerminal = (v) => {
    const ep = estadosPago.find(e => e.estadoPagoId === v?.estadoPagoId);
    return !!(ep && (ep.permiteEntrega || ["ANULADO", "VENCIDO"].includes(ep.codigo)));
  };
  function actualizarLinea(i, campo, val) {
    setLineas(l => l.map((ln, idx) => {
      if (idx !== i) return ln;
      const upd = { ...ln, [campo]: val };
      if (campo === "inventarioId") {
        // Al elegir un lote de inventario, derivar el producto y su precio base
        const inv = inventario.find(x => String(x.inventarioId) === String(val));
        if (inv) {
          upd.productoId = inv.productoId;
          const p = productos.find(x => x.productoId === inv.productoId);
          upd.precioUnitario = p?.precioBase ?? 0;
        } else {
          upd.productoId = "";
        }
      }
      return upd;
    }));
  }
  function eliminarLinea(i) { setLineas(l => l.filter((_, idx) => idx !== i)); }

  const subtotal = lineas.reduce((s, l) => s + (Number(l.cantidad) * Number(l.precioUnitario)), 0);
  const total    = subtotal;

  async function guardarVenta() {
    if (!nvForm.clienteId || !nvForm.vendedorId || !nvForm.tipoEntregaId || !nvForm.metodoPagoId || lineas.length === 0) {
      toast.warning("Completá los campos obligatorios (incluido el método de pago) y agregá al menos un producto."); return;
    }
    if (lineas.some(l => !l.inventarioId)) {
      toast.warning("Cada línea debe tener un lote de inventario seleccionado."); return;
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
          detalle: lineas.map(l => ({
            inventarioId: Number(l.inventarioId),
            productoId: Number(l.productoId), cantidad: Number(l.cantidad),
          })),
        },
      });
      toast.success("Venta creada correctamente.");
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
        body: { estadoVentaId: Number(ceForm.estadoVentaId) },
      });
      toast.success("Estado de la venta actualizado.");
      setModalEstado(false); setModalDetalle(null); cargarVentas();
    } catch (err) { toast.error(err.message); }
    setSaving(false);
  }

  async function confirmarPago() {
    if (!modalDetalle || !cpForm.estadoPagoId) return;
    setSaving(true);
    try {
      await api(`/api/Venta/${modalDetalle.ventaId}/pago`, {
        method: "PATCH",
        body: { estadoPagoId: Number(cpForm.estadoPagoId), metodoPagoId: Number(modalDetalle.metodoPagoId ?? 0) },
      });
      toast.success("Pago confirmado.");
      setModalPago(false); setModalDetalle(null); cargarVentas();
    } catch (err) { toast.error(err.message); }
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
      toast.success("Venta cancelada.");
      setModalDetalle(null); cargarVentas();
    } catch (err) { toast.error(err.message); }
  }

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

          {/* Fila 2: fecha y método de pago */}
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
              <label>Método de pago *</label>
              <select value={nvForm.metodoPagoId} onChange={e => setNv(f => ({ ...f, metodoPagoId: e.target.value }))}>
                <option value="">Seleccione</option>
                {metodosPago.map(m => (
                  <option key={m.metodoPagoId} value={m.metodoPagoId}>{m.nombre}</option>
                ))}
              </select>
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
                    <th>Precio unit.</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {lineas.map((l, i) => {
                    const invSel = inventario.find(x => String(x.inventarioId) === String(l.inventarioId));
                    return (
                    <tr key={i}>
                      <td>
                        <select className="w-full px-2 py-1 rounded-lg border border-gray-200 text-sm"
                          value={l.inventarioId}
                          onChange={e => actualizarLinea(i, "inventarioId", e.target.value)}>
                          <option value="">Seleccione un producto</option>
                          {Object.entries(
                            inventario
                              .filter(inv => inv.cantidadDisponible > 0)
                              .reduce((acc, inv) => {
                                const k = inv.productoNombre ?? `Producto #${inv.productoId}`;
                                (acc[k] = acc[k] || []).push(inv);
                                return acc;
                              }, {})
                          ).map(([prod, lotes]) => (
                            <optgroup key={prod} label={prod}>
                              {lotes.map(inv => (
                                <option key={inv.inventarioId} value={inv.inventarioId}>
                                  {inv.lote ? `Lote ${inv.lote}` : "Disponible"} ({inv.cantidadDisponible} disp.)
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </td>
                      <td className="text-xs text-gray-400">
                        {invSel ? invSel.cantidadDisponible : "—"}
                      </td>
                      <td>
                        <input type="number" min="1"
                          max={invSel ? invSel.cantidadDisponible : undefined}
                          className="w-16 px-2 py-1 rounded-lg border border-gray-200 text-sm"
                          value={l.cantidad}
                          onChange={e => actualizarLinea(i, "cantidad", e.target.value)} />
                      </td>
                      <td className="text-sm text-gray-600">
                        {fmtCRC(l.precioUnitario)}
                      </td>
                      <td>
                        <button className="btn-danger text-xs py-0.5 px-1.5"
                          onClick={() => eliminarLinea(i)}>✕</button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {lineas.length > 0 && (
              <div className="flex gap-6 justify-end mt-3 text-sm font-bold text-gray-700 bg-gray-50 px-4 py-2 rounded-xl">
                <span>Subtotal: <strong>{fmtCRC(subtotal)}</strong></span>
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
            <button className="btn" onClick={() => {
              const sig = siguienteEstadoVenta(modalDetalle?.ordenEstadoVenta);
              setCeForm({ estadoVentaId: sig ? String(sig.estadoVentaId) : "" });
              setModalEstado(true);
            }}>
              Cambiar estado
            </button>
            <button className="btn" onClick={() => { setCpForm({ estadoPagoId: "" }); setModalPago(true); }}>
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
                ["Subtotal",      fmtCRC(modalDetalle.subtotal)],
                ["Total",         fmtCRC(modalDetalle.total)],
              ].map(([k, v]) => (
                <div key={k} className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-400 font-bold uppercase">{k}</div>
                  <div className="font-bold text-gray-900 mt-0.5">{v}</div>
                </div>
              ))}
            </div>

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
            <button className="btn-primary" onClick={cambiarEstado}
              disabled={saving || !ceForm.estadoVentaId || !pagoConfirmado(modalDetalle)}>
              {saving ? "Procesando…" : "Confirmar"}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {(() => {
            if (!pagoConfirmado(modalDetalle)) {
              return (
                <p className="text-sm text-amber-700 bg-amber-50 rounded-xl p-3">
                  Primero debe confirmarse el pago como <strong>PAGADO</strong>. El estado de la
                  venta no puede avanzar mientras el pago no esté finalizado.
                </p>
              );
            }
            const sig = siguienteEstadoVenta(modalDetalle?.ordenEstadoVenta);
            if (!sig) {
              return (
                <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
                  La venta ya está en el último estado del flujo.
                </p>
              );
            }
            return (
              <div className="text-sm">
                <p className="text-gray-500 mb-2">El flujo avanza al estado consecutivo, sin saltar pasos:</p>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-500">{modalDetalle.nombreEstadoVenta}</span>
                  <span className="text-gray-400">→</span>
                  <span className="px-3 py-1 rounded-lg bg-green-100 text-green-800 font-bold">{sig.nombre}</span>
                </div>
              </div>
            );
          })()}
        </div>
      </Modal>

      {/* ── Modal confirmar pago ─────────────────────────────────── */}
      <Modal open={modalPago} onClose={() => setModalPago(false)} title="Confirmar pago"
        footer={
          <>
            <button className="btn" onClick={() => setModalPago(false)}>Cancelar</button>
            <button className="btn-primary" onClick={confirmarPago}
              disabled={saving || !cpForm.estadoPagoId || pagoTerminal(modalDetalle)}>
              {saving ? "Procesando…" : "Confirmar"}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {pagoTerminal(modalDetalle) ? (
            <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
              El pago ya está finalizado (<strong>{modalDetalle?.nombreEstadoPago}</strong>) y no puede modificarse.
            </p>
          ) : (
            <>
              <label className="field">
                <label>Nuevo estado de pago *</label>
                <select value={cpForm.estadoPagoId}
                  onChange={e => setCpForm(f => ({ ...f, estadoPagoId: e.target.value }))}>
                  <option value="">Seleccione</option>
                  {estadosPago
                    .filter(e => e.estadoPagoId !== modalDetalle?.estadoPagoId)
                    .map(e => (
                      <option key={e.estadoPagoId} value={e.estadoPagoId}>{e.nombre}</option>
                    ))}
                </select>
              </label>
              <div className="field">
                <label>Método de pago</label>
                <div className="px-3 py-2 rounded-xl bg-gray-50 text-sm text-gray-700">
                  {modalDetalle?.nombreMetodoPago ?? "—"}
                  <span className="text-xs text-gray-400"> (definido al crear la venta)</span>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>

    </div>
  );
}
