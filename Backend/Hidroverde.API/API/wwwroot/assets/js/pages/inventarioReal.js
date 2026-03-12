import { api } from "../lib/http.js";
import { $, escapeHtml } from "../lib/dom.js";
import { showModal, setModalTitle } from "../lib/modal.js";
import { getTrim } from "../lib/form.js";

const MODAL_ID = "modalInventarioReal";
const PRODUCTOS_URL = "/api/Producto";

let inventarioRealInitialized = false;

/* ============================
   Helpers
============================ */

function setHidden(el, hidden) {
    if (el) el.hidden = !!hidden;
}

function setText(selector, value) {
    const el = $(selector);
    if (el) el.textContent = String(value ?? "");
}

function buildQuery(params) {
    const sp = new URLSearchParams();

    Object.entries(params).forEach(([k, v]) => {
        if (v === null || v === undefined || v === "") return;
        sp.set(k, String(v));
    });

    const s = sp.toString();
    return s ? `?${s}` : "";
}

function formatDate(iso) {
    if (!iso) return "—";

    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;

    return d.toLocaleDateString("es-CR");
}

function parseDateOnly(value) {
    if (!value) return null;

    const d = new Date(`${value}T00:00:00`);
    if (Number.isNaN(d.getTime())) return null;

    d.setHours(0, 0, 0, 0);
    return d;
}

function normalizeArray(data) {
    return Array.isArray(data) ? data : [];
}

function getProductoIdFromItem(item) {
    return item?.productoId ?? item?.id ?? item?.ProductoId ?? null;
}

function getProductoLabelFromItem(item) {
    const nombre =
        item?.nombreProducto ??
        item?.nombre ??
        item?.productoNombre ??
        item?.NombreProducto ??
        item?.Nombre ??
        "";

    const codigo =
        item?.codigo ??
        item?.productoCodigo ??
        item?.Codigo ??
        "";

    if (codigo && nombre) return `${codigo} - ${nombre}`;
    return nombre || codigo || "Producto";
}

/* ============================
   Modal
============================ */

function openModal(title, html) {
    setModalTitle(MODAL_ID, title);

    const body = $("#modalInventarioRealBody");
    if (body) body.innerHTML = html ?? "";

    showModal(MODAL_ID, true);
    document.body.classList.add("modal-open");
}

function closeModal() {
    showModal(MODAL_ID, false);
    document.body.classList.remove("modal-open");
}

function bindModalClose() {
    $("#btnCerrarModalInventarioReal")?.addEventListener("click", closeModal);
    $(`#${MODAL_ID} .modal__backdrop`)?.addEventListener("click", closeModal);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
    });
}

/* ============================
   UI State
============================ */

function setError(msg) {
    const el = $("#invError");
    if (!el) return;

    el.textContent = msg ?? "";
    setHidden(el, !msg);
}

function setLoading(flag) {
    const isLoading = !!flag;

    setHidden($("#invLoading"), !isLoading);

    $("#btnAplicarFiltros")?.toggleAttribute("disabled", isLoading);
    $("#btnRefrescarInventario")?.toggleAttribute("disabled", isLoading);
    $("#btnLimpiarFiltros")?.toggleAttribute("disabled", isLoading);
}

function setEmpty(flag) {
    setHidden($("#invEmpty"), !flag);
}

function setCount(n) {
    setText("#invCount", n ?? 0);
}

function resetKpis() {
    setText("#kpiItems", 0);
    setText("#kpiUnits", 0);
    setText("#kpiExpired", 0);
    setText("#kpiSoon", 0);
    setText("#kpiZero", 0);
}

/* ============================
   Filtros
============================ */

function getFiltersFromUI() {
    const productoSelect = $("#fProductoId");
    const productoIdRaw = productoSelect ? productoSelect.value : "";

    const lote = getTrim("#fLote");
    const desde = getTrim("#fDesde");
    const hasta = getTrim("#fHasta");
    const soloDisponibles = $("#fSoloDisponibles")?.checked ?? false;

    return {
        productoId: productoIdRaw ? Number(productoIdRaw) : "",
        lote,
        desde,
        hasta,
        soloDisponibles: String(soloDisponibles)
    };
}

function clearFiltersUI() {
    const productoId = $("#fProductoId");
    const lote = $("#fLote");
    const desde = $("#fDesde");
    const hasta = $("#fHasta");
    const solo = $("#fSoloDisponibles");

    if (productoId) productoId.value = "";
    if (lote) lote.value = "";
    if (desde) desde.value = "";
    if (hasta) hasta.value = "";
    if (solo) solo.checked = false;

    setError("");
}

