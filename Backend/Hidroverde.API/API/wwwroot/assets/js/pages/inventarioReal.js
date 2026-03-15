import { api } from "../lib/http.js";
import { $, $$, escapeHtml } from "../lib/dom.js";
import { showModal, setModalTitle } from "../lib/modal.js";
import { getTrim, getBool } from "../lib/form.js";

const MODAL_ID = "modalInventarioReal";

/* ============================
   Helpers
============================ */

function setHidden(el, hidden) {
    if (el) el.hidden = !!hidden;
}

function getEmpleadoId() {
    const raw = localStorage.getItem("empleadoId");
    const parsed = parseInt(raw ?? "", 10);

    if (!Number.isNaN(parsed) && parsed > 0) {
        return parsed;
    }

    // fallback de desarrollo
    const fallback = 1;
    localStorage.setItem("empleadoId", String(fallback));
    return fallback;
}


function buildQuery(params) {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (!v) return;
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
    setHidden($("#invLoading"), !flag);
}

function setEmpty(flag) {
    setHidden($("#invEmpty"), !flag);
}

function setCount(n) {
    const el = $("#invCount");
    if (el) el.textContent = String(n ?? 0);
}

/* ============================
   Filtros
============================ */

function getFiltersFromUI() {
    const productoId = getTrim("#fProductoId");
    const ubicacionId = getTrim("#fUbicacionId");
    const desde = getTrim("#fDesde");
    const hasta = getTrim("#fHasta");
    const soloDisponibles = getBool("#fSoloDisponibles");

    return {
        productoId: productoId ? Number(productoId) : "",
        ubicacionId: ubicacionId ? Number(ubicacionId) : "",
        soloDisponibles: soloDisponibles ? "true" : "",
        desde,
        hasta
    };
}

function clearFiltersUI() {
    $("#fProductoId").value = "";
    $("#fUbicacionId").value = "";
    $("#fDesde").value = "";
    $("#fHasta").value = "";
    $("#fSoloDisponibles").checked = false;
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

    // Si tiene stock y ya venció
    if (qty > 0 && cad < today) {
        return `<span class="pill pill--danger">Vencido</span>`;
    }

    // Por vencer en 7 días
    const soon = new Date(today);
    soon.setDate(soon.getDate() + 7);

    if (qty > 0 && cad >= today && cad <= soon) {
        return `<span class="pill pill--warn">Por vencer</span>`;
    }

    return `<span class="pill pill--ok">OK</span>`;
}

function renderRows(items) {
    const tbody = $("#invTbody");
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

    const inDays = (d, days) => {
        const x = new Date(d);
        x.setDate(x.getDate() + days);
        x.setHours(0, 0, 0, 0);
        return x;
    };

    let units = 0, expired = 0, soon = 0, zero = 0;

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

    $("#kpiItems").textContent = String(items.length);
    $("#kpiUnits").textContent = String(units);
    $("#kpiExpired").textContent = String(expired);
    $("#kpiSoon").textContent = String(soon);
    $("#kpiZero").textContent = String(zero);
}


/* ============================
   API
============================ */

async function getJson(url, empleadoId) {
    if (api?.getJson) {
        return await api.getJson(url, {
            headers: { "X-Empleado-Id": empleadoId }
        });
    }

    const res = await fetch(url, {
        headers: { "X-Empleado-Id": String(empleadoId) }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
}

async function cargarInventario() {
    const empleadoId = getEmpleadoId();
        setError("");
    setEmpty(false);
    setLoading(true);

    try {
        const q = buildQuery(getFiltersFromUI());
        const data = await getJson(`/api/inventario/actual${q}`, empleadoId);

        const items = Array.isArray(data) ? data : [];
        setCount(items.length);
        renderRows(items);
        computeKpis(items);
        setEmpty(items.length === 0);

    } catch (err) {
        console.error(err);
        setError("Error cargando inventario.");
    } finally {
        setLoading(false);
    }
}

/* ============================
   Detalle / Movimientos
============================ */

async function verDetalle(id) {
    const empleadoId = getEmpleadoId();
    if (!empleadoId) return;

    openModal(`Detalle inventario #${id}`,
        `<div class="loading"><div class="spinner"></div><p>Cargando...</p></div>`
    );

    try {
        const it = await getJson(`/api/inventario/actual/${id}`, empleadoId);

        openModal(`Detalle inventario #${id}`, `
            <div class="kv">
                <div><span>Lote</span><strong>${escapeHtml(it.lote)}</strong></div>
                <div><span>Cantidad</span><strong>${escapeHtml(it.cantidadDisponible)}</strong></div>
                <div><span>Producto</span><strong>${escapeHtml(it.productoNombre)}</strong></div>
                <div><span>Ubicación</span><strong>${escapeHtml(it.ubicacionNombre ?? it.ubicacionId)}</strong></div>
                <div><span>Caducidad</span><strong>${escapeHtml(formatDate(it.fechaCaducidad))}</strong></div>
            </div>
        `);

    } catch {
        openModal(`Detalle inventario #${id}`,
            `<div class="alert alert--error">Error cargando detalle.</div>`
        );
    }
}

async function verMovimientos(id) {
    const empleadoId = getEmpleadoId();
    if (!empleadoId) return;

    openModal(`Movimientos #${id}`,
        `<div class="loading"><div class="spinner"></div><p>Cargando...</p></div>`
    );

    try {
        const data = await getJson(`/api/inventario/movimientos?inventarioId=${id}`, empleadoId);
        const items = Array.isArray(data) ? data : [];

        if (!items.length) {
            openModal(`Movimientos #${id}`,
                `<div class="empty">Sin movimientos.</div>`
            );
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
                                <td>${escapeHtml(m.tipoMovimientoNombre)}</td>
                                <td>${escapeHtml(m.cantidad)}</td>
                                <td>${escapeHtml(formatDate(m.fechaMovimiento))}</td>
                                <td>${escapeHtml(m.motivo)}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `);

    } catch {
        openModal(`Movimientos #${id}`,
            `<div class="alert alert--error">Error cargando movimientos.</div>`
        );
    }
}

/* ============================
   Events
============================ */

function bindEvents() {
    $("#btnRefrescarInventario")?.addEventListener("click", cargarInventario);
    $("#btnAplicarFiltros")?.addEventListener("click", cargarInventario);

    $("#btnLimpiarFiltros")?.addEventListener("click", () => {
        clearFiltersUI();
        cargarInventario();
    });

    $("#invTbody")?.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-action]");
        if (!btn) return;

        const id = Number(btn.dataset.id);
        if (btn.dataset.action === "detalle") verDetalle(id);
        if (btn.dataset.action === "movs") verMovimientos(id);
    });
}

/* ============================
   Init
============================ */

export function init() {
    bindModalClose();
    bindEvents();
    cargarInventario();
}
