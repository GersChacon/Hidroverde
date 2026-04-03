// AlertaActivaDto fields: alertaId, tipoAlerta, estado, fechaCreacion,
// mensaje, productoId, nombreProducto, snapshotDisponible, snapshotMinimo
// GET /api/Alertas/activas
// POST /api/Alertas/{alertaId}/aceptar

import { useState, useEffect, useCallback } from "react";
import { api, fmt } from "../services/api";
import { usePaginacion } from "../hooks/usePaginacion";
import Paginacion from "../components/Paginacion";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";

function getSeveridad(a) {
  if (a.snapshotMinimo <= 0) return "ok";
  const p = a.snapshotDisponible / a.snapshotMinimo;
  if (p <= 0.25) return "critica";
  if (p <= 0.60) return "advertencia";
  return "ok";
}

const SEV = {
  critica:     { label: "🔴 Crítica",    cls: "bg-red-100 text-red-700 border-red-200",       tag: "badge-critica" },
  advertencia: { label: "🟡 Advertencia",cls: "bg-yellow-100 text-yellow-700 border-yellow-200", tag: "badge-advertencia" },
  ok:          { label: "🟢 Monitoreo",  cls: "bg-green-100 text-green-700 border-green-200",  tag: "badge-ok" },
};

export default function Alertas() {
  const [alertas, setAlertas]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filtro, setFiltro]     = useState("todos");
  const [modal, setModal]       = useState(null);
  const [saving, setSaving]     = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api("/api/Alertas/activas");
      setAlertas(Array.isArray(r.data) ? r.data : []);
    } catch { setAlertas([]); }
    setLoading(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const filtradas = alertas.filter(a =>
    filtro === "todos" ? true : getSeveridad(a) === filtro
  );

  const conteo = {
    critica:     alertas.filter(a => getSeveridad(a) === "critica").length,
    advertencia: alertas.filter(a => getSeveridad(a) === "advertencia").length,
    ok:          alertas.filter(a => getSeveridad(a) === "ok").length,
  };

  async function aceptarAlerta() {
    if (!modal) return;
    setSaving(true);
    try {
      await api(`/api/Alertas/${modal.alertaId}/aceptar`, { method: "POST" });
      setModal(null);
      cargar();
    } catch (e) { alert(e.message); }
    setSaving(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="page-header">
        <div>
          <h1 className="page-title">Alertas</h1>
          <p className="page-subtitle">Notificaciones de stock bajo y eventos del sistema</p>
        </div>
        <button className="btn-primary" onClick={cargar}>↺ Refrescar</button>
      </div>

      {loading ? <Spinner /> : (
        <>
          {alertas.length > 0 && (
            <>
              <p className="text-sm text-gray-500 font-bold">{alertas.length} alerta(s) activa(s)</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { key: "critica",     icon: "🔴", label: "Críticas",      hint: "≤ 25% del mínimo",  count: conteo.critica },
                  { key: "advertencia", icon: "🟡", label: "Advertencias",  hint: "26%–60% del mínimo", count: conteo.advertencia },
                  { key: "ok",          icon: "🟢", label: "Monitoreo",     hint: "> 60% del mínimo",   count: conteo.ok },
                  { key: "todos",       icon: "🔔", label: "Total activas", hint: "Pendientes",          count: alertas.length },
                ].map(({ key, icon, label, hint, count }) => (
                  <div key={key} className={`card text-center cursor-pointer hover:shadow-md transition-all ${filtro === key ? "ring-2 ring-green-400" : ""}`}
                       onClick={() => setFiltro(key)}>
                    <div className="text-2xl">{icon}</div>
                    <div className="text-2xl font-black text-gray-900 mt-1">{count}</div>
                    <div className="text-xs font-bold text-gray-700">{label}</div>
                    <div className="text-xs text-gray-400">{hint}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 flex-wrap">
                {["todos","critica","advertencia","ok"].map(f => (
                  <button key={f} onClick={() => setFiltro(f)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ` +
                      (filtro === f ? "bg-green-100 border-green-300 text-green-800" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50")}>
                    {{ todos: "Todas", critica: "🔴 Críticas", advertencia: "🟡 Advertencias", ok: "🟢 Monitoreo" }[f]}
                  </button>
                ))}
              </div>
            </>
          )}

          {filtradas.length === 0 ? (
            <EmptyState icon="✅" title="No hay alertas activas" subtitle="El inventario está dentro de los límites configurados" />
          ) : (
            <div className="flex flex-col gap-3">
              {filtradas.map(a => {
                const sev = getSeveridad(a);
                const meta = SEV[sev];
                const pct = a.snapshotMinimo > 0 ? Math.round((a.snapshotDisponible / a.snapshotMinimo) * 100) : 100;
                return (
                  <div key={a.alertaId} className="card flex items-start gap-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border shrink-0 mt-0.5 ${meta.cls}`}>
                      {meta.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900">{a.nombreProducto ?? `Producto #${a.productoId}`}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{a.mensaje}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Disponible: <strong>{a.snapshotDisponible}</strong> / Mínimo: <strong>{a.snapshotMinimo}</strong> ({pct}%)
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                        <div className={`h-full rounded-full ${sev === "critica" ? "bg-red-400" : sev === "advertencia" ? "bg-yellow-400" : "bg-green-400"}`}
                             style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs text-gray-400 mb-2">{fmt.fechaHora(a.fechaCreacion)}</div>
                      <button className="btn text-xs py-1 px-2" onClick={() => setModal(a)}>✓ Revisar</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title="Aceptar alerta"
        footer={<>
          <button className="btn" onClick={() => setModal(null)}>Cancelar</button>
          <button className="btn-primary" onClick={aceptarAlerta} disabled={saving}>
            {saving ? "Procesando…" : "✔ Confirmar revisión"}
          </button>
        </>}>
        {modal && (
          <div className="flex flex-col gap-3 text-sm">
            <p className="text-gray-600">{modal.mensaje}</p>
            {[
              ["Producto",   modal.nombreProducto],
              ["Disponible", modal.snapshotDisponible],
              ["Mínimo",     modal.snapshotMinimo],
              ["Severidad",  SEV[getSeveridad(modal)].label],
              ["Fecha",      fmt.fechaHora(modal.fechaCreacion)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-gray-400">{k}:</span>
                <strong>{v}</strong>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