function validateFilters(filters) {
    if (filters.productoId !== "" && (!Number.isInteger(filters.productoId) || filters.productoId <= 0)) {
        return "El producto seleccionado no es válido.";
    }

    const desde = parseDateOnly(filters.desde);
    const hasta = parseDateOnly(filters.hasta);

    if (filters.desde && !desde) {
        return "La fecha 'Desde' no es válida.";
    }

    if (filters.hasta && !hasta) {
        return "La fecha 'Hasta' no es válida.";
    }

    if (desde && hasta && desde > hasta) {
        return "La fecha 'Desde' no puede ser mayor que la fecha 'Hasta'.";
    }

    return "";
}

function bindFilterInteractions() {
    const selectors = ["#fProductoId", "#fLote", "#fDesde", "#fHasta", "#fSoloDisponibles"];

    selectors.forEach((selector) => {
        const el = $(selector);
        if (!el) return;

        const eventName = el.type === "checkbox" || el.tagName === "SELECT" ? "change" : "input";
        el.addEventListener(eventName, () => {
            setError("");
        });
    });
}

function bindFilterEnter() {
    ["#fLote", "#fDesde", "#fHasta"].forEach((selector) => {
        $(selector)?.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                cargarInventario();
            }
        });
    });
}

/* ============================
   Render
============================ */

