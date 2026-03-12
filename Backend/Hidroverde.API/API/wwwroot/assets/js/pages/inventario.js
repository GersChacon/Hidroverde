import { api } from "../lib/http.js";
import { escapeHtml, setValue, setText } from "../lib/dom.js";
import { showModal, setModalTitle } from "../lib/modal.js";
import { getTrim, getNumber, getDecimal, getBool, nullableString } from "../lib/form.js";

let modoEdicion = false;
let productoEditandoId = null;

export function init() {
    document.getElementById("btnRefrescarProductos")?.addEventListener("click", cargarProductos);
    document.getElementById("btnNuevoProducto")?.addEventListener("click", () => abrirModalNuevo());

    document.getElementById("btnCerrarProducto")?.addEventListener("click", () => showModal("modalProducto", false));
    document.getElementById("btnGuardarProducto")?.addEventListener("click", guardarProducto);

    // delegación tabla
    const tbody = document.getElementById("productosBody");
    if (tbody) {
        tbody.addEventListener("click", (e) => onTableClick(e));
    }

    cargarProductos();
}

// pages/inventario.js — Módulo de inventario/productos
import { api } from "../lib/http.js";

// ─── Constantes ───────────────────────────────
const API_PRODUCTO  = "/api/Producto";
const API_INVENTARIO = "/api/inventario";

// Unidades hardcodeadas (coinciden con la BD — sin endpoint propio)
const UNIDADES = [
    { id: 1, nombre: "Unidad",     simbolo: "u"   },
    { id: 2, nombre: "Racimo",     simbolo: "rac" },
    { id: 3, nombre: "Bandeja",    simbolo: "bdj" },
    { id: 4, nombre: "Kilogramo",  simbolo: "kg"  },
    { id: 5, nombre: "Gramo",      simbolo: "g"   },
    { id: 6, nombre: "Paquete",    simbolo: "paq" },
    { id: 7, nombre: "Atado",      simbolo: "atd" },
];

// ─── Estado ───────────────────────────────────
let _productos       = [];   // todos los productos cargados
let _modoEdicion     = false;
let _productoId      = null;
let _productoCodigo  = null;
let _productoActual  = null; // para el modal de detalle

// ─── Init ─────────────────────────────────────
export function init() {
    // Botones toolbar
    document.getElementById("btnNuevoProducto")?.addEventListener("click", abrirModalNuevo);
    document.getElementById("btnRefrescarProductos")?.addEventListener("click", () => cargarProductos());

    // Modal producto
    document.getElementById("btnCerrarModalProducto")?.addEventListener("click",  () => cerrarModal("modalProducto"));
    document.getElementById("backdropModalProducto")?.addEventListener("click",   () => cerrarModal("modalProducto"));
    document.getElementById("btnCancelarModalProducto")?.addEventListener("click",() => cerrarModal("modalProducto"));
    document.getElementById("btnGuardarProducto")?.addEventListener("click", guardarProducto);

    // Modal detalle
    document.getElementById("btnCerrarDetalleProducto")?.addEventListener("click",  () => cerrarModal("modalDetalleProducto"));
    document.getElementById("backdropDetalleProducto")?.addEventListener("click",   () => cerrarModal("modalDetalleProducto"));
    document.getElementById("btnEditarDesdeDetalle")?.addEventListener("click",     () => {
        cerrarModal("modalDetalleProducto");
        if (_productoActual) abrirModalEditar(_productoActual);
    });
    document.getElementById("btnEliminarDesdeDetalle")?.addEventListener("click",   () => {
        if (_productoActual) eliminarProducto(_productoActual.productoId, _productoActual.nombreProducto);
    });

    // Delegación en tabla → Ver detalle
    document.getElementById("productosBody")?.addEventListener("click", onTablaClick);

    // Filtros en tiempo real
    document.getElementById("filtroNombre")?.addEventListener("input",  aplicarFiltros);
    document.getElementById("filtroUnidad")?.addEventListener("change", aplicarFiltros);
    document.getElementById("filtroActivo")?.addEventListener("change", aplicarFiltros);
    document.getElementById("btnLimpiarFiltros")?.addEventListener("click", limpiarFiltros);

    // Poblar dropdown unidades en filtro
    poblarFiltroUnidades();

    requestAnimationFrame(() => cargarProductos());
}

