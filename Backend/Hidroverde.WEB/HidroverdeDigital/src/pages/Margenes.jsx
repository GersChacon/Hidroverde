import { useState, useEffect, useCallback } from "react";
import { api, fmt, UNIDADES } from "../services/api";
import Modal from "../components/Modal";
import { usePaginacion } from "../hooks/usePaginacion";
import Paginacion from "../components/Paginacion";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";

export default function Margenes() {
  const [margenes, setMargenes]   = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos]     = useState([]);
  const [detalleActual, setDetalleActual] = useState(null);
  const [filtros, setFiltros]     = useState({ producto: "", proveedor: "", orden: "margenDesc" });

  const [modalCompra, setModalCompra] = useState(false);
  const [modalMerma, setModalMerma]   = useState(false);
  const [modalCompras, setModalCompras] = useState(false);
  const [comprasList, setComprasList] = useState([]);
  const [mermaInfo, setMermaInfo]     = useState(null);
  const [saving, setSaving]           = useState(false);

  const [formCompra, setFormCompra] = useState({
    proveedorId: "", productoId: "", unidadId: "", cantidadComprada: "",
    totalFactura: "", fechaCompra: new Date().toISOString().slice(0,16),
    observaciones: "", observacionesDetalle: "",
  });
  const [formMerma, setFormMerma]   = useState({ compraDetalleId: "", cantidadMerma: "", motivo: "" });

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api("/api/compras-plantas/margenes");
      const arr = Array.isArray(r.data) ? r.data : [];
      setMargenes(arr);
      setFiltrados(arr);
    } catch { setMargenes([]); setFiltrados([]); }
    setLoading(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  useEffect(() => {
    api("/api/proveedores/lista").then(r => setProveedores(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    api("/api/Producto").then(r => setProductos(Array.isArray(r.data) ? r.data.filter(p => p.activo) : [])).catch(() => {});
  }, []);

  useEffect(() => {
    let arr = [...margenes];
    if (filtros.producto)  arr = arr.filter(m => m.nombreProducto?.toLowerCase().includes(filtros.producto.toLowerCase()));
    if (filtros.proveedor) arr = arr.filter(m => m.proveedorNombre?.toLowerCase().includes(filtros.proveedor.toLowerCase()));
    const ord = filtros.orden;
    arr.sort((a, b) => {
      if (ord === "margenDesc")   return (b.margenPorcentaje ?? 0) - (a.margenPorcentaje ?? 0);
      if (ord === "margenAsc")    return (a.margenPorcentaje ?? 0) - (b.margenPorcentaje ?? 0);
      if (ord === "mermaDesc")    return (b.cantidadMerma ?? 0)    - (a.cantidadMerma ?? 0);
      if (ord === "productoAsc")  return (a.nombreProducto ?? "").localeCompare(b.nombreProducto ?? "");
      if (ord === "proveedorAsc") return (a.proveedorNombre ?? "").localeCompare(b.proveedorNombre ?? "");
      return 0;
    });
    setFiltrados(arr);
  }, [filtros, margenes]);

  async function abrirMermaDesdeDetalle() {
    if (!detalleActual) return;
    try {
      const r = await api(`/api/compras-plantas/detalle-por-producto-proveedor?productoId=${detalleActual.productoId}&proveedorId=${detalleActual.proveedorId}`);
      setMermaInfo(r.data);
      setFormMerma({ compraDetalleId: r.data?.compraDetalleId ?? "", cantidadMerma: "", motivo: "" });
      setModalMerma(true);
    } catch (err) { alert(err.message); }
  }

  async function guardarCompra() {
    setSaving(true);
    try {
      await api("/api/compras-plantas", {
        method: "POST",
        body: {
          proveedorId:   Number(formCompra.proveedorId),
          empleadoId:    1,
          fechaCompra:   formCompra.fechaCompra,
          totalFactura:  Number(formCompra.totalFactura),
          observaciones: formCompra.observaciones || null,
          detalle: [{
            productoId:       Number(formCompra.productoId),
            unidadId:         Number(formCompra.unidadId),
            cantidadComprada: Number(formCompra.cantidadComprada),
            costoTotalLinea:  Number(formCompra.totalFactura),
            observaciones:    formCompra.observacionesDetalle || null,
          }],
        },
      });
      setModalCompra(false);
      cargar();
    } catch (err) { alert(err.message); }
    setSaving(false);
  }

  async function guardarMerma() {
    setSaving(true);
    try {
      await api("/api/compras-plantas/merma", {
        method: "POST",
        body: {
          compraDetalleId: Number(formMerma.compraDetalleId),
          cantidadMerma:   Number(formMerma.cantidadMerma),
          motivo:          formMerma.motivo || null,
          empleadoId:      1,
        },
      });
      setModalMerma(false);
      cargar();
    } catch (err) { alert(err.message); }
    setSaving(false);
  }

  async function verCompras() {
    try {
      const r = await api("/api/compras-plantas");
      setComprasList(Array.isArray(r.data) ? r.data : []);
      setModalCompras(true);
    } catch (err) { alert(err.message); }
  }

  const fmtCRC  = fmt.moneda;
  const fmtFecha = fmt.fecha;

  const mejorMargen = filtrados.length ? Math.max(...filtrados.map(m => m.margenPorcentaje ?? 0)) : 0;
  const peorMargen  = filtrados.length ? Math.min(...filtrados.map(m => m.margenPorcentaje ?? 0)) : 0;
  const mayorMerma  = filtrados.length ? Math.max(...filtrados.map(m => m.cantidadMerma ?? 0)) : 0;
  const provTop     = filtrados.length ? filtrados.reduce((a,b) => (a.margenPorcentaje??0)>(b.margenPorcentaje??0)?a:b).proveedorNombre ?? "—" : "—";
  const prodTop     = filtrados.length ? filtrados.reduce((a,b) => (a.margenPorcentaje??0)>(b.margenPorcentaje??0)?a:b).nombreProducto ?? "—" : "—";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs font-bold text-green-600 uppercase tracking-wide">Rentabilidad</p>
          <h2 className="text-2xl font-black text-gray-900">Márgenes de utilidad</h2>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="btn-primary" onClick={() => setModalCompra(true)}>Nueva compra</button>
          <button className="btn" onClick={() => setModalMerma(true)}>Registrar merma</button>
          <button className="btn" onClick={verCompras}>Ver compras</button>
          <button className="btn" onClick={cargar}>Refrescar</button>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total registros",    val: filtrados.length,           cls: "bg-gray-50" },
          { label: "Mejor margen %",     val: `${mejorMargen.toFixed(1)}%`, cls: "bg-green-50 text-green-800" },
          { label: "Mayor merma",        val: mayorMerma,                 cls: "bg-yellow-50 text-yellow-800" },
          { label: "Peor margen %",      val: `${peorMargen.toFixed(1)}%`, cls: "bg-red-50 text-red-700" },
          { label: "Prov. más rentable", val: provTop,                    cls: "bg-blue-50 text-blue-800" },
          { label: "Prod. más rentable", val: prodTop,                    cls: "bg-purple-50 text-purple-800" },
        ].map(({ label, val, cls }) => (
          <div key={label} className={`card ${cls} text-center`}>
            <div className="text-xs font-bold text-gray-500 uppercase mb-1">{label}</div>
            <div className="font-black text-lg truncate" title={String(val)}>{val}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="card flex flex-wrap gap-3 items-end">
        <label className="field" style={{ minWidth: 180 }}>
          <label>Producto</label>
          <input type="text" placeholder="Ej. Lechuga Romana" value={filtros.producto} onChange={e => setFiltros(f => ({ ...f, producto: e.target.value }))} />
        </label>
        <label className="field" style={{ minWidth: 180 }}>
          <label>Proveedor</label>
          <input type="text" placeholder="Ej. Agroverde" value={filtros.proveedor} onChange={e => setFiltros(f => ({ ...f, proveedor: e.target.value }))} />
        </label>
        <label className="field" style={{ minWidth: 180 }}>
          <label>Ordenar por</label>
          <select value={filtros.orden} onChange={e => setFiltros(f => ({ ...f, orden: e.target.value }))}>
            <option value="margenDesc">Mayor margen %</option>
            <option value="margenAsc">Menor margen %</option>
            <option value="mermaDesc">Mayor merma</option>
            <option value="productoAsc">Producto A-Z</option>
            <option value="proveedorAsc">Proveedor A-Z</option>
          </select>
        </label>
        <button className="btn" onClick={() => setFiltros({ producto: "", proveedor: "", orden: "margenDesc" })}>Limpiar</button>
      </div>

      {/* Tabla */}
      <div className="card overflow-x-auto">
        <h3 className="font-black text-gray-900 mb-1">Resumen de márgenes</h3>
        <p className="text-xs text-gray-400 mb-3">Seleccioná "Ver" para consultar el detalle.</p>
        {loading ? <Spinner /> : filtrados.length === 0 ? (
          <EmptyState icon="📈" title="Sin datos de márgenes" subtitle="Registrá una compra para comenzar" />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Producto</th><th>Proveedor</th>
                <th className="text-right">Comprado</th><th className="text-right">Merma</th>
                <th className="text-right">Útil</th><th className="text-right">Costo real</th>
                <th className="text-right">Precio base</th><th className="text-right">Margen %</th><th>Ver</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((m, i) => {
                const ok = (m.margenPorcentaje ?? 0) >= 0;
                return (
                  <tr key={i}>
                    <td className="font-bold">{m.nombreProducto}</td>
                    <td>{m.proveedorNombre}</td>
                    <td className="text-right">{m.cantidadComprada ?? 0}</td>
                    <td className="text-right text-red-500">{m.cantidadMerma ?? 0}</td>
                    <td className="text-right text-green-700">{m.cantidadUtil ?? 0}</td>
                    <td className="text-right">{fmtCRC(m.costoUnitarioReal)}</td>
                    <td className="text-right">{fmtCRC(m.precioBase)}</td>
                    <td className={`text-right font-black ${ok ? "text-green-700" : "text-red-600"}`}>
                      {(m.margenPorcentaje ?? 0).toFixed(1)}%
                    </td>
                    <td><button className="btn text-xs py-1 px-2" onClick={() => setDetalleActual(m)}>Ver</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Panel detalle */}
        {detalleActual && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-black text-gray-900">{detalleActual.nombreProducto} · {detalleActual.proveedorNombre}</h3>
                <p className="text-xs text-gray-400">Detalle de rentabilidad</p>
              </div>
              <button className="btn text-xs" onClick={() => setDetalleActual(null)}>Cerrar</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                ["Costo total",             fmtCRC(detalleActual.costoTotal)],
                ["Costo unitario inicial",  fmtCRC(detalleActual.costoUnitarioInicial)],
                ["Costo unitario real",     fmtCRC(detalleActual.costoUnitarioReal)],
                ["Margen unitario",         fmtCRC(detalleActual.margenUnitario)],
                ["Margen %",               `${(detalleActual.margenPorcentaje ?? 0).toFixed(2)}%`],
                ["Cantidad útil",           detalleActual.cantidadUtil ?? 0],
              ].map(([k, v]) => (
                <div key={k} className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-400 font-bold uppercase">{k}</div>
                  <div className="font-black text-gray-900 mt-0.5">{v}</div>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <button className="btn-primary text-sm" onClick={abrirMermaDesdeDetalle}>Registrar merma</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal nueva compra */}
      <Modal open={modalCompra} onClose={() => setModalCompra(false)} title="Nueva compra"
        footer={<>
          <button className="btn" onClick={() => setModalCompra(false)}>Cerrar</button>
          <button className="btn-primary" onClick={guardarCompra} disabled={saving}>{saving ? "Guardando…" : "Guardar compra"}</button>
        </>}>
        <div className="grid grid-cols-2 gap-4">
          <label className="field col-span-2">
            <label>Proveedor</label>
            <select value={formCompra.proveedorId} onChange={e => setFormCompra(f => ({ ...f, proveedorId: e.target.value }))}>
              <option value="">Seleccione un proveedor</option>
              {proveedores.map(p => <option key={p.proveedorId} value={p.proveedorId}>{p.nombre}</option>)}
            </select>
          </label>
          <label className="field"><label>Fecha de compra</label><input type="datetime-local" value={formCompra.fechaCompra} onChange={e => setFormCompra(f => ({ ...f, fechaCompra: e.target.value }))} /></label>
          <label className="field"><label>Total factura</label><input type="number" step="0.01" value={formCompra.totalFactura} onChange={e => setFormCompra(f => ({ ...f, totalFactura: e.target.value }))} placeholder="Ej. 50000" /></label>
          <label className="field col-span-2"><label>Observaciones cabecera</label><input type="text" value={formCompra.observaciones} onChange={e => setFormCompra(f => ({ ...f, observaciones: e.target.value }))} placeholder="Opcional" /></label>
          <div className="col-span-2 border-t border-gray-100 pt-3">
            <p className="text-xs font-bold text-gray-500 uppercase mb-3">Detalle de compra</p>
          </div>
          <label className="field">
            <label>Producto</label>
            <select value={formCompra.productoId} onChange={e => setFormCompra(f => ({ ...f, productoId: e.target.value }))}>
              <option value="">Seleccione un producto</option>
              {productos.map(p => <option key={p.productoId} value={p.productoId}>{p.nombreProducto}</option>)}
            </select>
          </label>
          <label className="field">
            <label>Unidad</label>
            <select value={formCompra.unidadId} onChange={e => setFormCompra(f => ({ ...f, unidadId: e.target.value }))}>
              <option value="">Seleccione</option>
              {UNIDADES.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
            </select>
          </label>
          <label className="field"><label>Cantidad comprada</label><input type="number" step="0.01" value={formCompra.cantidadComprada} onChange={e => setFormCompra(f => ({ ...f, cantidadComprada: e.target.value }))} /></label>
          <label className="field"><label>Observaciones detalle</label><input type="text" value={formCompra.observacionesDetalle} onChange={e => setFormCompra(f => ({ ...f, observacionesDetalle: e.target.value }))} placeholder="Opcional" /></label>
        </div>
      </Modal>

      {/* Modal merma */}
      <Modal open={modalMerma} onClose={() => setModalMerma(false)} title="Registrar merma"
        footer={<>
          <button className="btn" onClick={() => setModalMerma(false)}>Cerrar</button>
          <button className="btn-primary" onClick={guardarMerma} disabled={saving}>{saving ? "Guardando…" : "Guardar merma"}</button>
        </>}>
        <div className="flex flex-col gap-4">
          {mermaInfo && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[["Producto", mermaInfo.nombreProducto], ["Proveedor", mermaInfo.proveedorNombre], ["Comprado", mermaInfo.cantidadComprada], ["Merma actual", mermaInfo.cantidadMermaActual], ["Disponible para merma", mermaInfo.cantidadDisponibleParaMerma]].map(([k,v]) => (
                <div key={k} className="bg-gray-50 rounded-xl p-2">
                  <div className="text-xs text-gray-400">{k}</div>
                  <div className="font-bold">{v ?? "—"}</div>
                </div>
              ))}
            </div>
          )}
          <label className="field"><label>Nueva merma</label><input type="number" step="0.01" value={formMerma.cantidadMerma} onChange={e => setFormMerma(f => ({ ...f, cantidadMerma: e.target.value }))} placeholder="Ej. 5" /></label>
          <label className="field"><label>Motivo</label><input type="text" value={formMerma.motivo} onChange={e => setFormMerma(f => ({ ...f, motivo: e.target.value }))} placeholder="Opcional" /></label>
        </div>
      </Modal>

      {/* Modal ver compras */}
      <Modal open={modalCompras} onClose={() => setModalCompras(false)} title="Compras registradas">
        {comprasList.length === 0 ? (
          <EmptyState icon="📋" title="Sin compras" />
        ) : (
          <table className="data-table">
            <thead><tr><th>Fecha</th><th>Proveedor</th><th className="text-right">Total</th><th>Observaciones</th></tr></thead>
            <tbody>
              {comprasList.map((c, i) => (
                <tr key={i}>
                  <td>{fmtFecha(c.fechaCompra)}</td>
                  <td>{c.proveedorNombre ?? c.proveedor ?? "—"}</td>
                  <td className="text-right">{fmtCRC(c.totalFactura)}</td>
                  <td className="text-xs text-gray-400">{c.observaciones ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Modal>
    </div>
  );
}
