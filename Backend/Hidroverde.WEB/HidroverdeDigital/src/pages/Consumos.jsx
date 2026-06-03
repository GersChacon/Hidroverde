import { useState, useEffect, useCallback } from "react";
import { api, fmt } from "../services/api";
import { usePaginacion } from "../hooks/usePaginacion";
import Modal from "../components/Modal";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import Paginacion from "../components/Paginacion";

export default function Consumos() {
  const [consumos, setConsumos]         = useState([]);
  const [tiposRecurso, setTiposRecurso] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filtros, setFiltros]           = useState({ cicloId: "", tipoRecursoId: "", desde: "", hasta: "" });

  const [showModal, setShowModal]   = useState(false);
  const [editId, setEditId]         = useState(null);
  const [form, setForm]             = useState({ cicloId: "", tipoRecursoId: "", cantidad: "", fechaConsumo: new Date().toISOString().slice(0,10), periodicidadCodigo: "UNICO", notas: "" });
  const [formEdit, setFormEdit]     = useState({ nuevaCantidad: "", nuevaFechaConsumo: "", notas: "", motivoCambio: "" });
  const [saving, setSaving]         = useState(false);

  const [modalHist, setModalHist]   = useState(null);
  const [historial, setHistorial]   = useState([]);
  const [loadingHist, setLoadingHist] = useState(false);

  const [modalReporte, setModalReporte] = useState(false);
  const [reporte, setReporte]           = useState([]);
  const [loadingRep, setLoadingRep]     = useState(false);

  // Puente de costos
  const [costoCiclo, setCostoCiclo]     = useState(null);
  const [modalCostos, setModalCostos]   = useState(false);
  const [costosEdit, setCostosEdit]     = useState({});
  const [savingCostos, setSavingCostos] = useState(false);

  const { paginados, pagina, totalPaginas, setPagina, total } = usePaginacion(consumos);

  const buildQs = useCallback(() => {
    const p = new URLSearchParams();
    if (filtros.cicloId)       p.set("cicloId", filtros.cicloId);
    if (filtros.tipoRecursoId) p.set("tipoRecursoId", filtros.tipoRecursoId);
    if (filtros.desde)         p.set("fechaDesde", filtros.desde);
    if (filtros.hasta)         p.set("fechaHasta", filtros.hasta);
    return p.toString();
  }, [filtros]);

  const cargar = useCallback(async () => {
    setLoading(true);
    setPagina(1);
    try {
      const qs = buildQs();
      const r = await api(`/api/consumos${qs ? "?" + qs : ""}`);
      setConsumos(Array.isArray(r.data) ? r.data : []);
    } catch { setConsumos([]); }

    // Puente de costos: si se filtra por ciclo, traemos su costo de producción.
    if (filtros.cicloId) {
      try {
        const cp = new URLSearchParams();
        if (filtros.desde) cp.set("fechaDesde", filtros.desde);
        if (filtros.hasta) cp.set("fechaHasta", filtros.hasta);
        const cqs = cp.toString();
        const rc = await api(`/api/consumos/costo-ciclo/${Number(filtros.cicloId)}${cqs ? "?" + cqs : ""}`);
        setCostoCiclo(rc.data);
      } catch { setCostoCiclo(null); }
    } else {
      setCostoCiclo(null);
    }
    setLoading(false);
  }, [buildQs, setPagina, filtros]);

  useEffect(() => { cargar(); }, [cargar]);
  useEffect(() => {
    api("/api/consumos/tipos-recurso").then(r => setTiposRecurso(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, []);

  function abrirNuevo() {
    setEditId(null);
    setForm({ cicloId: "", tipoRecursoId: "", cantidad: "", fechaConsumo: new Date().toISOString().slice(0,10), periodicidadCodigo: "UNICO", notas: "" });
    setShowModal(true);
  }
  function abrirEditar(c) {
    setEditId(c.consumoId);
    setFormEdit({ nuevaCantidad: c.cantidad ?? "", nuevaFechaConsumo: c.fechaConsumo?.slice(0,10) ?? "", notas: c.notas ?? "", motivoCambio: "" });
    setShowModal(true);
  }

  async function guardar() {
    setSaving(true);
    try {
      if (editId) {
        await api(`/api/consumos/${editId}`, { method: "PUT", body: { nuevaCantidad: Number(formEdit.nuevaCantidad), nuevaFechaConsumo: formEdit.nuevaFechaConsumo, notas: formEdit.notas || null, motivoCambio: formEdit.motivoCambio || null } });
      } else {
        await api("/api/consumos", { method: "POST", body: { cicloId: form.cicloId ? Number(form.cicloId) : null, tipoRecursoId: Number(form.tipoRecursoId), cantidad: Number(form.cantidad), fechaConsumo: form.fechaConsumo, periodicidadCodigo: form.periodicidadCodigo, notas: form.notas || null } });
      }
      setShowModal(false); cargar();
    } catch (err) { alert(err.message); }
    setSaving(false);
  }

  async function eliminar(id) {
    if (!confirm("¿Eliminar este consumo?")) return;
    try { await api(`/api/consumos/${id}`, { method: "DELETE" }); cargar(); }
    catch (err) { alert(err.message); }
  }

  async function abrirHistorial(c) {
    setModalHist(c); setHistorial([]); setLoadingHist(true);
    try { const r = await api(`/api/consumos/${c.consumoId}/historial`); setHistorial(Array.isArray(r.data) ? r.data : []); }
    catch { setHistorial([]); }
    setLoadingHist(false);
  }

  async function abrirReporte() {
    setModalReporte(true); setReporte([]); setLoadingRep(true);
    try { const qs = buildQs(); const r = await api(`/api/consumos/reporte-diario${qs ? "?" + qs : ""}`); setReporte(Array.isArray(r.data) ? r.data : []); }
    catch { setReporte([]); }
    setLoadingRep(false);
  }

  function descargar(tipo) {
    const qs = buildQs();
    window.open(`/api/consumos/reporte-diario/export/${tipo}${qs ? "?" + qs : ""}`, "_blank");
  }

  function abrirCostos() {
    const init = {};
    tiposRecurso.forEach(t => { init[t.tipoRecursoId] = t.costoUnitario ?? 0; });
    setCostosEdit(init);
    setModalCostos(true);
  }
  async function guardarCostos() {
    setSavingCostos(true);
    try {
      for (const t of tiposRecurso) {
        const val = Number(costosEdit[t.tipoRecursoId] ?? 0);
        if (val !== Number(t.costoUnitario ?? 0)) {
          await api(`/api/consumos/tipos-recurso/${t.tipoRecursoId}/costo`, { method: "PUT", body: { costoUnitario: val } });
        }
      }
      const r = await api("/api/consumos/tipos-recurso");
      setTiposRecurso(Array.isArray(r.data) ? r.data : []);
      setModalCostos(false);
      cargar();
    } catch (err) { alert(err.message); }
    setSavingCostos(false);
  }

  const periLabel = { UNICO: "Único", SEMANAL: "Semanal", MENSUAL: "Mensual" };

  return (
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Consumos</h1>
          <p className="page-subtitle">Registra consumos operativos: agua, nutrientes, electricidad u otros recursos.</p>
        </div>
        <div className="page-actions">
          <button className="btn-primary" onClick={abrirNuevo}>+ Nuevo consumo</button>
          <button className="btn" onClick={abrirCostos}>₡ Costos de recursos</button>
          <button className="btn" onClick={cargar}>↺ Refrescar</button>
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="filter-bar">
          <label className="field" style={{ minWidth: 130 }}>
            <label>Ciclo ID</label>
            <input type="number" placeholder="Opcional" value={filtros.cicloId} onChange={e => setFiltros(f => ({ ...f, cicloId: e.target.value }))} />
          </label>
          <label className="field" style={{ minWidth: 160 }}>
            <label>Tipo recurso</label>
            <select value={filtros.tipoRecursoId} onChange={e => setFiltros(f => ({ ...f, tipoRecursoId: e.target.value }))}>
              <option value="">Todos</option>
              {tiposRecurso.map(t => <option key={t.tipoRecursoId ?? t.id} value={t.tipoRecursoId ?? t.id}>{t.nombre}</option>)}
            </select>
          </label>
          <label className="field">
            <label>Desde</label>
            <input type="date" value={filtros.desde} onChange={e => setFiltros(f => ({ ...f, desde: e.target.value }))} />
          </label>
          <label className="field">
            <label>Hasta</label>
            <input type="date" value={filtros.hasta} onChange={e => setFiltros(f => ({ ...f, hasta: e.target.value }))} />
          </label>
          {/* Acciones de filtro alineadas al final */}
          <div className="filter-actions">
            <button className="btn-primary" onClick={cargar}>Aplicar</button>
            <button className="btn" onClick={() => setFiltros({ cicloId: "", tipoRecursoId: "", desde: "", hasta: "" })}>Limpiar</button>
          </div>
          {/* Exports separados visualmente */}
          <div className="flex items-center gap-2 w-full pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide mr-1">Exportar</span>
            <button className="btn" onClick={abrirReporte}>📊 Reporte diario</button>
            <button className="btn" onClick={() => descargar("csv")}>⬇ CSV</button>
            <button className="btn" onClick={() => descargar("excel")}>⬇ Excel</button>
          </div>
        </div>
      </div>

      {/* Puente de costos: costo de producción del ciclo filtrado */}
      {filtros.cicloId && costoCiclo && (
        <div className="card bg-green-50 border border-green-100">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                Costo de producción · Ciclo #{costoCiclo.cicloId}
              </div>
              <div className="text-3xl font-extrabold text-green-700 mt-1">{fmt.moneda(costoCiclo.costoTotal)}</div>
              <div className="text-xs text-gray-400">{costoCiclo.cantidadConsumos} consumo(s) considerados</div>
            </div>
            {costoCiclo.detalle?.length > 0 && (
              <table className="data-table" style={{ minWidth: 320 }}>
                <thead><tr><th>Recurso</th><th className="text-right">Cantidad</th><th className="text-right">Costo unit.</th><th className="text-right">Costo</th></tr></thead>
                <tbody>
                  {costoCiclo.detalle.map(d => (
                    <tr key={d.tipoRecursoId}>
                      <td className="font-semibold">{d.recursoNombre}</td>
                      <td className="text-right">{d.cantidad} <span className="text-gray-400 text-xs">{d.unidad}</span></td>
                      <td className="text-right">{fmt.moneda(d.costoUnitario)}</td>
                      <td className="text-right font-bold">{fmt.moneda(d.costo)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {costoCiclo.costoTotal === 0 && (
            <p className="text-xs text-amber-600 mt-3">
              El costo da ₡0 porque los recursos aún no tienen costo unitario asignado. Definílos en <strong>Costos de recursos</strong>.
            </p>
          )}
        </div>
      )}

      {/* Tabla */}
      <div className="card overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-gray-500">
            {loading ? "Cargando…" : `${total} registro${total !== 1 ? "s" : ""}`}
          </span>
        </div>
        {loading ? <Spinner /> : consumos.length === 0 ? (
          <EmptyState icon="💧" title="Sin consumos registrados" subtitle="Registrá un nuevo consumo para comenzar"
            action={<button className="btn-primary" onClick={abrirNuevo}>+ Nuevo consumo</button>} />
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr><th>Fecha</th><th>Recurso</th><th>Cantidad</th><th>Periodicidad</th><th>Ciclo</th><th>Responsable</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {paginados.map(c => (
                  <tr key={c.consumoId} className="animate-fade-in">
                    <td>{fmt.fechaHora(c.fechaConsumo)}</td>
                    <td className="font-semibold">{c.recursoNombre}</td>
                    <td className="font-bold">{c.cantidad} <span className="text-gray-400 font-normal text-xs">{c.unidad}</span></td>
                    <td><span className="tag badge-neutral">{periLabel[c.periodicidadCodigo] ?? c.periodicidadCodigo}</span></td>
                    <td>{c.cicloId ? <span className="tag badge-blue">#{c.cicloId}</span> : <span className="text-gray-300">—</span>}</td>
                    <td className="text-gray-500">{c.registradoPorNombre ?? "—"}</td>
                    <td>
                      <div className="flex gap-1">
                        <button className="btn-ghost" onClick={() => abrirEditar(c)}>Editar</button>
                        <button className="btn-ghost" onClick={() => abrirHistorial(c)}>Historial</button>
                        <button className="btn-ghost text-red-500 hover:bg-red-50" onClick={() => eliminar(c.consumoId)}>Eliminar</button>
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

      {/* Modal nuevo consumo */}
      <Modal open={showModal && !editId} onClose={() => setShowModal(false)} title="Nuevo consumo"
        footer={<><button className="btn" onClick={() => setShowModal(false)}>Cancelar</button><button className="btn-primary" onClick={guardar} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</button></>}>
        <div className="grid grid-cols-2 gap-4">
          <label className="field col-span-2"><label>Tipo de recurso *</label>
            <select value={form.tipoRecursoId} onChange={e => setForm(f => ({ ...f, tipoRecursoId: e.target.value }))}>
              <option value="">Seleccione</option>
              {tiposRecurso.map(t => <option key={t.tipoRecursoId ?? t.id} value={t.tipoRecursoId ?? t.id}>{t.nombre}{t.costoUnitario ? ` · ${fmt.moneda(t.costoUnitario)}/${t.unidad}` : ""}</option>)}
            </select>
          </label>
          <label className="field"><label>Cantidad *</label><input type="number" step="0.01" min="0.01" placeholder="Ej. 500" value={form.cantidad} onChange={e => setForm(f => ({ ...f, cantidad: e.target.value }))} /></label>
          <label className="field"><label>Fecha *</label><input type="date" value={form.fechaConsumo} onChange={e => setForm(f => ({ ...f, fechaConsumo: e.target.value }))} /></label>
          <label className="field col-span-2"><label>Periodicidad *</label>
            <select value={form.periodicidadCodigo} onChange={e => setForm(f => ({ ...f, periodicidadCodigo: e.target.value }))}>
              <option value="UNICO">Único</option><option value="SEMANAL">Semanal</option><option value="MENSUAL">Mensual</option>
            </select>
          </label>
          <label className="field"><label>Ciclo ID (opcional)</label><input type="number" placeholder="Opcional" value={form.cicloId} onChange={e => setForm(f => ({ ...f, cicloId: e.target.value }))} /></label>
          <label className="field"><label>Notas</label><textarea rows="3" placeholder="Opcional" value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} /></label>
        </div>
      </Modal>

      {/* Modal editar consumo */}
      <Modal open={showModal && !!editId} onClose={() => setShowModal(false)} title="Editar consumo"
        footer={<><button className="btn" onClick={() => setShowModal(false)}>Cancelar</button><button className="btn-primary" onClick={guardar} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</button></>}>
        <div className="flex flex-col gap-4">
          <label className="field"><label>Nueva cantidad *</label><input type="number" step="0.01" value={formEdit.nuevaCantidad} onChange={e => setFormEdit(f => ({ ...f, nuevaCantidad: e.target.value }))} /></label>
          <label className="field"><label>Nueva fecha *</label><input type="date" value={formEdit.nuevaFechaConsumo} onChange={e => setFormEdit(f => ({ ...f, nuevaFechaConsumo: e.target.value }))} /></label>
          <label className="field"><label>Notas</label><textarea rows="2" value={formEdit.notas} onChange={e => setFormEdit(f => ({ ...f, notas: e.target.value }))} /></label>
          <label className="field"><label>Motivo del cambio</label><input type="text" placeholder="Ej. Error de captura" value={formEdit.motivoCambio} onChange={e => setFormEdit(f => ({ ...f, motivoCambio: e.target.value }))} /></label>
        </div>
      </Modal>

      {/* Modal historial */}
      <Modal open={!!modalHist} onClose={() => setModalHist(null)} title="Historial de consumo">
        {loadingHist ? <Spinner /> : historial.length === 0 ? <EmptyState icon="📋" title="Sin historial" /> : (
          <table className="data-table">
            <thead><tr><th>Versión</th><th>Fecha</th><th>Cantidad</th><th>Notas</th><th>Motivo</th><th>Registro</th></tr></thead>
            <tbody>{historial.map(h => <tr key={h.consumoVersionId}><td>{h.versionNo}</td><td>{fmt.fechaHora(h.fechaConsumo)}</td><td className="font-bold">{h.cantidad}</td><td className="text-xs text-gray-400">{h.notas ?? "—"}</td><td className="text-xs text-gray-400">{h.motivoCambio ?? "—"}</td><td>{fmt.fechaHora(h.fechaRegistro)}</td></tr>)}</tbody>
          </table>
        )}
      </Modal>

      {/* Modal reporte */}
      <Modal open={modalReporte} onClose={() => setModalReporte(false)} title="Reporte diario de consumos">
        {loadingRep ? <Spinner /> : reporte.length === 0 ? <EmptyState icon="📊" title="Sin datos" subtitle="No hay consumos en el período seleccionado" /> : (
          <table className="data-table">
            <thead><tr><th>Fecha</th><th>Recurso</th><th className="text-right">Total</th><th>Unidad</th><th>Periodicidad</th></tr></thead>
            <tbody>{reporte.map((r, i) => <tr key={i}><td>{fmt.fecha(r.fecha)}</td><td className="font-semibold">{r.recursoNombre}</td><td className="text-right font-bold">{r.totalCantidad}</td><td>{r.unidad}</td><td>{r.periodicidadCodigo}</td></tr>)}</tbody>
          </table>
        )}
      </Modal>
      {/* Modal costos de recursos */}
      <Modal open={modalCostos} onClose={() => setModalCostos(false)} title="Costos de recursos"
        footer={<><button className="btn" onClick={() => setModalCostos(false)}>Cancelar</button><button className="btn-primary" onClick={guardarCostos} disabled={savingCostos}>{savingCostos ? "Guardando…" : "Guardar costos"}</button></>}>
        <p className="text-sm text-gray-500 mb-3">Definí el costo por unidad de cada recurso. Con esto se calcula el costo de producción de cada ciclo.</p>
        {tiposRecurso.length === 0 ? <EmptyState icon="₡" title="Sin recursos" /> : (
          <table className="data-table">
            <thead><tr><th>Recurso</th><th>Unidad</th><th className="text-right">Costo unitario (₡)</th></tr></thead>
            <tbody>
              {tiposRecurso.map(t => (
                <tr key={t.tipoRecursoId}>
                  <td className="font-semibold">{t.nombre}</td>
                  <td className="text-gray-400 text-xs">{t.unidad}</td>
                  <td className="text-right">
                    <input type="number" step="0.01" min="0"
                      className="w-28 px-2 py-1 rounded-lg border border-gray-200 text-sm text-right"
                      value={costosEdit[t.tipoRecursoId] ?? 0}
                      onChange={e => setCostosEdit(c => ({ ...c, [t.tipoRecursoId]: e.target.value }))} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Modal>

    </div>
  );
}