// ─── Modales helpers ──────────────────────────
function abrirModal(id) {
    const el = document.getElementById(id);
    if (el) { el.hidden = false; el.setAttribute("aria-hidden", "false"); }
}
function cerrarModal(id) {
    const el = document.getElementById(id);
    if (el) { el.hidden = true;  el.setAttribute("aria-hidden", "true");  }
}

// ─── Carga de datos ───────────────────────────
async function cargarProductos() {
    const tbody = document.getElementById("productosBody");
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="9" class="table-empty">Cargando...</td></tr>`;

    try {
        const { data, status } = await api("/api/producto");
        if (status === 204 || !Array.isArray(data) || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" class="muted">No hay productos</td></tr>`;
            return;
        }
        renderTabla(data);
        const { data } = await api(API_PRODUCTO);
        _productos = Array.isArray(data) ? data : [];

        if (_productos.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" class="table-empty">No hay productos registrados</td></tr>`;
            return;
        }
        aplicarFiltros();
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="9" class="table-empty" style="color:#dc2626;">Error al cargar productos</td></tr>`;
        console.error(err);
        tbody.innerHTML = `<tr><td colspan="9" class="danger">Error al cargar datos</td></tr>`;
    }
}

// ─── Filtros ──────────────────────────────────
function poblarFiltroUnidades() {
    const sel = document.getElementById("filtroUnidad");
    if (!sel) return;
    // Mantener opción "Todas"
    sel.innerHTML = `<option value="">Todas</option>` +
        UNIDADES.map(u => `<option value="${u.id}">${u.nombre}</option>`).join("");
}

function aplicarFiltros() {
    const nombre  = (document.getElementById("filtroNombre")?.value  || "").toLowerCase().trim();
    const unidad  = document.getElementById("filtroUnidad")?.value   || "";
    const activo  = document.getElementById("filtroActivo")?.value   || "";

    const filtrados = _productos.filter(p => {
        if (nombre && !( (p.nombreProducto || "").toLowerCase().includes(nombre) ||
                         (p.codigo        || "").toLowerCase().includes(nombre) ))
            return false;
        if (unidad && String(p.unidadId) !== unidad)
            return false;
        if (activo !== "" && String(p.activo) !== activo)
            return false;
        return true;
    });

    renderTabla(filtrados);
}

function limpiarFiltros() {
    const fn = document.getElementById("filtroNombre");
    const fu = document.getElementById("filtroUnidad");
    const fa = document.getElementById("filtroActivo");
    if (fn) fn.value = "";
    if (fu) fu.value = "";
    if (fa) fa.value = "";
    aplicarFiltros();
}

// ─── Render tabla ─────────────────────────────
function renderTabla(productos) {
    const tbody = document.getElementById("productosBody");
    if (!tbody) return;

    tbody.innerHTML = productos.map(p => {
        const id = p.productoId ?? 0;
        return `
      <tr>
        <td>${escapeHtml(id)}</td>
        <td>${escapeHtml(p.codigo ?? "-")}</td>
        <td>${escapeHtml(p.nombreProducto ?? "-")}</td>
        <td>${escapeHtml(p.nombreVariedad ?? "-")}</td>
        <td>${escapeHtml(p.unidadSimbolo ?? p.unidadNombre ?? "-")}</td>
        <td>${escapeHtml(p.precioBase ?? 0)}</td>
        <td>${p.activo ? "Sí" : "No"}</td>
        <td>${escapeHtml(p.stockMinimo ?? "-")}</td>
        <td class="right">
          <button class="btn" data-action="edit" data-id="${id}">Editar</button>
          <button class="btn danger" data-action="del" data-id="${id}">Eliminar</button>
        </td>
      </tr>`;
    }).join("");
    if (!productos.length) {
        tbody.innerHTML = `<tr><td colspan="9" class="table-empty">Sin resultados para los filtros aplicados</td></tr>`;
        return;
    }

    const fmt = v => v != null ? `₡${Number(v).toLocaleString("es-CR", { minimumFractionDigits: 2 })}` : "—";
    const unidadNombre = id => UNIDADES.find(u => u.id === id)?.nombre ?? `#${id}`;

    tbody.innerHTML = productos.map(p => `
        <tr>
            <td>${p.productoId ?? "—"}</td>
            <td><code style="font-size:12px;">${esc(p.codigo ?? "—")}</code></td>
            <td style="font-weight:600;">${esc(p.nombreProducto ?? "—")}</td>
            <td>${esc(p.nombreVariedad ?? "—")}</td>
            <td>${esc(unidadNombre(p.unidadId))}</td>
            <td class="col-right">${fmt(p.precioBase)}</td>
            <td>
                <span class="estado-pill ${p.activo ? "activo" : "inactivo"}">
                    ${p.activo ? "Activo" : "Inactivo"}
                </span>
            </td>
            <td>${p.stockMinimo ?? "—"}</td>
            <td class="col-right">
                <button class="btn btn-sm" data-action="detalle" data-id="${p.productoId}">Ver detalle</button>
            </td>
        </tr>
    `).join("");
}

