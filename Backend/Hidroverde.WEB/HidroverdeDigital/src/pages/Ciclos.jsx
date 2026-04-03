// Ciclos — lógica completa con:
// - Autocomplete de producto con búsqueda en tiempo real
// - Variedad autopoblada al seleccionar producto
// - Matriz visual de torres con colores por disponibilidad
// - Validación de fechas (cosecha >= siembra)
// - Cosechar con confirmación si fecha no cumplida

import { useState, useEffect, useCallback, useRef } from "react";
import { api, fmt } from "../services/api";
import { usePaginacion } from "../hooks/usePaginacion";
import Modal from "../components/Modal";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import Paginacion from "../components/Paginacion";

// ── Colores de torres ─────────────────────────────────────
function getTorreEstado(t) {
  const cap  = Number(t.capacidadMaximaPlantas ?? 0);
  const disp = Number(t.huecosDisponibles ?? null);
  if (isNaN(disp) || t.huecosDisponibles == null) return "libre";
  if (disp <= 0)   return "llena";
  if (disp < cap)  return "parcial";
  return "libre";
}

const TORRE_STYLES = {
  libre:   "bg-white border-gray-200 hover:border-green-400 hover:bg-green-50 cursor-pointer",
  parcial: "bg-yellow-50 border-yellow-300 hover:border-yellow-500 cursor-pointer",
  llena:   "bg-red-50 border-red-200 text-red-400 cursor-not-allowed opacity-60",
  selected:"bg-green-100 border-green-500 ring-2 ring-green-400 cursor-pointer",
};

// ── Extraer número de código de torre para ordenar ────────
function extraerNum(codigo) {
  const m = String(codigo ?? "").match(/(\d+)$/);
  return m ? parseInt(m[1], 10) : 0;
}

