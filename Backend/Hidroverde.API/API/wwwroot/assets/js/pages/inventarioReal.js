// pages/inventarioReal.js — Inventario de lotes
import { api } from "../lib/http.js";

// ─── Endpoints ────────────────────────────────
const API_INV = "/api/inventario";

// ─── Estado ───────────────────────────────────
let _lotes = []; // todos los lotes cargados

// ─── Init ─────────────────────────────────────
export function init() {
    // Toolbar
    document.getElementById("btnRefrescarInventario")?.addEventListener("click", cargarInventario);

    // Filtros en tiempo real
    document.getElementById("filtroNombre")?.addEventListener("input",  aplicarFiltros);
    document.getElementById("filtroLote")?.addEventListener("input",    aplicarFiltros);
    document.getElementById("filtroDisponibles")?.addEventListener("change", cargarInventario); // va al servidor
    document.getElementById("filtroCaducidad")?.addEventListener("change",   aplicarFiltros);
    document.getElementById("btnLimpiarFiltros")?.addEventListener("click",  limpiarFiltros);

    // Modal movimientos
    document.getElementById("btnCerrarMovimientos")?.addEventListener("click",       () => cerrarModal("modalMovimientos"));
    document.getElementById("btnCerrarMovimientosFooter")?.addEventListener("click", () => cerrarModal("modalMovimientos"));
    document.getElementById("backdropMovimientos")?.addEventListener("click",        () => cerrarModal("modalMovimientos"));

    // Delegación en tabla
    document.getElementById("invTbody")?.addEventListener("click", onTablaClick);

    requestAnimationFrame(() => cargarInventario());
}

// ─── Modal helpers ────────────────────────────
function abrirModal(id) {
    const el = document.getElementById(id);
    if (el) { el.hidden = false; el.setAttribute("aria-hidden","false"); }
}
function cerrarModal(id) {
    const el = document.getElementById(id);
    if (el) { el.hidden = true; el.setAttribute("aria-hidden","true"); }
}

// ─── Carga ────────────────────────────────────
async function cargarInventario() {
    const tbody = document.getElementById("invTbody");
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="9" class="table-empty">Cargando...</td></tr>`;
    resetKpis();

    const soloDisponibles = document.getElementById("filtroDisponibles")?.value === "true";
    const params = new URLSearchParams({ soloDisponibles: soloDisponibles ? "true" : "false" });

    try {
        const { data } = await api(`${API_INV}/actual?${params}`);
        _lotes = Array.isArray(data) ? data : [];
        aplicarFiltros();
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="9" class="table-empty" style="color:#dc2626;">Error al cargar inventario</td></tr>`;
        console.error(err);
    }
}

// ─── Filtros ──────────────────────────────────
function limpiarFiltros() {
    const fn = document.getElementById("filtroNombre");
    const fl = document.getElementById("filtroLote");
    const fc = document.getElementById("filtroCaducidad");
    const fd = document.getElementById("filtroDisponibles");
    if (fn) fn.value = "";
    if (fl) fl.value = "";
    if (fc) fc.value = "";
    if (fd) fd.value = "false";
    cargarInventario();
}

function aplicarFiltros() {
    const nombre    = (document.getElementById("filtroNombre")?.value   || "").toLowerCase().trim();
    const lote      = (document.getElementById("filtroLote")?.value     || "").toLowerCase().trim();
    const caducidad =  document.getElementById("filtroCaducidad")?.value || "";

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const en7 = new Date(today);
    en7.setDate(en7.getDate() + 7);

    const filtrados = _lotes.filter(it => {
        if (nombre && !(
            (it.productoNombre || "").toLowerCase().includes(nombre) ||
            (it.productoCodigo || "").toLowerCase().includes(nombre)
        )) return false;

        if (lote && !(it.lote || "").toLowerCase().includes(lote))
            return false;

        if (caducidad) {
            const cad = it.fechaCaducidad ? new Date(it.fechaCaducidad) : null;
            if (cad) cad.setHours(0, 0, 0, 0);
            const qty = Number(it.cantidadDisponible ?? 0);
            if (caducidad === "vencido"  && !(cad && qty > 0 && cad < today))   return false;
            if (caducidad === "pronto"   && !(cad && qty > 0 && cad >= today && cad <= en7)) return false;
            if (caducidad === "ok"       && !(cad && cad > en7))                 return false;
        }

        return true;
    });

    renderTabla(filtrados);
    calcularKpis(filtrados);
}

