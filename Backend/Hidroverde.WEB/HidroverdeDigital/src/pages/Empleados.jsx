import { useState, useEffect, useCallback } from "react";
import { api, fmt } from "../services/api";
import { usePaginacion } from "../hooks/usePaginacion";
import Modal from "../components/Modal";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import Paginacion from "../components/Paginacion";

const ESTADOS = ["ACTIVO", "INACTIVO", "VACACIONES", "LICENCIA"];
const ESTADO_MAP = {
  ACTIVO:     { variant: "activo",   cls: "badge-ok" },
  INACTIVO:   { variant: "inactivo", cls: "badge-neutral" },
  VACACIONES: { variant: "ok",       cls: "badge-blue" },
  LICENCIA:   { variant: "ok",       cls: "badge-advertencia" },
};

export default function Empleados() {
  const [empleados, setEmpleados] = useState([]);
  const [roles, setRoles]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [busqueda, setBusqueda]   = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  const [showModal, setShowModal]       = useState(false);
  const [editId, setEditId]             = useState(null);
  const [saving, setSaving]             = useState(false);
  const [detalle, setDetalle]           = useState(null);
  const [modalEstado, setModalEstado]   = useState(null);
  const [nuevoEstado, setNuevoEstado]   = useState("");

  const initForm = () => ({
    rolId: "", cedula: "", nombre: "", apellidos: "",
    telefono: "", email: "", fechaNacimiento: "", fechaContratacion: new Date().toISOString().slice(0,10),
    usuarioSistema: "", estado: "ACTIVO", activo: true,
  });
  const [form, setForm] = useState(initForm());

  const filtrados = empleados.filter(e => {
    if (busqueda) {
      const q = busqueda.toLowerCase();
      const match = e.nombre?.toLowerCase().includes(q) ||
        e.apellidos?.toLowerCase().includes(q) ||
        e.cedula?.toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filtroEstado && e.estado !== filtroEstado) return false;
    return true;
  });

  const { paginados, pagina, totalPaginas, setPagina } = usePaginacion(filtrados);

  const cargar = useCallback(async () => {
    setLoading(true); setPagina(1);
    try {
      const r = await api("/api/Empleado");
      setEmpleados(Array.isArray(r.data) ? r.data : []);
    } catch { setEmpleados([]); }
    setLoading(false);
  }, [setPagina]);

  useEffect(() => { cargar(); }, [cargar]);
  useEffect(() => {
    api("/api/Rol").then(r => setRoles(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, []);

  function abrirNuevo() {
    setEditId(null); setForm(initForm()); setShowModal(true);
  }
  function abrirEditar(e) {
    setEditId(e.empleadoId);
    setForm({
      rolId: e.rolId ?? "", cedula: e.cedula ?? "", nombre: e.nombre ?? "",
      apellidos: e.apellidos ?? "", telefono: e.telefono ?? "", email: e.email ?? "",
      fechaNacimiento: e.fechaNacimiento?.slice(0,10) ?? "",
      fechaContratacion: e.fechaContratacion?.slice(0,10) ?? "",
      usuarioSistema: e.usuarioSistema ?? "", estado: e.estado ?? "ACTIVO",
      activo: e.activo ?? true,
    });
    setShowModal(true);
  }

  async function guardar() {
    if (!form.cedula || !form.email || !form.nombre) {
      alert("Cédula, nombre y email son requeridos."); return;
    }
    setSaving(true);
    try {
      const body = {
        ...form,
        rolId: Number(form.rolId) || 1,
        fechaNacimiento: form.fechaNacimiento || null,
      };
      if (editId) await api(`/api/Empleado/${editId}`, { method: "PUT", body });
      else await api("/api/Empleado", { method: "POST", body });
      setShowModal(false); cargar();
    } catch (err) { alert(err.message); }
    setSaving(false);
  }

  async function cambiarEstado() {
    if (!modalEstado || !nuevoEstado) return;
    setSaving(true);
    try {
      await api(`/api/Empleado/${modalEstado.empleadoId}/estado`, {
        method: "PATCH",
        body: { estado: nuevoEstado },
      });
      setModalEstado(null); cargar();
    } catch (err) { alert(err.message); }
    setSaving(false);
  }

  // KPIs
  const kpis = {
    total: empleados.length,
    activos: empleados.filter(e => e.estado === "ACTIVO").length,
    vacaciones: empleados.filter(e => e.estado === "VACACIONES").length,
    licencia: empleados.filter(e => e.estado === "LICENCIA").length,
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Empleados</h1>
          <p className="page-subtitle">Gestión de personal y roles</p>
        </div>
        <div className="page-actions">
          <button className="btn-primary" onClick={abrirNuevo}>+ Nuevo empleado</button>
          <button className="btn" onClick={cargar}>↺ Refrescar</button>
        </div>
      </div>

      {/* KPIs */}
      {!loading && empleados.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total",       val: kpis.total,      cls: "bg-gray-50 text-gray-700" },
            { label: "Activos",     val: kpis.activos,    cls: "bg-green-50 text-green-800" },
            { label: "Vacaciones",  val: kpis.vacaciones, cls: "bg-blue-50 text-blue-800" },
            { label: "Licencia",    val: kpis.licencia,   cls: "bg-yellow-50 text-yellow-800" },
          ].map(({ label, val, cls }) => (
            <div key={label} className={`card ${cls} text-center py-3`}>
              <div className="text-xs font-bold text-gray-500 uppercase">{label}</div>
              <div className="text-2xl font-black mt-1">{val}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filtros */}
      <div className="card">
        <div className="filter-bar">
          <label className="field" style={{ minWidth: 240 }}>
            <label>Buscar</label>
            <input type="search" placeholder="Nombre, cédula, email..."
              value={busqueda}
              onChange={e => { setBusqueda(e.target.value); setPagina(1); }} />
          </label>
          <label className="field" style={{ minWidth: 160 }}>
            <label>Estado</label>
            <select value={filtroEstado}
              onChange={e => { setFiltroEstado(e.target.value); setPagina(1); }}>
              <option value="">Todos</option>
              {ESTADOS.map(est => <option key={est} value={est}>{est}</option>)}
            </select>
          </label>
          <div className="filter-actions">
            <button className="btn" onClick={() => { setBusqueda(""); setFiltroEstado(""); setPagina(1); }}>
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="card overflow-x-auto">
        {loading ? <Spinner /> : filtrados.length === 0 ? (
          <EmptyState icon="🧑‍💼" title="Sin empleados" subtitle="Registrá un empleado para comenzar"
            action={<button className="btn-primary" onClick={abrirNuevo}>+ Nuevo empleado</button>} />
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th><th>Nombre</th><th>Cédula</th>
                  <th>Email</th><th>Rol</th><th>Estado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginados.map(e => (
                  <tr key={e.empleadoId}>
                    <td className="text-gray-400 text-xs font-mono">{e.empleadoId}</td>
                    <td className="font-semibold">{`${e.nombre ?? ""} ${e.apellidos ?? ""}`.trim()}</td>
                    <td className="text-sm font-mono text-gray-500">{e.cedula ?? "—"}</td>
                    <td className="text-sm">{e.email ?? "—"}</td>
                    <td className="text-sm text-gray-500">{e.nombreRol ?? "—"}</td>
                    <td>
                      <span className={`tag ${ESTADO_MAP[e.estado]?.cls ?? "badge-neutral"}`}>
                        {e.estado}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button className="btn-ghost" onClick={() => setDetalle(e)}>Ver</button>
                        <button className="btn-ghost" onClick={() => abrirEditar(e)}>Editar</button>
                        <button className="btn-ghost" onClick={() => { setModalEstado(e); setNuevoEstado(e.estado); }}>
                          Estado
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

      {/* Modal nuevo/editar */}
      <Modal open={showModal} onClose={() => setShowModal(false)}
        title={editId ? "Editar empleado" : "Nuevo empleado"}
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
            <label>Cédula *</label>
            <input type="text" value={form.cedula}
              onChange={e => setForm(f => ({ ...f, cedula: e.target.value }))} />
          </label>
          <label className="field">
            <label>Email *</label>
            <input type="email" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </label>
          <label className="field">
            <label>Teléfono</label>
            <input type="text" value={form.telefono}
              onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} />
          </label>
          <label className="field">
            <label>Rol</label>
            <select value={form.rolId}
              onChange={e => setForm(f => ({ ...f, rolId: e.target.value }))}>
              <option value="">Seleccione</option>
              {roles.map(r => <option key={r.rolId} value={r.rolId}>{r.nombre}</option>)}
            </select>
          </label>
          <label className="field">
            <label>Fecha nacimiento</label>
            <input type="date" value={form.fechaNacimiento}
              onChange={e => setForm(f => ({ ...f, fechaNacimiento: e.target.value }))} />
          </label>
          <label className="field">
            <label>Fecha contratación</label>
            <input type="date" value={form.fechaContratacion}
              onChange={e => setForm(f => ({ ...f, fechaContratacion: e.target.value }))} />
          </label>
          <label className="field">
            <label>Estado</label>
            <select value={form.estado}
              onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}>
              {ESTADOS.map(est => <option key={est} value={est}>{est}</option>)}
            </select>
          </label>
          <label className="field">
            <label>Usuario sistema</label>
            <input type="text" value={form.usuarioSistema}
              onChange={e => setForm(f => ({ ...f, usuarioSistema: e.target.value }))}
              placeholder="Opcional" />
          </label>
        </div>
      </Modal>

      {/* Modal detalle */}
      <Modal open={!!detalle} onClose={() => setDetalle(null)}
        title={detalle ? `${detalle.nombre ?? ""} ${detalle.apellidos ?? ""}`.trim() : "Empleado"}
        footer={<>
          <button className="btn" onClick={() => { const e = detalle; setDetalle(null); abrirEditar(e); }}>Editar</button>
        </>}>
        {detalle && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ["ID", detalle.empleadoId],
              ["Cédula", detalle.cedula ?? "—"],
              ["Email", detalle.email ?? "—"],
              ["Teléfono", detalle.telefono ?? "—"],
              ["Rol", detalle.nombreRol ?? "—"],
              ["Estado", detalle.estado ?? "—"],
              ["Nacimiento", fmt.fecha(detalle.fechaNacimiento)],
              ["Contratación", fmt.fecha(detalle.fechaContratacion)],
              ["Usuario", detalle.usuarioSistema ?? "—"],
              ["Creación", fmt.fechaHora(detalle.fechaCreacion)],
            ].map(([k, v]) => (
              <div key={k} className="bg-gray-50 rounded-xl p-3">
                <div className="text-xs text-gray-400 font-bold uppercase">{k}</div>
                <div className="font-bold text-gray-900 mt-0.5">{v}</div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Modal cambiar estado */}
      <Modal open={!!modalEstado} onClose={() => setModalEstado(null)} title="Cambiar estado"
        footer={<>
          <button className="btn" onClick={() => setModalEstado(null)}>Cancelar</button>
          <button className="btn-primary" onClick={cambiarEstado} disabled={saving}>
            {saving ? "Procesando…" : "Confirmar"}
          </button>
        </>}>
        {modalEstado && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-600">
              Empleado: <strong>{`${modalEstado.nombre} ${modalEstado.apellidos ?? ""}`.trim()}</strong>
            </p>
            <p className="text-sm text-gray-500">
              Estado actual: <span className={`tag ${ESTADO_MAP[modalEstado.estado]?.cls ?? "badge-neutral"}`}>{modalEstado.estado}</span>
            </p>
            <label className="field">
              <label>Nuevo estado</label>
              <select value={nuevoEstado} onChange={e => setNuevoEstado(e.target.value)}>
                {ESTADOS.map(est => <option key={est} value={est}>{est}</option>)}
              </select>
            </label>
          </div>
        )}
      </Modal>
    </div>
  );
}
