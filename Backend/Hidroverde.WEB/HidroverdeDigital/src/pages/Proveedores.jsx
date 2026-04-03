import { useState, useEffect, useCallback } from "react";
import { api, fmt } from "../services/api";
import { usePaginacion } from "../hooks/usePaginacion";
import Modal from "../components/Modal";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import Paginacion from "../components/Paginacion";

export default function Proveedores() {
  const [tab, setTab]             = useState("pendientes");
  const [pendientes, setPendientes] = useState([]);
  const [pagosGlobal, setPagosGlobal] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [lista, setLista]         = useState([]);

  const [modalPago, setModalPago]   = useState(null);
  const [montoPago, setMontoPago]   = useState("");
  const [comentarioPago, setComentarioPago] = useState("");
  const [modalHist, setModalHist]   = useState(null);
  const [historial, setHistorial]   = useState([]);
  const [loadingHist, setLoadingHist] = useState(false);
  const [modalNuevoPend, setModalNuevoPend] = useState(false);
  const [modalNuevoProv, setModalNuevoProv] = useState(false);
  const [saving, setSaving]         = useState(false);

  const [formPend, setFormPend] = useState({ proveedorId: "", monto: "", comentario: "" });
  const [formProv, setFormProv] = useState({ nombre: "", descripcion: "", correo: "", telefono: "" });

  const pagPend  = usePaginacion(pendientes);
  const pagPagos = usePaginacion(pagosGlobal);

  const cargarPendientes = useCallback(async () => {
    setLoading(true);
    try { const r = await api("/api/proveedores/pendientes-pago"); setPendientes(Array.isArray(r.data) ? r.data : []); }
    catch { setPendientes([]); }
    setLoading(false);
  }, []);

  const cargarPagos = useCallback(async () => {
    setLoading(true);
    try { const r = await api("/api/proveedores/pagos"); setPagosGlobal(Array.isArray(r.data) ? r.data : []); }
    catch { setPagosGlobal([]); }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (tab === "pendientes") cargarPendientes(); else cargarPagos();
  }, [tab, cargarPendientes, cargarPagos]);

  useEffect(() => {
    api("/api/proveedores/lista").then(r => setLista(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, []);

  async function abrirHistorial(prov) {
    setModalHist(prov); setHistorial([]); setLoadingHist(true);
    try { const r = await api(`/api/proveedores/${prov.proveedorId}/pagos`); setHistorial(Array.isArray(r.data) ? r.data : []); }
    catch { setHistorial([]); }
    setLoadingHist(false);
  }

  async function confirmarPago() {
    if (!modalPago || !montoPago) return;
    setSaving(true);
    try {
      await api("/api/proveedores/pagos", { method: "POST", body: { proveedorId: modalPago.proveedorId, montoPago: Number(montoPago), comentario: comentarioPago || null } });
      setModalPago(null); setMontoPago(""); setComentarioPago("");
      cargarPendientes();
    } catch (err) { alert(err.message); }
    setSaving(false);
  }

  async function guardarNuevoPendiente() {
    setSaving(true);
    try {
      await api("/api/proveedores/compras/monto", { method: "POST", body: { proveedorId: Number(formPend.proveedorId), monto: Number(formPend.monto), comentario: formPend.comentario || null } });
      setModalNuevoPend(false); setFormPend({ proveedorId: "", monto: "", comentario: "" });
      cargarPendientes();
    } catch (err) { alert(err.message); }
    setSaving(false);
  }

  async function guardarNuevoProv() {
    setSaving(true);
    try {
      await api("/api/proveedores", { method: "POST", body: { nombre: formProv.nombre, descripcion: formProv.descripcion || null, correo: formProv.correo || null, telefono: formProv.telefono || null } });
      setModalNuevoProv(false); setFormProv({ nombre: "", descripcion: "", correo: "", telefono: "" });
      api("/api/proveedores/lista").then(r => setLista(Array.isArray(r.data) ? r.data : [])).catch(() => {});
      cargarPendientes();
    } catch (err) { alert(err.message); }
    setSaving(false);
  }

  const fmtCRC = fmt.moneda;
  const fmtFecha = fmt.fechaHora;

  const currentPag = tab === "pendientes" ? pagPend : pagPagos;
  const currentData = tab === "pendientes" ? pendientes : pagosGlobal;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Proveedores</h1>
          <p className="page-subtitle">Gestión de pagos y saldos pendientes</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => setModalNuevoPend(true)}>+ Factura pendiente</button>
          <button className="btn-primary" onClick={() => setModalNuevoProv(true)}>+ Nuevo proveedor</button>
        </div>
      </div>

      {/* Tabs como píldoras */}
      <div className="pill-bar">
        {[["pendientes","💳 Pagos pendientes"],["pagos","📋 Historial de pagos"]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`pill-btn ${tab === key ? "pill-btn-active" : "pill-btn-inactive"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="card overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-gray-500">
            {loading ? "Cargando…" : `${currentData.length} registro${currentData.length !== 1 ? "s" : ""}`}
          </span>
        </div>

        {loading ? <Spinner /> : (

          tab === "pendientes" ? (
            pendientes.length === 0 ? (
              <EmptyState icon="🏢" title="Sin proveedores pendientes"
                subtitle="No hay facturas pendientes de pago"
                action={<button className="btn" onClick={() => setModalNuevoPend(true)}>+ Factura pendiente</button>} />
            ) : (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Proveedor</th>
                      <th className="text-right">Total compras</th>
                      <th className="text-right">Total pagado</th>
                      <th className="text-right">Saldo pendiente</th>
                      <th className="text-center">Acción</th>
                      <th className="text-center">Historial</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagPend.paginados.map(p => (
                      <tr key={p.proveedorId} className="animate-fade-in">
                        <td className="font-semibold">{p.nombre}</td>
                        <td className="text-right">{fmtCRC(p.totalCompras)}</td>
                        <td className="text-right text-green-700 font-semibold">{fmtCRC(p.totalPagado)}</td>
                        <td className="text-right">
                          <span className={`font-black ${p.saldoPendiente > 0 ? "text-red-600" : "text-green-600"}`}>
                            {fmtCRC(p.saldoPendiente)}
                          </span>
                        </td>
                        <td className="text-center">
                          <button className="btn-primary text-xs py-1 px-3"
                            onClick={() => { setModalPago(p); setMontoPago(""); setComentarioPago(""); }}>
                            Pagar
                          </button>
                        </td>
                        <td className="text-center">
                          <button className="btn-ghost" onClick={() => abrirHistorial(p)}>
                            Ver historial
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Paginacion pagina={pagPend.pagina} totalPaginas={pagPend.totalPaginas} onChange={pagPend.setPagina} />
              </>
            )
          ) : (
            pagosGlobal.length === 0 ? (
              <EmptyState icon="💸" title="Sin pagos registrados" />
            ) : (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Fecha</th><th>Proveedor</th>
                      <th className="text-right">Monto</th>
                      <th className="text-right">Saldo antes</th>
                      <th className="text-right">Saldo después</th>
                      <th>Estado</th><th>Comentario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagPagos.paginados.map(p => (
                      <tr key={p.pagoId} className="animate-fade-in">
                        <td>{fmtFecha(p.fechaPago)}</td>
                        <td className="font-semibold">{p.nombre}</td>
                        <td className="text-right font-bold text-green-700">{fmtCRC(p.montoPago)}</td>
                        <td className="text-right text-gray-400">{fmtCRC(p.saldoAntes)}</td>
                        <td className="text-right text-gray-400">{fmtCRC(p.saldoDespues)}</td>
                        <td><StatusBadge label={p.estadoPago ?? "—"} variant={(p.estadoPago ?? "").toLowerCase()} /></td>
                        <td className="text-xs text-gray-400">{p.comentario ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Paginacion pagina={pagPagos.pagina} totalPaginas={pagPagos.totalPaginas} onChange={pagPagos.setPagina} />
              </>
            )
          )
        )}
      </div>

      {/* Modal pago */}
      <Modal open={!!modalPago} onClose={() => setModalPago(null)} title="Registrar Pago"
        footer={<><button className="btn" onClick={() => setModalPago(null)}>Cancelar</button><button className="btn-primary" onClick={confirmarPago} disabled={saving}>{saving ? "Procesando…" : "Confirmar Pago"}</button></>}>
        {modalPago && (
          <div className="flex flex-col gap-4">
            <div className="bg-slate-50 rounded-xl p-4 flex flex-col gap-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Proveedor</span><strong>{modalPago.nombre}</strong></div>
              <div className="flex justify-between"><span className="text-gray-500">Saldo pendiente</span><strong className="text-red-600">{fmtCRC(modalPago.saldoPendiente)}</strong></div>
            </div>
            <label className="field"><label>Monto a pagar</label><input type="number" step="0.01" min="0" value={montoPago} onChange={e => setMontoPago(e.target.value)} placeholder="Ej: 50000" /></label>
            <label className="field"><label>Comentario (opcional)</label><input type="text" value={comentarioPago} onChange={e => setComentarioPago(e.target.value)} /></label>
          </div>
        )}
      </Modal>

      {/* Modal historial proveedor */}
      <Modal open={!!modalHist} onClose={() => setModalHist(null)} title={`Historial — ${modalHist?.nombre ?? ""}`} wide>
        {loadingHist ? <Spinner /> : historial.length === 0 ? <EmptyState icon="📋" title="Sin pagos registrados" /> : (
          <table className="data-table">
            <thead><tr><th>Fecha</th><th className="text-right">Monto</th><th className="text-right">Antes</th><th className="text-right">Después</th><th>Estado</th><th>Comentario</th></tr></thead>
            <tbody>{historial.map(h => <tr key={h.pagoId}><td>{fmtFecha(h.fechaPago)}</td><td className="text-right font-bold">{fmtCRC(h.montoPago)}</td><td className="text-right text-gray-400">{fmtCRC(h.saldoAntes)}</td><td className="text-right text-gray-400">{fmtCRC(h.saldoDespues)}</td><td><StatusBadge label={h.estadoPago ?? "—"} variant={(h.estadoPago ?? "").toLowerCase()} /></td><td className="text-xs text-gray-400">{h.comentario ?? "—"}</td></tr>)}</tbody>
          </table>
        )}
      </Modal>

      {/* Modal nueva factura */}
      <Modal open={modalNuevoPend} onClose={() => setModalNuevoPend(false)} title="Registrar factura pendiente"
        footer={<><button className="btn" onClick={() => setModalNuevoPend(false)}>Cancelar</button><button className="btn-primary" onClick={guardarNuevoPendiente} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</button></>}>
        <div className="flex flex-col gap-4">
          <label className="field"><label>Proveedor</label><select value={formPend.proveedorId} onChange={e => setFormPend(f => ({ ...f, proveedorId: e.target.value }))}><option value="">Seleccione</option>{lista.map(p => <option key={p.proveedorId} value={p.proveedorId}>{p.nombre}</option>)}</select></label>
          <label className="field"><label>Monto de compra</label><input type="number" step="0.01" value={formPend.monto} onChange={e => setFormPend(f => ({ ...f, monto: e.target.value }))} /></label>
          <label className="field"><label>Comentario (opcional)</label><input type="text" maxLength={200} value={formPend.comentario} onChange={e => setFormPend(f => ({ ...f, comentario: e.target.value }))} /></label>
        </div>
      </Modal>

      {/* Modal nuevo proveedor */}
      <Modal open={modalNuevoProv} onClose={() => setModalNuevoProv(false)} title="Crear proveedor"
        footer={<><button className="btn" onClick={() => setModalNuevoProv(false)}>Cancelar</button><button className="btn-primary" onClick={guardarNuevoProv} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</button></>}>
        <div className="flex flex-col gap-4">
          <label className="field"><label>Nombre *</label><input type="text" value={formProv.nombre} onChange={e => setFormProv(f => ({ ...f, nombre: e.target.value }))} /></label>
          <label className="field"><label>Descripción</label><input type="text" value={formProv.descripcion} onChange={e => setFormProv(f => ({ ...f, descripcion: e.target.value }))} /></label>
          <label className="field"><label>Correo</label><input type="email" value={formProv.correo} onChange={e => setFormProv(f => ({ ...f, correo: e.target.value }))} /></label>
          <label className="field"><label>Teléfono</label><input type="text" value={formProv.telefono} onChange={e => setFormProv(f => ({ ...f, telefono: e.target.value }))} /></label>
        </div>
      </Modal>
    </div>
  );
}