// ─── Render tabla ─────────────────────────────
function renderTabla(lotes) {
    const tbody = document.getElementById("invTbody");
    if (!tbody) return;

    if (!lotes.length) {
        tbody.innerHTML = `<tr><td colspan="9" class="table-empty">Sin resultados para los filtros aplicados</td></tr>`;
        return;
    }

    const fmtD = v => v ? new Date(v).toLocaleDateString("es-CR") : "—";

    tbody.innerHTML = lotes.map(it => {
        const { pillClass, pillLabel } = cadPill(it);
        return `
        <tr>
            <td><code style="font-size:12px;">#${it.inventarioId}</code></td>
            <td><code style="font-size:12px;">${esc(it.productoCodigo ?? "—")}</code></td>
            <td style="font-weight:600;">${esc(it.productoNombre ?? "—")}</td>
            <td style="font-family:monospace;font-size:12px;">${esc(it.lote ?? "—")}</td>
            <td class="col-right"><strong>${it.cantidadDisponible ?? 0}</strong></td>
            <td>${fmtD(it.fechaEntrada)}</td>
            <td>
                <div class="cad-cell">
                    <span>${fmtD(it.fechaCaducidad)}</span>
                    ${pillLabel ? `<span class="cad-pill ${pillClass}">${pillLabel}</span>` : ""}
                </div>
            </td>
            <td style="color:var(--text-muted,#94a3b8);font-size:12px;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${esc(it.notas ?? "")}">
                ${esc(it.notas ?? "—")}
            </td>
            <td class="col-right">
                <button class="btn btn-sm" data-action="movs" data-id="${it.inventarioId}">Movimientos</button>
            </td>
        </tr>`;
    }).join("");
}

function cadPill(it) {
    const qty = Number(it.cantidadDisponible ?? 0);
    if (!it.fechaCaducidad) return { pillClass: "", pillLabel: "" };

    const today = new Date(); today.setHours(0,0,0,0);
    const en7   = new Date(today); en7.setDate(en7.getDate()+7);
    const cad   = new Date(it.fechaCaducidad); cad.setHours(0,0,0,0);

    if (qty > 0 && cad < today) return { pillClass: "danger", pillLabel: "Vencido" };
    if (qty > 0 && cad <= en7)  return { pillClass: "warn",   pillLabel: "Por vencer" };
    return { pillClass: "ok", pillLabel: "Vigente" };
}

