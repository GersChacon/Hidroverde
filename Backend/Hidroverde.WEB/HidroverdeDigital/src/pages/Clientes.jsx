import { useState, useEffect, useCallback } from "react";
import { api, fmt } from "../services/api";
import { usePaginacion } from "../hooks/usePaginacion";
import Modal from "../components/Modal";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import Paginacion from "../components/Paginacion";

export default function Clientes() {
  const [clientes, setClientes]       = useState([]);
  const [tiposCliente, setTiposCliente] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [busqueda, setBusqueda]       = useState("");
  const [filtroActivo, setFiltroActivo] = useState("");

  const [showModal, setShowModal]     = useState(false);
  const [editId, setEditId]           = useState(null);
  const [saving, setSaving]           = useState(false);
  const [detalle, setDetalle]         = useState(null);

  // Direcciones
  const [direcciones, setDirecciones] = useState([]);
  const [loadingDir, setLoadingDir]   = useState(false);
  const [showDirModal, setShowDirModal] = useState(false);
  const [dirForm, setDirForm]         = useState({ descripcion: "", direccionExacta: "", provincia: "", canton: "", distrito: "", codigoPostal: "", esDefault: false });

  const initForm = () => ({
    tipoClienteId: "", cedulaRuc: "", nombre: "", apellidos: "",
    telefono: "", email: "", notas: "", activo: true,
  });
  const [form, setForm] = useState(initForm());

  const filtrados = clientes.filter(c => {
    if (busqueda) {
      const q = busqueda.toLowerCase();
      const match = c.nombre?.toLowerCase().includes(q) ||
        c.apellidos?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.cedulaRuc?.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filtroActivo !== "" && String(c.activo) !== filtroActivo) return false;
    return true;
  });

  const { paginados, pagina, totalPaginas, setPagina } = usePaginacion(filtrados);

  const cargar = useCallback(async () => {
    setLoading(true);
    setPagina(1);
    try {
      const r = await api("/api/Cliente");
      setClientes(Array.isArray(r.data) ? r.data : []);
    } catch { setClientes([]); }
    setLoading(false);
  }, [setPagina]);

  useEffect(() => { cargar(); }, [cargar]);
  useEffect(() => {
    api("/api/TipoCliente").then(r => setTiposCliente(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, []);

  function abrirNuevo() {
    setEditId(null); setForm(initForm()); setShowModal(true);
  }
  function abrirEditar(c) {
    setEditId(c.clienteId);
    setForm({
      tipoClienteId: c.tipoClienteId ?? "", cedulaRuc: c.cedulaRuc ?? "",
      nombre: c.nombre ?? "", apellidos: c.apellidos ?? "",
      telefono: c.telefono ?? "", email: c.email ?? "",
      notas: c.notas ?? "", activo: c.activo ?? true,
    });
    setShowModal(true);
  }

  async function guardar() {
    if (!form.nombre || !form.email || !form.telefono) {
      alert("Nombre, email y teléfono son requeridos."); return;
    }
    setSaving(true);
    try {
      const body = { ...form, tipoClienteId: Number(form.tipoClienteId) || 1 };
      if (editId) await api(`/api/Cliente/${editId}`, { method: "PUT", body });
      else await api("/api/Cliente", { method: "POST", body });
      setShowModal(false); cargar();
    } catch (err) { alert(err.message); }
    setSaving(false);
  }

  async function verDetalle(c) {
    setDetalle(c);
    setLoadingDir(true);
    try {
      const r = await api(`/api/Cliente/${c.clienteId}/direcciones`);
      setDirecciones(Array.isArray(r.data) ? r.data : []);
    } catch { setDirecciones([]); }
    setLoadingDir(false);
  }

  async function guardarDireccion() {
    if (!dirForm.direccionExacta) { alert("Dirección exacta es requerida."); return; }
    setSaving(true);
    try {
      await api(`/api/Cliente/${detalle.clienteId}/direcciones`, {
        method: "POST",
        body: { ...dirForm, clienteId: detalle.clienteId },
      });
      setShowDirModal(false);
      // Recargar direcciones
      const r = await api(`/api/Cliente/${detalle.clienteId}/direcciones`);
      setDirecciones(Array.isArray(r.data) ? r.data : []);
    } catch (err) { alert(err.message); }
    setSaving(false);
  }

  async function eliminarDireccion(dirId) {
    if (!confirm("¿Eliminar esta dirección?")) return;
    try {
      await api(`/api/Cliente/${detalle.clienteId}/direcciones/${dirId}`, { method: "DELETE" });
      setDirecciones(prev => prev.filter(d => (d.direccionId ?? d.direccionClienteId) !== dirId));
    } catch (err) { alert(err.message); }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Clientes</h1>
          <p className="page-subtitle">Gestión de clientes y direcciones de entrega</p>
        </div>
        <div className="page-actions">
          <button className="btn-primary" onClick={abrirNuevo}>+ Nuevo cliente</button>
          <button className="btn" onClick={cargar}>↺ Refrescar</button>
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="filter-bar">
          <label className="field" style={{ minWidth: 240 }}>
            <label>Buscar</label>
            <input type="search" placeholder="Nombre, cédula, email..."
              value={busqueda}
              onChange={e => { setBusqueda(e.target.value); setPagina(1); }} />
          </label>
          <label className="field" style={{ minWidth: 140 }}>
            <label>Estado</label>
            <select value={filtroActivo}
              onChange={e => { setFiltroActivo(e.target.value); setPagina(1); }}>
              <option value="">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </label>
          <div className="filter-actions">
            <button className="btn" onClick={() => { setBusqueda(""); setFiltroActivo(""); setPagina(1); }}>
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="card overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-gray-500">
            {loading ? "Cargando…" : `${filtrados.length} cliente${filtrados.length !== 1 ? "s" : ""}`}
          </span>
        </div>
        {loading ? <Spinner /> : filtrados.length === 0 ? (
          <EmptyState icon="👥" title="Sin clientes" subtitle="Registrá un cliente para comenzar"
            action={<button className="btn-primary" onClick={abrirNuevo}>+ Nuevo cliente</button>} />
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th><th>Nombre</th><th>Tipo</th>
                  <th>Email</th><th>Teléfono</th>
                  <th>Estado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginados.map(c => (
                  <tr key={c.clienteId}>
                    <td className="text-gray-400 text-xs font-mono">{c.clienteId}</td>
                    <td className="font-semibold">
                      {`${c.nombre ?? ""} ${c.apellidos ?? ""}`.trim()}
                      {c.cedulaRuc && <span className="text-xs text-gray-400 ml-2">({c.cedulaRuc})</span>}
                    </td>
                    <td className="text-sm text-gray-500">{c.nombreTipoCliente ?? "—"}</td>
                    <td className="text-sm">{c.email ?? "—"}</td>
                    <td className="text-sm">{c.telefono ?? "—"}</td>
                    <td>
                      <StatusBadge label={c.activo ? "Activo" : "Inactivo"}
                        variant={c.activo ? "activo" : "inactivo"} />
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button className="btn-ghost" onClick={() => verDetalle(c)}>Ver</button>
                        <button className="btn-ghost" onClick={() => abrirEditar(c)}>Editar</button>
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

      {/* Modal nuevo/editar */}
      <Modal open={showModal} onClose={() => setShowModal(false)}
        title={editId ? "Editar cliente" : "Nuevo cliente"}
        footer={<>
          <button className="btn" onClick={() => setShowModal(false)}>Cancelar</button>
          <button className="btn-primary" onClick={guardar} disabled={saving}>
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </>}>
        <div className="grid grid-cols-2 gap-4">
          <label className="field">
            <label>Nombre *</label>
            <input type="text" value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
          </label>
          <label className="field">
            <label>Apellidos</label>
            <input type="text" value={form.apellidos}
              onChange={e => setForm(f => ({ ...f, apellidos: e.target.value }))} />
          </label>
          <label className="field">
            <label>Email *</label>
            <input type="email" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </label>
          <label className="field">
            <label>Teléfono *</label>
            <input type="text" value={form.telefono}
              onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} />
          </label>
          <label className="field">
            <label>Cédula / RUC</label>
            <input type="text" value={form.cedulaRuc}
              onChange={e => setForm(f => ({ ...f, cedulaRuc: e.target.value }))} />
          </label>
          <label className="field">
            <label>Tipo de cliente</label>
            <select value={form.tipoClienteId}
              onChange={e => setForm(f => ({ ...f, tipoClienteId: e.target.value }))}>
              <option value="">Seleccione</option>
              {tiposCliente.map(t => (
                <option key={t.tipoClienteId} value={t.tipoClienteId}>{t.nombre}</option>
              ))}
            </select>
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
            <label>Notas</label>
            <textarea rows="2" value={form.notas}
              onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} />
          </label>
        </div>
      </Modal>

      {/* Modal detalle */}
      <Modal open={!!detalle} onClose={() => setDetalle(null)}
        title={detalle ? `${detalle.nombre ?? ""} ${detalle.apellidos ?? ""}`.trim() : "Cliente"}
        wide
        footer={<>
          <button className="btn" onClick={() => { const c = detalle; setDetalle(null); abrirEditar(c); }}>
            Editar
          </button>
        </>}>
        {detalle && (
          <div className="flex flex-col gap-5">
            {/* Info */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["ID", detalle.clienteId],
                ["Tipo", detalle.nombreTipoCliente ?? "—"],
                ["Cédula / RUC", detalle.cedulaRuc ?? "—"],
                ["Email", detalle.email ?? "—"],
                ["Teléfono", detalle.telefono ?? "—"],
                ["Estado", detalle.activo ? "Activo" : "Inactivo"],
                ["Descuento default", detalle.descuentoDefault != null ? `${detalle.descuentoDefault}%` : "—"],
                ["Registro", fmt.fecha(detalle.fechaRegistro)],
              ].map(([k, v]) => (
                <div key={k} className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-400 font-bold uppercase">{k}</div>
                  <div className="font-bold text-gray-900 mt-0.5">{v}</div>
                </div>
              ))}
            </div>

            {detalle.notas && (
              <div className="bg-gray-50 rounded-xl p-3 text-sm">
                <div className="text-xs text-gray-400 font-bold uppercase mb-1">Notas</div>
                <div className="text-gray-700">{detalle.notas}</div>
              </div>
            )}

            {/* Direcciones */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-gray-900 text-sm">Direcciones de entrega</h4>
                <button className="btn text-xs py-1"
                  onClick={() => {
                    setDirForm({ descripcion: "", direccionExacta: "", provincia: "", canton: "", distrito: "", codigoPostal: "", esDefault: false });
                    setShowDirModal(true);
                  }}>
                  + Agregar
                </button>
              </div>
              {loadingDir ? <Spinner text="Cargando direcciones…" /> :
                direcciones.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4 bg-gray-50 rounded-xl">
                    Sin direcciones registradas
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {direcciones.map(d => {
                      const id = d.direccionId ?? d.direccionClienteId;
                      return (
                        <div key={id} className="flex items-start justify-between bg-gray-50 rounded-xl p-3">
                          <div>
                            <div className="font-semibold text-sm text-gray-900">
                              {d.descripcion ?? d.alias ?? `Dirección #${id}`}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {d.direccionExacta ?? d.direccion ?? "—"}
                            </div>
                            {(d.provincia || d.canton || d.distrito) && (
                              <div className="text-xs text-gray-400 mt-0.5">
                                {[d.provincia, d.canton, d.distrito].filter(Boolean).join(", ")}
                              </div>
                            )}
                          </div>
                          <button className="btn-ghost text-red-500 hover:bg-red-50 text-xs"
                            onClick={() => eliminarDireccion(id)}>
                            Eliminar
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal agregar dirección */}
      <Modal open={showDirModal} onClose={() => setShowDirModal(false)} title="Agregar dirección"
        footer={<>
          <button className="btn" onClick={() => setShowDirModal(false)}>Cancelar</button>
          <button className="btn-primary" onClick={guardarDireccion} disabled={saving}>
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </>}>
        <div className="grid grid-cols-2 gap-4">
          <label className="field col-span-2">
            <label>Descripción / Alias</label>
            <input type="text" placeholder="Ej: Casa, Oficina..." value={dirForm.descripcion}
              onChange={e => setDirForm(f => ({ ...f, descripcion: e.target.value }))} />
          </label>
          <label className="field col-span-2">
            <label>Dirección exacta *</label>
            <textarea rows="2" value={dirForm.direccionExacta}
              onChange={e => setDirForm(f => ({ ...f, direccionExacta: e.target.value }))} />
          </label>
          <label className="field">
            <label>Provincia</label>
            <input type="text" value={dirForm.provincia}
              onChange={e => setDirForm(f => ({ ...f, provincia: e.target.value }))} />
          </label>
          <label className="field">
            <label>Cantón</label>
            <input type="text" value={dirForm.canton}
              onChange={e => setDirForm(f => ({ ...f, canton: e.target.value }))} />
          </label>
          <label className="field">
            <label>Distrito</label>
            <input type="text" value={dirForm.distrito}
              onChange={e => setDirForm(f => ({ ...f, distrito: e.target.value }))} />
          </label>
          <label className="field">
            <label>Código postal</label>
            <input type="text" value={dirForm.codigoPostal}
              onChange={e => setDirForm(f => ({ ...f, codigoPostal: e.target.value }))} />
          </label>
        </div>
      </Modal>
    </div>
  );
}