function getCadBadge(it) {
    const qty = Number(it.cantidadDisponible ?? 0);

    if (!it.fechaCaducidad) {
        return `<span class="pill">—</span>`;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cad = new Date(it.fechaCaducidad);
    cad.setHours(0, 0, 0, 0);

    if (qty > 0 && cad < today) {
        return `<span class="pill pill--danger">Vencido</span>`;
    }

    const soon = new Date(today);
    soon.setDate(soon.getDate() + 7);

    if (qty > 0 && cad >= today && cad <= soon) {
        return `<span class="pill pill--warn">Por vencer</span>`;
    }

    return `<span class="pill pill--ok">OK</span>`;
}

function renderRows(items) {
    const tbody = $("#invTbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    for (const it of items) {
        const ubicacion = it.ubicacionNombre ?? `#${it.ubicacionId ?? "—"}`;
        const calidad = it.estadoCalidadNombre ?? `#${it.estadoCalidadId ?? "—"}`;

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${escapeHtml(it.productoCodigo ?? "—")}</td>
            <td>${escapeHtml(it.productoNombre ?? "—")}</td>
            <td class="mono">${escapeHtml(it.lote ?? "—")}</td>
            <td class="t-right">${escapeHtml(it.cantidadDisponible ?? 0)}</td>
            <td>${escapeHtml(ubicacion)}</td>
            <td>
                <div class="cell-stack">
                    <div>${escapeHtml(formatDate(it.fechaCaducidad))}</div>
                    <div>${getCadBadge(it)}</div>
                </div>
            </td>
            <td>${escapeHtml(calidad)}</td>
            <td class="t-right">
                <div class="row-actions">
                    <button class="btn btn--ghost" data-action="detalle" data-id="${it.inventarioId}">Detalle</button>
                    <button class="btn btn--ghost" data-action="movs" data-id="${it.inventarioId}">Movimientos</button>
                    <button class="btn btn--warn" disabled title="Próximamente">Salida</button>
                </div>
            </td>
        `;

        tbody.appendChild(tr);
    }
}

function computeKpis(items) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const inDays = (baseDate, days) => {
        const x = new Date(baseDate);
        x.setDate(x.getDate() + days);
        x.setHours(0, 0, 0, 0);
        return x;
    };

    let units = 0;
    let expired = 0;
    let soon = 0;
    let zero = 0;

    for (const it of items) {
        const qty = Number(it.cantidadDisponible ?? 0);
        units += qty;

        if (qty <= 0) zero++;

        const cad = it.fechaCaducidad ? new Date(it.fechaCaducidad) : null;
        if (cad) {
            cad.setHours(0, 0, 0, 0);

            if (qty > 0 && cad < today) expired++;
            if (qty > 0 && cad >= today && cad <= inDays(today, 7)) soon++;
        }
    }

    setText("#kpiItems", items.length);
    setText("#kpiUnits", units);
    setText("#kpiExpired", expired);
    setText("#kpiSoon", soon);
    setText("#kpiZero", zero);
}

function clearTable() {
    const tbody = $("#invTbody");
    if (tbody) tbody.innerHTML = "";
}

/* ============================
   API
============================ */

async function getJson(url, options = {}) {
    const response = await api(url, options);
    return response?.data ?? null;
}

async function cargarProductos() {
    const select = $("#fProductoId");
    if (!select) return;

    try {
        select.innerHTML = `<option value="">Todos</option>`;

        const data = await getJson(PRODUCTOS_URL);
        const items = normalizeArray(data);

        for (const item of items) {
            const id = getProductoIdFromItem(item);
            if (!id) continue;

            const option = document.createElement("option");
            option.value = String(id);
            option.textContent = getProductoLabelFromItem(item);
            select.appendChild(option);
        }
    } catch (err) {
        console.error("Error cargando productos", err);
    }
}

async function cargarInventario() {
    const filters = getFiltersFromUI();

    setError("");
    setEmpty(false);

    const validationError = validateFilters(filters);
    if (validationError) {
        clearTable();
        setCount(0);
        resetKpis();
        setEmpty(true);
        setError(validationError);
        return;
    }

    setLoading(true);

    try {
        const q = buildQuery(filters);
        const url = `/api/inventario/actual${q}`;

        console.log("Inventario URL:", url);

        const data = await getJson(url);
        const items = normalizeArray(data);

        setCount(items.length);
        renderRows(items);
        computeKpis(items);
        setEmpty(items.length === 0);
    } catch (err) {
        console.error(err);
        clearTable();
        setCount(0);
        resetKpis();
        setEmpty(false);
        setError("Error cargando inventario.");
    } finally {
        setLoading(false);
    }
}

/* ============================
   Detalle / Movimientos
============================ */

async function verDetalle(id) {
    if (!id) return;

    openModal(
        `Detalle inventario #${id}`,
        `<div class="loading"><div class="spinner"></div><p>Cargando...</p></div>`
    );

    try {
        const it = await getJson(`/api/inventario/actual/${id}`);

        openModal(`Detalle inventario #${id}`, `
            <div class="kv">
                <div><span>Lote</span><strong>${escapeHtml(it?.lote ?? "—")}</strong></div>
                <div><span>Cantidad</span><strong>${escapeHtml(it?.cantidadDisponible ?? 0)}</strong></div>
                <div><span>Producto</span><strong>${escapeHtml(it?.productoNombre ?? "—")}</strong></div>
                <div><span>Ubicación</span><strong>${escapeHtml(it?.ubicacionNombre ?? it?.ubicacionId ?? "—")}</strong></div>
                <div><span>Caducidad</span><strong>${escapeHtml(formatDate(it?.fechaCaducidad))}</strong></div>
            </div>
        `);
    } catch (err) {
        console.error(err);
        openModal(
            `Detalle inventario #${id}`,
            `<div class="alert alert--error">Error cargando detalle.</div>`
        );
    }
}

async function verMovimientos(id) {
    if (!id) return;

    openModal(
        `Movimientos #${id}`,
        `<div class="loading"><div class="spinner"></div><p>Cargando...</p></div>`
    );

    try {
        const data = await getJson(`/api/inventario/movimientos?inventarioId=${id}`);
        const items = normalizeArray(data);

        if (!items.length) {
            openModal(`Movimientos #${id}`, `<div class="empty">Sin movimientos.</div>`);
            return;
        }

        openModal(`Movimientos #${id}`, `
            <div class="table-wrap">
                <table class="table table--compact">
                    <thead>
                        <tr>
                            <th>Tipo</th>
                            <th>Cantidad</th>
                            <th>Fecha</th>
                            <th>Motivo</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(m => `
                            <tr>
                                <td>${escapeHtml(m.tipoMovimientoNombre ?? "—")}</td>
                                <td>${escapeHtml(m.cantidad ?? 0)}</td>
                                <td>${escapeHtml(formatDate(m.fechaMovimiento))}</td>
                                <td>${escapeHtml(m.motivo ?? "—")}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `);
    } catch (err) {
        console.error(err);
        openModal(
            `Movimientos #${id}`,
            `<div class="alert alert--error">Error cargando movimientos.</div>`
        );
    }
}

/* ============================
   Events
============================ */

function bindEvents() {
    $("#btnRefrescarInventario")?.addEventListener("click", (e) => {
        e.preventDefault();
        cargarInventario();
    });

    $("#btnAplicarFiltros")?.addEventListener("click", (e) => {
        e.preventDefault();
        cargarInventario();
    });

    $("#btnLimpiarFiltros")?.addEventListener("click", (e) => {
        e.preventDefault();
        clearFiltersUI();
        cargarInventario();
    });

    $("#invTbody")?.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-action]");
        if (!btn) return;

        const id = Number(btn.dataset.id);
        if (!id) return;

        if (btn.dataset.action === "detalle") {
            verDetalle(id);
            return;
        }

        if (btn.dataset.action === "movs") {
            verMovimientos(id);
        }
    });
}

/* ============================
   Init
============================ */

export async function init() {
    if (inventarioRealInitialized) return;
    inventarioRealInitialized = true;

    console.log("inventarioReal init ejecutado");

    bindModalClose();
    bindEvents();
    bindFilterEnter();
    bindFilterInteractions();
    await cargarProductos();
    await cargarInventario();
}

/* ============================
   Auto-init fallback
============================ */

if (document.querySelector(".inventarioReal")) {
    init().catch((err) => console.error("Error inicializando inventarioReal:", err));
}