function esc(v) {
    return String(v ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

// ─── KPIs ─────────────────────────────────────
function resetKpis() {
    ["kpiItems","kpiUnits","kpiExpired","kpiSoon","kpiZero"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = "—";
    });
}

function calcularKpis(lotes) {
    const today = new Date(); today.setHours(0,0,0,0);
    const en7   = new Date(today); en7.setDate(en7.getDate()+7);

    let units = 0, expired = 0, soon = 0, zero = 0;

    for (const it of lotes) {
        const qty = Number(it.cantidadDisponible ?? 0);
        units += qty;
        if (qty <= 0) zero++;
        if (it.fechaCaducidad) {
            const cad = new Date(it.fechaCaducidad); cad.setHours(0,0,0,0);
            if (qty > 0 && cad < today)           expired++;
            else if (qty > 0 && cad <= en7)        soon++;
        }
    }

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set("kpiItems",   lotes.length);
    set("kpiUnits",   units);
    set("kpiExpired", expired);
    set("kpiSoon",    soon);
    set("kpiZero",    zero);
}

// ─── Click en tabla ───────────────────────────
function onTablaClick(e) {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    if (!id) return;
    if (btn.dataset.action === "movs") abrirMovimientos(id);
}

// ─── Modal movimientos ────────────────────────
async function abrirMovimientos(inventarioId) {
    const lote = _lotes.find(l => l.inventarioId === inventarioId);
    document.getElementById("movimientosTitle").textContent =
        `Movimientos — Lote ${lote?.lote ?? "#" + inventarioId}`;
    document.getElementById("movimientosBody").innerHTML =
        `<div class="table-empty">Cargando...</div>`;
    abrirModal("modalMovimientos");

    try {
        const { data } = await api(`${API_INV}/movimientos?inventarioId=${inventarioId}`);
        const movs = Array.isArray(data) ? data : [];
        renderMovimientos(movs, inventarioId);
    } catch (err) {
        document.getElementById("movimientosBody").innerHTML =
            `<p style="color:#dc2626;padding:16px;">Error al cargar movimientos.</p>`;
        console.error(err);
    }
}

function renderMovimientos(movs, inventarioId) {
    const body = document.getElementById("movimientosBody");
    if (!body) return;

    if (!movs.length) {
        body.innerHTML = `<p class="table-empty" style="padding:20px;">Sin movimientos registrados para este lote.</p>`;
        return;
    }

    const fmtD = v => v ? new Date(v).toLocaleString("es-CR", { dateStyle:"short", timeStyle:"short" }) : "—";

    // Info del lote arriba
    const lote = _lotes.find(l => l.inventarioId === inventarioId);
    const infoHtml = lote ? `
        <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:16px;padding:12px 16px;background:var(--surface-alt,#f8fafc);border-radius:10px;border:1px solid var(--line,#e5e7eb);">
            <span style="font-size:13px;"><strong>Producto:</strong> ${esc(lote.productoNombre ?? "—")}</span>
            <span style="font-size:13px;"><strong>Lote:</strong> <code>${esc(lote.lote ?? "—")}</code></span>
            <span style="font-size:13px;"><strong>Stock actual:</strong> ${lote.cantidadDisponible ?? 0}</span>
        </div>` : "";

    body.innerHTML = infoHtml + `
        <div class="table-wrap">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Tipo movimiento</th>
                        <th class="col-right">Cantidad</th>
                        <th>Fecha</th>
                        <th>Motivo</th>
                    </tr>
                </thead>
                <tbody>
                    ${movs.map(m => `
                        <tr>
                            <td>
                                <span class="estado-pill" style="
                                    background:${tipoColor(m.tipoMovimientoCodigo).bg};
                                    color:${tipoColor(m.tipoMovimientoCodigo).text};
                                    border-color:${tipoColor(m.tipoMovimientoCodigo).border};">
                                    ${esc(m.tipoMovimientoNombre ?? m.tipoMovimientoCodigo ?? "—")}
                                </span>
                            </td>
                            <td class="col-right"><strong>${m.cantidad ?? 0}</strong></td>
                            <td>${fmtD(m.fechaMovimiento)}</td>
                            <td style="color:var(--text-muted,#94a3b8);font-size:13px;">${esc(m.motivo ?? "—")}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>`;
}

function tipoColor(codigo) {
    switch ((codigo || "").toUpperCase()) {
        case "ENTRADA":    return { bg:"#dcfce7", text:"#15803d", border:"#86efac" };
        case "SALIDA":     return { bg:"#fee2e2", text:"#dc2626", border:"#fca5a5" };
        case "VENTA":      return { bg:"#dbeafe", text:"#1d4ed8", border:"#93c5fd" };
        case "DEVOLUCION": return { bg:"#fef9c3", text:"#854d0e", border:"#fde047" };
        default:           return { bg:"#f1f5f9", text:"#64748b", border:"#e2e8f0" };
    }
}
