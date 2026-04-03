import { useState, useEffect, useCallback, useMemo } from "react";
import { api, UNIDADES } from "../services/api";
import { usePaginacion } from "../hooks/usePaginacion";
import Modal from "../components/Modal";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import Paginacion from "../components/Paginacion";

const fmtCRC = (n) =>
  new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC" }).format(n ?? 0);

export default function Inventario() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filtros, setFiltros]     = useState({ nombre: "", unidadId: "", activo: "" });
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState({
    nombreProducto: "", unidadId: "", precioBase: "", diasCaducidad: "",
    stockMinimo: "", requiereRefrigeracion: false, activo: true,
    descripcion: "", imagenUrl: "",
  });
  const [saving, setSaving]   = useState(false);
  const [detalle, setDetalle] = useState(null);

  // filtrados se calcula ANTES de pasarlo a usePaginacion
  const filtrados = useMemo(() => productos.filter(p => {
    if (filtros.nombre   && !p.nombreProducto?.toLowerCase().includes(filtros.nombre.toLowerCase())) return false;
    if (filtros.unidadId && String(p.unidadId) !== filtros.unidadId) return false;
    if (filtros.activo   !== "" && String(p.activo) !== filtros.activo) return false;
    return true;
  }), [productos, filtros]);

  const { paginados, pagina, totalPaginas, setPagina } = usePaginacion(filtrados);

  const cargar = useCallback(async () => {
    setLoading(true);
    setPagina(1);
    try {
      const r = await api("/api/Producto");
      setProductos(Array.isArray(r.data) ? r.data : []);
    } catch { setProductos([]); }
    setLoading(false);
  }, [setPagina]);

  useEffect(() => { cargar(); }, [cargar]);

  function abrirNuevo() {
    setEditId(null);
    setForm({ nombreProducto: "", unidadId: "", precioBase: "", diasCaducidad: "", stockMinimo: "", requiereRefrigeracion: false, activo: true, descripcion: "", imagenUrl: "" });
    setShowModal(true);
  }

  function abrirEditar(p) {
    setEditId(p.productoId);
    setForm({
      nombreProducto: p.nombreProducto, unidadId: p.unidadId ?? "",
      precioBase: p.precioBase ?? "", diasCaducidad: p.diasCaducidad ?? "",
      stockMinimo: p.stockMinimo ?? "", requiereRefrigeracion: p.requiereRefrigeracion ?? false,
      activo: p.activo ?? true, descripcion: p.descripcion ?? "", imagenUrl: p.imagenUrl ?? "",
    });
    setShowModal(true);
  }

  async function guardar() {
    setSaving(true);
    try {
      const body = {
        ...form,
        unidadId: Number(form.unidadId), precioBase: Number(form.precioBase),
        diasCaducidad: Number(form.diasCaducidad), stockMinimo: Number(form.stockMinimo),
      };
      if (editId) await api(`/api/Producto/${editId}`, { method: "PUT", body });
      else        await api("/api/Producto", { method: "POST", body });
      setShowModal(false); cargar();
    } catch (err) { alert(err.message); }
    setSaving(false);
  }

  async function eliminar(id, nombre) {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;
    try { await api(`/api/Producto/${id}`, { method: "DELETE" }); setDetalle(null); cargar(); }
    catch (err) { alert(err.message); }
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Registro de Inventario</h1>
          <p className="page-subtitle">Administrá el catálogo de productos</p>
        </div>
        <div className="page-actions">
          <button className="btn-primary" onClick={abrirNuevo}>+ Nuevo producto</button>
          <button className="btn" onClick={cargar}>↺ Refrescar</button>
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="filter-bar">
          <label className="field" style={{ minWidth: 220 }}>
            <label>Buscar por nombre</label>
            <input type="text" placeholder="Ej: Lechuga..." value={filtros.nombre}
              onChange={e => { setFiltros(f => ({ ...f, nombre: e.target.value })); setPagina(1); }} />
          </label>
          <label className="field" style={{ minWidth: 160 }}>
            <label>Unidad</label>
            <select value={filtros.unidadId}
              onChange={e => { setFiltros(f => ({ ...f, unidadId: e.target.value })); setPagina(1); }}>
              <option value="">Todas</option>
              {UNIDADES.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
            </select>
          </label>
          <label className="field" style={{ minWidth: 140 }}>
            <label>Estado</label>
            <select value={filtros.activo}
              onChange={e => { setFiltros(f => ({ ...f, activo: e.target.value })); setPagina(1); }}>
              <option value="">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </label>
          <div className="filter-actions">
            <button className="btn" onClick={() => { setFiltros({ nombre: "", unidadId: "", activo: "" }); setPagina(1); }}>
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="card overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-gray-500">
            {loading ? "Cargando…" : `${filtrados.length} producto${filtrados.length !== 1 ? "s" : ""}`}
          </span>
        </div>
        {loading ? <Spinner /> : filtrados.length === 0 ? (
          <EmptyState icon="📦" title="No hay productos" subtitle="Ajustá los filtros o agregá un nuevo producto"
            action={<button className="btn-primary" onClick={abrirNuevo}>+ Nuevo producto</button>} />
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th><th>Nombre</th><th>Unidad</th>
                  <th className="text-right">Precio base</th>
                  <th>Estado</th><th>Stock mín.</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginados.map(p => {
                  const u = UNIDADES.find(x => x.id === p.unidadId);
                  return (
                    <tr key={p.productoId}>
                      <td className="text-gray-400 text-xs font-mono">{p.productoId}</td>
                      <td className="font-semibold">{p.nombreProducto}</td>
                      <td>{u ? `${u.nombre} (${u.simbolo})` : "—"}</td>
                      <td className="text-right">{fmtCRC(p.precioBase)}</td>
                      <td>
                        <StatusBadge label={p.activo ? "Activo" : "Inactivo"}
                          variant={p.activo ? "activo" : "inactivo"} />
                      </td>
                      <td>{p.stockMinimo ?? "—"}</td>
                      <td>
                        <div className="flex gap-1">
                          <button className="btn-ghost" onClick={() => setDetalle(p)}>Ver</button>
                          <button className="btn-ghost" onClick={() => abrirEditar(p)}>Editar</button>
                          <button className="btn-ghost text-red-500 hover:bg-red-50"
                            onClick={() => eliminar(p.productoId, p.nombreProducto)}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Paginacion pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} />
          </>
        )}
      </div>

      {/* Modal nuevo/editar */}
      <Modal open={showModal} onClose={() => setShowModal(false)}
        title={editId ? "Editar producto" : "Nuevo producto"}
        footer={<>
          <button className="btn" onClick={() => setShowModal(false)}>Cancelar</button>
          <button className="btn-primary" onClick={guardar} disabled={saving}>
            {saving ? "Guardando…" : "Guardar producto"}
          </button>
        </>}>
        <div className="grid grid-cols-2 gap-4">
          <label className="field col-span-2">
            <label>Nombre del producto *</label>
            <input type="text" placeholder="Ej: Lechuga Romana" value={form.nombreProducto}
              onChange={e => setForm(f => ({ ...f, nombreProducto: e.target.value }))} />
          </label>
          <label className="field">
            <label>Unidad de medida *</label>
            <select value={form.unidadId} onChange={e => setForm(f => ({ ...f, unidadId: e.target.value }))}>
              <option value="">Seleccione...</option>
              {UNIDADES.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
            </select>
          </label>
          <label className="field">
            <label>Precio base (₡)</label>
            <input type="number" step="0.01" value={form.precioBase}
              onChange={e => setForm(f => ({ ...f, precioBase: e.target.value }))} />
          </label>
          <label className="field">
            <label>Stock mínimo</label>
            <input type="number" value={form.stockMinimo}
              onChange={e => setForm(f => ({ ...f, stockMinimo: e.target.value }))} />
          </label>
          <label className="field">
            <label>Días caducidad</label>
            <input type="number" value={form.diasCaducidad}
              onChange={e => setForm(f => ({ ...f, diasCaducidad: e.target.value }))} />
          </label>
          <label className="field">
            <label>Estado</label>
            <select value={String(form.activo)}
              onChange={e => setForm(f => ({ ...f, activo: e.target.value === "true" }))}>
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </label>
          <label className="field">
            <label>Requiere refrigeración</label>
            <select value={String(form.requiereRefrigeracion)}
              onChange={e => setForm(f => ({ ...f, requiereRefrigeracion: e.target.value === "true" }))}>
              <option value="false">No</option>
              <option value="true">Sí</option>
            </select>
          </label>
          <label className="field col-span-2">
            <label>Descripción</label>
            <input type="text" value={form.descripcion}
              onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
          </label>
        </div>
      </Modal>

      {/* Modal detalle */}
      <Modal open={!!detalle} onClose={() => setDetalle(null)}
        title={detalle?.nombreProducto ?? "Producto"}
        footer={<>
          <button className="btn" onClick={() => { const p = detalle; setDetalle(null); abrirEditar(p); }}>
            Editar
          </button>
          <span className="flex-1" />
          <button className="btn-danger"
            onClick={() => eliminar(detalle.productoId, detalle.nombreProducto)}>
            Eliminar
          </button>
        </>}>
        {detalle && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ["ID",           detalle.productoId],
              ["Unidad",       UNIDADES.find(u => u.id === detalle.unidadId)?.nombre ?? "—"],
              ["Precio base",  fmtCRC(detalle.precioBase)],
              ["Stock mínimo", detalle.stockMinimo ?? "—"],
              ["Días caducidad", detalle.diasCaducidad ?? "—"],
              ["Refrigeración", detalle.requiereRefrigeracion ? "Sí" : "No"],
              ["Estado",       detalle.activo ? "Activo" : "Inactivo"],
              ["Descripción",  detalle.descripcion ?? "—"],
            ].map(([k, v]) => (
              <div key={k} className="bg-gray-50 rounded-xl p-3">
                <div className="text-xs text-gray-400 font-bold uppercase">{k}</div>
                <div className="font-bold text-gray-900 mt-0.5">{v}</div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