// ── Componente: Matriz de torres ──────────────────────────
function TorresGrid({ torres, torreSeleccionada, onSelect }) {
  if (!torres.length) return (
    <p className="text-xs text-gray-400 py-4">No se encontraron torres.</p>
  );

  // Agrupar por fila
  const filas = {};
  torres.forEach(t => {
    const fila = String(t.fila ?? "").toUpperCase();
    if (!filas[fila]) filas[fila] = [];
    filas[fila].push(t);
  });

  const ordenFilas = Object.keys(filas).sort();

  return (
    <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
      {/* Leyenda */}
      <div className="flex gap-4 text-xs text-gray-500 pb-1 border-b border-gray-100">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-white border border-gray-300 inline-block" />Libre</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-yellow-100 border border-yellow-300 inline-block" />Parcial</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100 border border-red-200 inline-block" />Llena</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-100 border-2 border-green-500 inline-block" />Seleccionada</span>
      </div>
      {ordenFilas.map(fila => (
        <div key={fila} className="flex items-start gap-2">
          {/* Label de fila */}
          <span className="text-xs font-bold text-gray-400 w-4 pt-3 shrink-0">{fila}</span>
          {/* Celdas */}
          <div className="flex flex-wrap gap-1.5">
            {filas[fila]
              .slice()
              .sort((a, b) => extraerNum(a.codigoTorre) - extraerNum(b.codigoTorre))
              .map(t => {
                const estado = getTorreEstado(t);
                const isSelected = torreSeleccionada === t.torreId;
                const style = isSelected ? TORRE_STYLES.selected : TORRE_STYLES[estado];
                const codigo = String(t.codigoTorre ?? "").replace(/^TORRE-/i, "");
                const disp = t.huecosDisponibles;

                return (
                  <button
                    key={t.torreId}
                    type="button"
                    disabled={estado === "llena"}
                    onClick={() => estado !== "llena" && onSelect(t.torreId)}
                    className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl border text-xs font-bold transition-all duration-100 ${style}`}
                    title={`${t.codigoTorre} — ${disp != null ? disp + " disponibles" : "—"}`}
                  >
                    <span className="font-black text-sm leading-none">{codigo}</span>
                    <span className="text-[10px] font-normal text-gray-500 mt-0.5 leading-tight text-center">
                      {disp != null ? `${disp} disp.` : "—"}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Componente: Autocomplete de producto ──────────────────
function ProductoAutocomplete({ productos, onSelect, value, onChange }) {
  const [open, setOpen]     = useState(false);
  const [query, setQuery]   = useState(value ?? "");
  const ref                 = useRef(null);

  useEffect(() => { setQuery(value ?? ""); }, [value]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtrados = query.length >= 1
    ? productos.filter(p => {
        const q = query.toLowerCase();
        return (
          p.nombreProducto?.toLowerCase().includes(q) ||
          p.codigo?.toLowerCase().includes(q) ||
          p.nombreVariedad?.toLowerCase().includes(q)
        );
      }).slice(0, 12)
    : [];

  function handleInput(e) {
    setQuery(e.target.value);
    onChange(null); // invalida selección previa
    setOpen(true);
  }

  function seleccionar(p) {
    setQuery(`${p.codigo ? p.codigo + " — " : ""}${p.nombreProducto}`);
    onSelect(p);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white
                   focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-300"
        placeholder="Escribí el nombre del producto..."
        value={query}
        onChange={handleInput}
        onFocus={() => query.length >= 1 && setOpen(true)}
        autoComplete="off"
      />
      {open && filtrados.length > 0 && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-gray-200
                        rounded-xl shadow-lg max-h-52 overflow-y-auto animate-fade-in">
          {filtrados.map(p => (
            <button
              key={p.productoId}
              type="button"
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-green-50
                         border-b border-gray-50 last:border-0 transition-colors"
              onMouseDown={e => { e.preventDefault(); seleccionar(p); }}
            >
              <span className="font-semibold text-gray-900">
                {p.codigo ? <span className="text-green-700 mr-1">{p.codigo}</span> : null}
                {p.nombreProducto}
              </span>
              {p.nombreVariedad && (
                <span className="text-gray-400 text-xs ml-2">— {p.nombreVariedad}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Página principal ──────────────────────────────────────
export default function Ciclos() {
  const [ciclos, setCiclos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Datos para el modal
  const [torres, setTorres]   = useState([]);
  const [productos, setProductos] = useState([]);

  // Estado del formulario
  const [prodSeleccionado, setProdSeleccionado] = useState(null);
  const [queryProducto, setQueryProducto]       = useState("");
  const [torreId, setTorreId]                   = useState(null);
  const [fechaSiembra, setFechaSiembra]         = useState(new Date().toISOString().slice(0, 10));
  const [fechaCosecha, setFechaCosecha]         = useState("");
  const [cantidadPlantas, setCantidadPlantas]   = useState("");
  const [loteSemilla, setLoteSemilla]           = useState("");
  const [notas, setNotas]                       = useState("");
  const [saving, setSaving]                     = useState(false);
  const [loadingTorres, setLoadingTorres]       = useState(false);

  const filtrados = ciclos.filter(c =>
    !busqueda ||
    c.productoCodigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.productoNombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    String(c.cicloId).includes(busqueda)
  );

  const { paginados, pagina, totalPaginas, setPagina } = usePaginacion(filtrados);

  const cargar = useCallback(async () => {
    setLoading(true);
    setPagina(1);
    try {
      const r = await api("/api/ciclos/activos");
      setCiclos(Array.isArray(r.data) ? r.data : []);
    } catch { setCiclos([]); }
    setLoading(false);
  }, [setPagina]);

  useEffect(() => { cargar(); }, [cargar]);

  async function abrirModal() {
    resetForm();
    setShowModal(true);
    setLoadingTorres(true);
    try {
      const [tRes, pRes] = await Promise.all([
        api("/api/torres"),
        api("/api/Producto"),
      ]);
      // El API devuelve todos los campos en camelCase — no filtrar por activo
      // para no perder torres válidas por diferencia de casing
      const torresData = Array.isArray(tRes.data) ? tRes.data : [];
      setTorres(torresData);
      setProductos(Array.isArray(pRes.data) ? pRes.data.filter(p => p.activo) : []);
    } catch (err) {
      console.error("Error cargando datos del modal:", err);
    } finally {
      setLoadingTorres(false);
    }
  }

  function resetForm() {
    setProdSeleccionado(null);
    setQueryProducto("");
    setTorreId(null);
    setFechaSiembra(new Date().toISOString().slice(0, 10));
    setFechaCosecha("");
    setCantidadPlantas("");
    setLoteSemilla("");
    setNotas("");
  }

  function onFechaSiembraChange(val) {
    setFechaSiembra(val);
    // Si cosecha < siembra, corregir
    if (fechaCosecha && fechaCosecha < val) setFechaCosecha(val);
  }

  function onFechaCosechaChange(val) {
    if (val && fechaSiembra && val < fechaSiembra) {
      alert("La fecha de cosecha estimada no puede ser menor a la fecha de siembra.");
      setFechaCosecha(fechaSiembra);
      return;
    }
    setFechaCosecha(val);
  }

  async function guardar(e) {
    e.preventDefault();
    if (!prodSeleccionado) { alert("Seleccioná un producto de la lista."); return; }
    if (!torreId)          { alert("Seleccioná una torre en la matriz."); return; }
    if (!fechaSiembra || !fechaCosecha) { alert("Las fechas son requeridas."); return; }
    if (!cantidadPlantas || Number(cantidadPlantas) <= 0) { alert("La cantidad de plantas debe ser mayor a 0."); return; }

    setSaving(true);
    try {
      await api("/api/ciclos/siembra", {
        method: "POST",
        body: {
          productoId:           prodSeleccionado.productoId,
          variedadId:           prodSeleccionado.variedadId,
          torreId:              torreId,
          estadoCicloCodigo:    "SIEMBRA",
          fechaSiembra:         fechaSiembra,
          fechaCosechaEstimada: fechaCosecha,
          cantidadPlantas:      Number(cantidadPlantas),
          loteSemilla:          loteSemilla || null,
          notas:                notas || null,
        },
      });
      setShowModal(false);
      cargar();
    } catch (err) { alert(err.message); }
    setSaving(false);
  }

  async function cancelar(cicloId) {
    const motivo = prompt("Motivo de cancelación (opcional):", "Creado por error");
    if (motivo === null) return;
    if (!confirm("¿Seguro que deseas cancelar este ciclo?")) return;
    try {
      await api(`/api/ciclos/${cicloId}/cancelar`, {
        method: "POST",
        body: { motivo: motivo.trim() || null },
      });
      cargar();
    } catch (err) { alert(err.message); }
  }

  async function cosechar(ciclo) {
    // Validar fecha estimada
    if (ciclo.fechaCosechaEstimada) {
      const hoy = new Date(); hoy.setHours(0,0,0,0);
      const est = new Date(ciclo.fechaCosechaEstimada); est.setHours(0,0,0,0);
      if (hoy < est) {
        const ok = confirm("Esta cosecha aún no está lista (fecha estimada no cumplida). ¿Querés cosechar de todas formas?");
        if (!ok) return;
      }
    }
    if (!confirm("¿Desea cosechar este ciclo?")) return;
    try {
      const r = await api(`/api/ciclos/${ciclo.cicloId}/cosecha`, {
        method: "POST",
        body: {
          ubicacionId:          1,
          estadoCalidadCodigo:  "OPTIMO",
          motivo:               "Cosecha desde UI",
        },
      });
      const lote = r.data?.loteGenerado ?? r.data?.lote ?? "";
      alert(`Cosecha exitosa.${lote ? "\nLote: " + lote : ""}`);
      cargar();
    } catch (err) { alert(err.message); }
  }

  const pct = (c) => {
    if (!c.fechaSiembra || !c.fechaCosechaEstimada) return 0;
    const inicio = new Date(c.fechaSiembra);
    const fin    = new Date(c.fechaCosechaEstimada);
    const hoy    = new Date();
    const total  = fin - inicio;
    if (total <= 0) return 100;
    return Math.min(100, Math.max(0, Math.round(((hoy - inicio) / total) * 100)));
  };

  const torreSeleccionada = torres.find(t => t.torreId === torreId);

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Ciclos Activos</h1>
          <p className="page-subtitle">Gestiona los ciclos de cultivo en curso</p>
        </div>
        <div className="page-actions">
          <button className="btn-primary" onClick={abrirModal}>+ Nueva siembra</button>
          <button className="btn" onClick={cargar}>↺ Refrescar</button>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="card">
        <input type="search" placeholder="🔎  Buscar por nombre, código o ID..."
          className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm
                     focus:outline-none focus:ring-2 focus:ring-green-300"
          value={busqueda}
          onChange={e => { setBusqueda(e.target.value); setPagina(1); }} />
      </div>

      {/* Tabla */}
      <div className="card overflow-x-auto">
        {loading ? <Spinner /> : filtrados.length === 0 ? (
          <EmptyState icon="🌱" title="No hay ciclos activos"
            subtitle="Registrá una nueva siembra para comenzar"
            action={<button className="btn-primary" onClick={abrirModal}>+ Nueva siembra</button>} />
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th><th>Cultivo</th><th>Torre</th>
                  <th>Inicio</th><th>Fin estimado</th>
                  <th>Progreso</th><th>Estado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginados.map(c => {
                  const p = pct(c);
                  const label = c.productoCodigo
                    ? `${c.productoCodigo} ${c.productoNombre ?? ""}`
                    : c.productoNombre ?? `Ciclo #${c.cicloId}`;
                  const pColor = p >= 90 ? "bg-green-500" : p >= 50 ? "bg-yellow-400" : "bg-blue-400";
                  return (
                    <tr key={c.cicloId}>
                      <td className="font-semibold">{label}</td>
                      <td className="text-gray-500 text-sm">{c.variedadNombre ?? "—"}</td>
                      <td className="text-xs font-mono text-gray-500">
                        {c.torreCodigo ? String(c.torreCodigo).replace(/^TORRE-/i, "") : "—"}
                      </td>
                      <td>{fmt.fecha(c.fechaSiembra)}</td>
                      <td>{fmt.fecha(c.fechaCosechaEstimada)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${pColor}`}
                                 style={{ width: `${p}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 w-8">{p}%</span>
                        </div>
                      </td>
                      <td>
                        <span className="tag badge-ok">{c.estadoNombre ?? "Activo"}</span>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <button className="btn-ghost" onClick={() => cosechar(c)}>
                            🌾 Cosechar
                          </button>
                          <button className="btn-ghost text-red-500 hover:bg-red-50"
                            onClick={() => cancelar(c.cicloId)}>
                            Cancelar
                          </button>
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

      {/* ── Modal nueva siembra ──────────────────────────────── */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nueva siembra" wide
        footer={<>
          <button className="btn" type="button" onClick={() => setShowModal(false)}>Cancelar</button>
          <button className="btn-primary" type="button" onClick={guardar} disabled={saving}>
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </>}
      >
        <div className="flex flex-col gap-5">

          {/* Producto + Variedad */}
          <div className="grid grid-cols-2 gap-4">
            <div className="field">
              <label>Producto *</label>
              <ProductoAutocomplete
                productos={productos}
                value={queryProducto}
                onChange={(p) => { setProdSeleccionado(p); }}
                onSelect={(p) => { setProdSeleccionado(p); setQueryProducto(`${p.codigo ? p.codigo + " — " : ""}${p.nombreProducto}`); }}
              />
              {prodSeleccionado && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ Seleccionado: <strong>{prodSeleccionado.nombreProducto}</strong>
                </p>
              )}
            </div>
            <div className="field">
              <label>Variedad</label>
              <input
                type="text"
                readOnly
                value={prodSeleccionado?.nombreVariedad ?? ""}
                placeholder="Se completa al seleccionar un producto"
                className="w-full px-3 py-2 rounded-xl border border-gray-100 text-sm
                           bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Torre — matriz visual */}
          <div className="field">
            <label>Torre *</label>
            {torreSeleccionada && (
              <p className="text-xs text-green-600 mb-2">
                ✓ Torre seleccionada: <strong>
                  {String(torreSeleccionada.codigoTorre ?? "").replace(/^TORRE-/i, "")}
                </strong> — {torreSeleccionada.huecosDisponibles} huecos disponibles
              </p>
            )}
            {loadingTorres ? (
              <div className="flex items-center gap-2 text-xs text-gray-400 py-4">
                <div className="w-4 h-4 border-2 border-green-300 border-t-green-600 rounded-full animate-spin" />
                Cargando torres…
              </div>
            ) : torres.length === 0 ? (
              <p className="text-xs text-red-400 py-2">No se pudieron cargar las torres. Cerrá y volvé a abrir el modal.</p>
            ) : (
              <TorresGrid
                torres={torres}
                torreSeleccionada={torreId}
                onSelect={setTorreId}
              />
            )}
          </div>

          {/* Fechas + datos */}
          <div className="grid grid-cols-2 gap-4">
            <div className="field">
              <label>Fecha siembra *</label>
              <input type="date" value={fechaSiembra}
                onChange={e => onFechaSiembraChange(e.target.value)} />
            </div>
            <div className="field">
              <label>Fecha cosecha estimada *</label>
              <input type="date" value={fechaCosecha}
                min={fechaSiembra}
                onChange={e => onFechaCosechaChange(e.target.value)} />
            </div>
            <div className="field">
              <label>Cantidad plantas *</label>
              <input type="number" min="1" value={cantidadPlantas}
                onChange={e => setCantidadPlantas(e.target.value)} />
            </div>
            <div className="field">
              <label>Lote semilla</label>
              <input type="text" value={loteSemilla}
                onChange={e => setLoteSemilla(e.target.value)}
                placeholder="Opcional" />
            </div>
            <div className="field col-span-2">
              <label>Notas</label>
              <textarea rows="2" value={notas}
                onChange={e => setNotas(e.target.value)}
                placeholder="Opcional" />
            </div>
          </div>

        </div>
      </Modal>
    </div>
  );
}
