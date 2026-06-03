import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import { usePaginacion } from "../hooks/usePaginacion";
import Modal from "../components/Modal";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import Paginacion from "../components/Paginacion";

const initForm = () => ({
  cicloId: "",
  phMedido: "", ecMedido: "",
  temperaturaAgua: "", temperaturaAmbiente: "",
  humedadAmbiente: "", alturaPromedioPlantas: "",
  observaciones: "",
});

const num = (v) => (v === "" || v === null || v === undefined ? null : Number(v));
const showNum = (v, suf = "") => (v === null || v === undefined ? "—" : `${v}${suf}`);

// Promedio de un campo sobre los valores no nulos.
function promedio(items, campo) {
  const vals = items.map(i => i[campo]).filter(v => v !== null && v !== undefined);
  if (!vals.length) return null;
  return Math.round((vals.reduce((s, v) => s + Number(v), 0) / vals.length) * 100) / 100;
}

export default function Monitoreos() {
  const [monitoreos, setMonitoreos] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filtros, setFiltros]       = useState({ cicloId: "", desde: "", hasta: "" });

  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(initForm());
  const [saving, setSaving]       = useState(false);

  const { paginados, pagina, totalPaginas, setPagina, total } = usePaginacion(monitoreos);

  const buildQs = useCallback(() => {
    const p = new URLSearchParams();
    if (filtros.cicloId) p.set("cicloId", Number(filtros.cicloId));
    if (filtros.desde)   p.set("fechaDesde", filtros.desde);
    if (filtros.hasta)   p.set("fechaHasta", filtros.hasta);
    return p.toString();
  }, [filtros]);

  const cargar = useCallback(async () => {
    setLoading(true);
    setPagina(1);
    try {
      const qs = buildQs();
      const r = await api(`/api/monitoreos${qs ? "?" + qs : ""}`);
      setMonitoreos(Array.isArray(r.data) ? r.data : []);
    } catch { setMonitoreos([]); }
    setLoading(false);
  }, [buildQs, setPagina]);

  useEffect(() => { cargar(); }, [cargar]);

  function abrirNuevo() {
    setForm(initForm());
    setShowModal(true);
  }

  async function guardar() {
    if (!form.cicloId) { alert("Indicá el ciclo."); return; }
    setSaving(true);
    try {
      await api("/api/monitoreos", {
        method: "POST",
        body: {
          cicloId: Number(form.cicloId),
          phMedido: num(form.phMedido),
          ecMedido: num(form.ecMedido),
          temperaturaAgua: num(form.temperaturaAgua),
          temperaturaAmbiente: num(form.temperaturaAmbiente),
          humedadAmbiente: num(form.humedadAmbiente),
          alturaPromedioPlantas: num(form.alturaPromedioPlantas),
          observaciones: form.observaciones || null,
        },
      });
      setShowModal(false);
      cargar();
    } catch (err) { alert(err.message); }
    setSaving(false);
  }

  const verPromedios = filtros.cicloId && monitoreos.length > 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Monitoreo ambiental</h2>
          <p className="text-gray-400 text-sm">Lecturas de pH, EC, temperatura, humedad y altura por ciclo</p>
        </div>
        <div className="page-actions">
          <button className="btn-primary" onClick={abrirNuevo}>+ Nuevo monitoreo</button>
          <button className="btn" onClick={cargar}>↺ Refrescar</button>
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="field">
            <label>Ciclo ID</label>
            <input type="number" min="1" placeholder="Todos" value={filtros.cicloId}
              onChange={e => setFiltros(f => ({ ...f, cicloId: e.target.value }))} />
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
        <div className="flex justify-end mt-3">
          <button className="btn-primary" onClick={cargar}>Aplicar filtros</button>
        </div>
      </div>

      {/* Promedios del ciclo */}
      {verPromedios && (
        <div className="card bg-green-50 border border-green-100">
          <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">
            Promedios · Ciclo #{Number(filtros.cicloId)} · {monitoreos.length} lectura(s)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
            {[
              ["pH", promedio(monitoreos, "phMedido"), ""],
              ["EC", promedio(monitoreos, "ecMedido"), " mS"],
              ["T° agua", promedio(monitoreos, "temperaturaAgua"), " °C"],
              ["T° amb.", promedio(monitoreos, "temperaturaAmbiente"), " °C"],
              ["Humedad", promedio(monitoreos, "humedadAmbiente"), " %"],
              ["Altura", promedio(monitoreos, "alturaPromedioPlantas"), " cm"],
            ].map(([etq, val, suf]) => (
              <div key={etq} className="bg-white rounded-xl py-2">
                <div className="text-xs text-gray-400">{etq}</div>
                <div className="text-lg font-bold text-green-700">{showNum(val, suf)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="card">
        {loading ? <Spinner /> : monitoreos.length === 0 ? (
          <EmptyState icon="🌡️" title="Sin monitoreos" subtitle="Registrá la primera lectura ambiental." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fecha</th><th>Ciclo</th><th>Responsable</th>
                    <th className="text-right">pH</th><th className="text-right">EC</th>
                    <th className="text-right">T° agua</th><th className="text-right">T° amb.</th>
                    <th className="text-right">Humedad</th><th className="text-right">Altura</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginados.map(m => (
                    <tr key={m.monitoreoId}>
                      <td className="whitespace-nowrap">{m.fechaRegistro?.slice(0, 16).replace("T", " ")}</td>
                      <td>#{m.cicloId}</td>
                      <td className="text-gray-500">{m.responsableNombre ?? "—"}</td>
                      <td className="text-right">{showNum(m.phMedido)}</td>
                      <td className="text-right">{showNum(m.ecMedido)}</td>
                      <td className="text-right">{showNum(m.temperaturaAgua, "°")}</td>
                      <td className="text-right">{showNum(m.temperaturaAmbiente, "°")}</td>
                      <td className="text-right">{showNum(m.humedadAmbiente, "%")}</td>
                      <td className="text-right">{showNum(m.alturaPromedioPlantas, " cm")}</td>
                      <td className="text-gray-500 max-w-xs truncate">{m.observaciones ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-400">{total} registro(s)</span>
              <Paginacion pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} />
            </div>
          </>
        )}
      </div>

      {/* Modal nuevo monitoreo */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nuevo monitoreo"
        footer={
          <>
            <button className="btn" onClick={() => setShowModal(false)}>Cancelar</button>
            <button className="btn-primary" onClick={guardar} disabled={saving}>
              {saving ? "Guardando…" : "Guardar"}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <label className="field">
            <label>Ciclo ID *</label>
            <input type="number" min="1" value={form.cicloId}
              onChange={e => setForm(f => ({ ...f, cicloId: e.target.value }))} />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="field">
              <label>pH (0–14)</label>
              <input type="number" step="0.1" min="0" max="14" value={form.phMedido}
                onChange={e => setForm(f => ({ ...f, phMedido: e.target.value }))} />
            </label>
            <label className="field">
              <label>EC (mS/cm)</label>
              <input type="number" step="0.01" min="0" value={form.ecMedido}
                onChange={e => setForm(f => ({ ...f, ecMedido: e.target.value }))} />
            </label>
            <label className="field">
              <label>Temp. agua (°C)</label>
              <input type="number" step="0.01" value={form.temperaturaAgua}
                onChange={e => setForm(f => ({ ...f, temperaturaAgua: e.target.value }))} />
            </label>
            <label className="field">
              <label>Temp. ambiente (°C)</label>
              <input type="number" step="0.01" value={form.temperaturaAmbiente}
                onChange={e => setForm(f => ({ ...f, temperaturaAmbiente: e.target.value }))} />
            </label>
            <label className="field">
              <label>Humedad (%)</label>
              <input type="number" step="0.01" min="0" max="100" value={form.humedadAmbiente}
                onChange={e => setForm(f => ({ ...f, humedadAmbiente: e.target.value }))} />
            </label>
            <label className="field">
              <label>Altura plantas (cm)</label>
              <input type="number" step="0.01" min="0" value={form.alturaPromedioPlantas}
                onChange={e => setForm(f => ({ ...f, alturaPromedioPlantas: e.target.value }))} />
            </label>
          </div>
          <label className="field">
            <label>Observaciones</label>
            <textarea rows="2" value={form.observaciones}
              onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))} />
          </label>
          <p className="text-xs text-gray-400">Los campos de medición son opcionales: registrá solo lo que mediste.</p>
        </div>
      </Modal>
    </div>
  );
}