function esc(v) {
    return String(v ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

// ─── Click en tabla ───────────────────────────
function onTablaClick(e) {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    if (!id) return;
    if (btn.dataset.action === "detalle") abrirDetalle(id);
}

// ─── Modal detalle producto ───────────────────
async function abrirDetalle(productoId) {
    const producto = _productos.find(p => p.productoId === productoId);
    if (!producto) return;

    _productoActual = producto;
    document.getElementById("detalleProductoTitle").textContent = `${producto.nombreProducto} · ${producto.codigo ?? ""}`;
    document.getElementById("detalleProductoBody").innerHTML = `<div class="table-empty">Cargando stock...</div>`;
    abrirModal("modalDetalleProducto");

    // Cargar lotes de inventario
    let inventario = [];
    try {
        const { data } = await api(`${API_INVENTARIO}/actual?productoId=${productoId}&soloDisponibles=false`);
        inventario = Array.isArray(data) ? data : [];
    } catch (_) { inventario = []; }

    renderDetalleProducto(producto, inventario);
}

function renderDetalleProducto(p, inventario) {
    const fmt  = v => v != null ? `₡${Number(v).toLocaleString("es-CR", { minimumFractionDigits: 2 })}` : "—";
    const fmtD = v => v ? new Date(v).toLocaleDateString("es-CR") : "—";
    const unidadNombre = id => UNIDADES.find(u => u.id === id)?.nombre ?? `#${id}`;

    const campos = [
        ["Código",                  p.codigo       ?? "—"],
        ["Nombre",                  p.nombreProducto ?? "—"],
        ["Variedad",                p.nombreVariedad ?? "—"],
        ["Unidad",                  unidadNombre(p.unidadId)],
        ["Precio base",             fmt(p.precioBase)],
        ["Días caducidad",          p.diasCaducidad ?? "—"],
        ["Stock mínimo",            p.stockMinimo   ?? "—"],
        ["Requiere refrigeración",  p.requiereRefrigeracion ? "Sí" : "No"],
        ["Estado",                  p.activo ? "Activo" : "Inactivo"],
        ["Fecha creación",          fmtD(p.fechaCreacion)],
    ];

    const gridHtml = `
        <div class="detalle-grid">
            ${campos.map(([label, valor]) => `
                <div class="detalle-field">
                    <div class="df-label">${label}</div>
                    <div class="df-value">${esc(valor)}</div>
                </div>
            `).join("")}
        </div>
    `;

    // Tabla de lotes
    let stockHtml = "";
    if (!inventario.length) {
        stockHtml = `<p style="color:var(--text-muted,#94a3b8);font-size:13px;">Sin lotes de inventario registrados.</p>`;
    } else {
        const totalStock = inventario.reduce((s, i) => s + Number(i.cantidadDisponible ?? 0), 0);
        stockHtml = `
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                <h3 style="margin:0;font-size:14px;font-weight:700;">Lotes en inventario</h3>
                <span style="font-size:13px;color:var(--text-muted,#94a3b8);">
                    Stock total: <strong style="color:var(--text,#1e293b);">${totalStock}</strong>
                </span>
            </div>
            <div class="table-wrap">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>#Inv.</th>
                            <th>Lote</th>
                            <th>Disponible</th>
                            <th>Fecha entrada</th>
                            <th>Caducidad</th>
                            <th>Notas</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${inventario.map(i => `
                            <tr>
                                <td><code style="font-size:12px;">#${i.inventarioId}</code></td>
                                <td>${esc(i.lote ?? "—")}</td>
                                <td><strong>${i.cantidadDisponible ?? 0}</strong></td>
                                <td>${fmtD(i.fechaEntrada)}</td>
                                <td>${i.fechaCaducidad
                                    ? `<span style="color:${new Date(i.fechaCaducidad) < new Date() ? "#dc2626" : "inherit"}">${fmtD(i.fechaCaducidad)}</span>`
                                    : "—"}</td>
                                <td style="color:var(--text-muted,#94a3b8);font-size:12px;">${esc(i.notas ?? "—")}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;
    }

    document.getElementById("detalleProductoBody").innerHTML = gridHtml + stockHtml;
}

/* ===== Modal ===== */
// ─── Modal nuevo / editar ─────────────────────
function abrirModalNuevo() {
    _modoEdicion    = false;
    _productoId     = null;
    _productoCodigo = null;

    document.getElementById("modalProductoTitle").textContent = "Nuevo producto";
    limpiarFormulario();
    setMsg("");
    abrirModal("modalProducto");
}

function abrirModalEditar(producto) {
    _modoEdicion    = true;
    _productoId     = producto.productoId;
    _productoCodigo = producto.codigo;

    document.getElementById("modalProductoTitle").textContent = `Editar #${producto.productoId} — ${producto.nombreProducto}`;
    llenarFormulario(producto);
    setMsg("");
    abrirModal("modalProducto");
}

function llenarFormulario(p) {
    setVal("pNombreProducto",       p.nombreProducto ?? "");
    setVal("pPrecioBase",           p.precioBase     ?? "");
    setVal("pDiasCaducidad",        p.diasCaducidad  ?? "");
    setVal("pStockMinimo",          p.stockMinimo    ?? "");
    setVal("pDescripcion",          p.descripcion    ?? "");
    setVal("pImagenUrl",            p.imagenUrl      ?? "");
    cargarDropdownUnidades(p.unidadId ?? 1);
    setVal("pRequiereRefrigeracion", String(!!p.requiereRefrigeracion));
    setVal("pActivo",                String(!!p.activo));
}

    try {
        const { data } = await api(`/api/producto/${productoId}`);
        fillForm(data);
        setMsg("");
    } catch (err) {
        console.error(err);
        setMsg("Error al cargar el producto", true);
    }
}

function fillForm(p) {
    setValue("pCodigo", p.codigo);
    setValue("pNombreProducto", p.nombreProducto);
    setValue("pVariedadId", p.variedadId);
    setValue("pUnidadId", p.unidadId);
    setValue("pPrecioBase", p.precioBase);
    setValue("pDiasCaducidad", p.diasCaducidad);
    setValue("pStockMinimo", p.stockMinimo);
    setValue("pDescripcion", p.descripcion);
    setValue("pImagenUrl", p.imagenUrl);

    document.getElementById("pRequiereRefrigeracion").value = String(!!p.requiereRefrigeracion);
    document.getElementById("pActivo").value = String(!!p.activo);
}

function limpiarFormulario() {
    ["pCodigo", "pNombreProducto", "pVariedadId", "pUnidadId", "pPrecioBase", "pDiasCaducidad", "pStockMinimo", "pDescripcion", "pImagenUrl"]
        .forEach(id => setValue(id, ""));

    const rr = document.getElementById("pRequiereRefrigeracion");
    const ac = document.getElementById("pActivo");
    if (rr) rr.value = "false";
    if (ac) ac.value = "true";
function limpiarFormulario() {
    ["pNombreProducto","pPrecioBase","pDiasCaducidad","pStockMinimo","pDescripcion","pImagenUrl"]
        .forEach(id => setVal(id, ""));
    cargarDropdownUnidades(1);
    setVal("pRequiereRefrigeracion", "false");
    setVal("pActivo", "true");
}

function cargarDropdownUnidades(selectedId = 1) {
    const sel = document.getElementById("pUnidadId");
    if (!sel) return;
    sel.innerHTML = UNIDADES.map(u =>
        `<option value="${u.id}">${u.nombre} (${u.simbolo})</option>`
    ).join("");
    sel.value = String(selectedId);
}

function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
}

function numVal(id) { return Number(document.getElementById(id)?.value) || 0; }

function setMsg(texto, isError = false) {
    const el = document.getElementById("pMsg");
    if (!el) return;
    el.textContent = texto ?? "";
    el.className   = "modal-msg" + (isError ? " error" : "");
}

/* ===== Guardar ===== */
async function guardarProducto() {
    setMsg("");

    const payload = buildPayload();
    const valid = validar(payload);
    if (!valid.ok) return setMsg(valid.msg, true);

    const url = modoEdicion ? `/api/producto/${productoEditandoId}` : "/api/producto";
    const method = modoEdicion ? "PUT" : "POST";

    try {
        await api(url, { method, body: payload });
        await cargarProductos();
        showModal("modalProducto", false);
// ─── Guardar ──────────────────────────────────
async function guardarProducto() {
    setMsg("");

    const nombreProducto = (document.getElementById("pNombreProducto")?.value ?? "").trim();
    if (!nombreProducto) return setMsg("El nombre es requerido.", true);

    const unidadId = numVal("pUnidadId");
    if (!unidadId) return setMsg("Seleccioná una unidad de medida.", true);

    const payload = {
        codigo:                _modoEdicion ? _productoCodigo : null,
        nombreProducto,
        variedadId:            1,
        unidadId,
        precioBase:            Number(document.getElementById("pPrecioBase")?.value)    || 0,
        diasCaducidad:         Number(document.getElementById("pDiasCaducidad")?.value) || 0,
        stockMinimo:           document.getElementById("pStockMinimo")?.value !== ""
                                   ? Number(document.getElementById("pStockMinimo").value)
                                   : null,
        requiereRefrigeracion: document.getElementById("pRequiereRefrigeracion")?.value === "true",
        activo:                document.getElementById("pActivo")?.value !== "false",
        descripcion:           document.getElementById("pDescripcion")?.value?.trim() || null,
        imagenUrl:             document.getElementById("pImagenUrl")?.value?.trim()    || null,
        pesoGramos:            0,
    };

    try {
        if (_modoEdicion) {
            await api(`${API_PRODUCTO}/${_productoId}`, { method: "PUT", body: payload });
        } else {
            await api(API_PRODUCTO, { method: "POST", body: payload });
        }
        cerrarModal("modalProducto");
        await cargarProductos();
    } catch (err) {
        setMsg(err?.message || "Error al guardar el producto.", true);
        console.error(err);
        setMsg("Error al guardar", true);
    }
}

function buildPayload() {
    const stockTxt = getTrim("pStockMinimo");

    return {
        codigo: getTrim("pCodigo"),
        nombreProducto: getTrim("pNombreProducto"),
        variedadId: getNumber("pVariedadId"),
        unidadId: getNumber("pUnidadId"),
        precioBase: getDecimal("pPrecioBase"),
        diasCaducidad: getNumber("pDiasCaducidad"),
        requiereRefrigeracion: getBool("pRequiereRefrigeracion"),
        activo: getBool("pActivo"),
        stockMinimo: stockTxt === "" ? null : Number(stockTxt),
        descripcion: nullableString(getTrim("pDescripcion")),
        imagenUrl: nullableString(getTrim("pImagenUrl")),
    };
}

function validar(p) {
    if (!p.codigo) return { ok: false, msg: "El código es necesario" };
    if (!p.nombreProducto) return { ok: false, msg: "El nombre es necesario" };
    if (!Number.isFinite(p.variedadId) || p.variedadId <= 0) return { ok: false, msg: "VariedadId inválido" };
    if (!Number.isFinite(p.unidadId) || p.unidadId <= 0) return { ok: false, msg: "UnidadId inválido" };
    if (!Number.isFinite(p.precioBase) || p.precioBase < 0) return { ok: false, msg: "Precio inválido" };
    if (!Number.isFinite(p.diasCaducidad) || p.diasCaducidad < 0) return { ok: false, msg: "Días inválidos" };
    return { ok: true };
}

/* ===== Eliminar ===== */
async function eliminarProducto(productoId) {
    if (!confirm(`¿Eliminar el producto #${productoId}?`)) return;

    try {
        await api(`/api/producto/${productoId}`, { method: "DELETE" });
    }
}

// ─── Eliminar ─────────────────────────────────
async function eliminarProducto(productoId, nombre) {
    if (!confirm(`¿Eliminar "${nombre}"?\nEsta acción no se puede deshacer.`)) return;

    try {
        await api(`${API_PRODUCTO}/${productoId}`, { method: "DELETE" });
        cerrarModal("modalDetalleProducto");
        await cargarProductos();
    } catch (err) {
        if (err?.status === 409) {
            alert("No se puede eliminar este producto porque tiene registros asociados. Eliminá primero esos registros.");
        } else {
            alert(err?.message || "Error al eliminar el producto.");
        }
        console.error(err);
        alert("Error al eliminar");
    }
}
