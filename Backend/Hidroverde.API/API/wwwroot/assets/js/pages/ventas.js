// =============================================
// pages/ventas.js — Módulo de ventas completo
// =============================================

import { api } from "../lib/http.js";
import { escapeHtml } from "../lib/dom.js";

// Estado local
let ventaActual = null;
let lineasDetalle = [];

// =============================================
// Init
// =============================================

export async function init() {
    bindBotonesCabecera();
    bindModalNuevaVenta();
    bindModalDetalleVenta();
    bindModalCambiarEstado();
    bindModalConfirmarPago();

    // Cargar catálogos y ventas en paralelo
    await Promise.all([
        cargarCatalogos(),
        cargarVentas()
    ]);
}

// =============================================
// Catálogos (selects con nombres reales)
// =============================================

async function cargarCatalogos() {
    try {
        const [clientes, empleados, estadosVenta, estadosPago, tiposEntrega, metodosPago] = await Promise.all([
            api("/api/cliente").then(r => r.data),
            api("/api/empleado").then(r => r.data),
            api("/api/estadoventa").then(r => r.data),
            api("/api/estadopago").then(r => r.data),
            api("/api/tipoentrega").then(r => r.data),
            api("/api/metodopago").then(r => r.data),
        ]);

        llenarSelect("nvClienteId",     clientes,     v => v.clienteId,     v => v.nombreComercial ?? v.nombreCompleto ?? v.nombre);
        llenarSelect("nvVendedorId",    empleados,    v => v.empleadoId,    v => `${v.nombre} ${v.apellidos}`);
        llenarSelect("nvEstadoVentaId", estadosVenta, v => v.estadoVentaId, v => v.nombre, true);
        llenarSelect("nvEstadoPagoId",  estadosPago,  v => v.estadoPagoId,  v => v.nombre, true);
        llenarSelect("nvTipoEntregaId", tiposEntrega, v => v.tipoEntregaId, v => v.nombre, true);
        llenarSelect("nvMetodoPagoId",  metodosPago,  v => v.metodoPagoId,  v => v.nombre, false, true);

        llenarSelect("ceEstadoVentaId", estadosVenta, v => v.estadoVentaId, v => v.nombre, true);
        llenarSelect("cpEstadoPagoId",  estadosPago,  v => v.estadoPagoId,  v => v.nombre, true);
        llenarSelect("cpMetodoPagoId",  metodosPago,  v => v.metodoPagoId,  v => v.nombre, true);

        // Cuando cambia cliente, cargar sus direcciones
        document.getElementById("nvClienteId")?.addEventListener("change", cargarDireccionesCliente);

    } catch (err) {
        console.error("Error cargando catálogos de ventas:", err);
    }
}

function llenarSelect(id, items, getId, getNombre, seleccionarPrimero = false, agregarVacio = false) {
    const sel = document.getElementById(id);
    if (!sel) return;
    const lista = Array.isArray(items) ? items : [];
    sel.innerHTML = "";
    if (agregarVacio) sel.innerHTML = `<option value="">Sin especificar</option>`;
    else if (!seleccionarPrimero) sel.innerHTML = `<option value="">Seleccione...</option>`;
    lista.forEach(item => {
        const opt = document.createElement("option");
        opt.value = getId(item);
        opt.textContent = getNombre(item);
        sel.appendChild(opt);
    });
}

async function cargarDireccionesCliente() {
    const clienteId = numVal("nvClienteId");
    const sel = document.getElementById("nvDireccionId");
    if (!sel) return;

    if (!clienteId) {
        sel.innerHTML = `<option value="">Seleccione cliente primero</option>`;
        return;
    }

    try {
        sel.innerHTML = `<option value="">Cargando...</option>`;
        const { data } = await api(`/api/cliente/${clienteId}/direcciones`);
        const dirs = Array.isArray(data) ? data : [];
        sel.innerHTML = dirs.length
            ? dirs.map(d => `<option value="${d.direccionId}">${escapeHtml(d.direccion ?? d.descripcion ?? `Dir #${d.direccionId}`)}</option>`).join("")
            : `<option value="">Sin direcciones</option>`;
    } catch {
        sel.innerHTML = `<option value="">Error cargando</option>`;
    }
}

// =============================================
// Tabla principal
// =============================================

async function cargarVentas() {
    const tbody = document.getElementById("tblVentasBody");
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="8" class="table-empty">Cargando...</td></tr>`;

    try {
        const { data } = await api("/api/venta");
        const lista = Array.isArray(data) ? data : [];

        if (!lista.length) {
            tbody.innerHTML = `<tr><td colspan="8" class="table-empty">No hay ventas registradas.</td></tr>`;
            return;
        }
        tbody.innerHTML = lista.map(buildRow).join("");
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="8" class="table-empty muted">Error cargando ventas.</td></tr>`;
        console.error(err);
    }
}

function buildRow(v) {
    const color = v.colorEstadoVenta ?? "#888";
    return `
    <tr>
        <td><strong>#${escapeHtml(v.ventaId)}</strong></td>
        <td>${escapeHtml(v.nombreCliente ?? "—")}</td>
        <td>${fmtDate(v.fechaPedido)}</td>
        <td>
            <span class="estado-pill" style="border-color:${color}44; background:${color}18; color:${color};">
                ${escapeHtml(v.nombreEstadoVenta ?? "—")}
            </span>
        </td>
        <td>${escapeHtml(v.nombreEstadoPago ?? "—")}</td>
        <td>${escapeHtml(v.numeroFactura ?? "—")}</td>
        <td class="col-right">${fmtMonto(v.total)}</td>
        <td class="col-right">
            <button class="btn btn-sm" data-action="ver" data-id="${v.ventaId}">Ver detalle</button>
        </td>
    </tr>`;
}

document.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-action='ver']");
    if (btn) await abrirDetalleVenta(Number(btn.dataset.id));
});

// =============================================
// Botones de cabecera
// =============================================

function bindBotonesCabecera() {
    document.getElementById("btnNuevaVenta")?.addEventListener("click", abrirModalNuevaVenta);
    document.getElementById("btnRefrescarVentas")?.addEventListener("click", cargarVentas);
}

// =============================================
// MODAL — Nueva Venta
// =============================================

function bindModalNuevaVenta() {
    document.getElementById("btnCerrarNuevaVenta")?.addEventListener("click",   () => cerrarModal("modalNuevaVenta"));
    document.getElementById("btnCancelarNuevaVenta")?.addEventListener("click", () => cerrarModal("modalNuevaVenta"));
    document.getElementById("backdropNuevaVenta")?.addEventListener("click",    () => cerrarModal("modalNuevaVenta"));
    document.getElementById("btnAgregarLinea")?.addEventListener("click",       agregarLineaDetalle);
    document.getElementById("btnGuardarVenta")?.addEventListener("click",       guardarVenta);
    document.getElementById("nvIvaMonto")?.addEventListener("input", actualizarTotalesPreview);
}

function abrirModalNuevaVenta() {
    lineasDetalle = [];
    renderLineasDetalle();
    actualizarTotalesPreview();

    document.getElementById("nvClienteId").value = "";
    document.getElementById("nvDireccionId").innerHTML = `<option value="">Seleccione cliente primero</option>`;
    document.getElementById("nvFechaEntrega").value = "";
    document.getElementById("nvNotas").value = "";
    document.getElementById("nvIvaMonto").value = "0";

    // Seleccionar primera opción de cada catálogo
    ["nvVendedorId","nvEstadoVentaId","nvEstadoPagoId","nvTipoEntregaId","nvMetodoPagoId"].forEach(id => {
        const el = document.getElementById(id);
        if (el && el.options.length > 0) el.selectedIndex = 0;
    });

    abrirModal("modalNuevaVenta");
}

function agregarLineaDetalle() {
    lineasDetalle.push({ inventarioId: "", productoId: "", cantidad: "", precioUnitario: "", descuentoUnitario: "0", notas: "" });
    renderLineasDetalle();
}

function renderLineasDetalle() {
    const tbody = document.getElementById("tblDetalleNueva");
    if (!tbody) return;

    if (!lineasDetalle.length) {
        tbody.innerHTML = `<tr><td colspan="7" class="table-empty">Agrega al menos un producto.</td></tr>`;
        return;
    }

    tbody.innerHTML = lineasDetalle.map((l, i) => `
        <tr>
            <td><input class="input-sm" type="number" min="1" value="${l.inventarioId}" data-field="inventarioId" data-idx="${i}" placeholder="ID"></td>
            <td><input class="input-sm" type="number" min="1" value="${l.productoId}"  data-field="productoId"  data-idx="${i}" placeholder="ID"></td>
            <td><input class="input-sm" type="number" min="1" value="${l.cantidad}"    data-field="cantidad"    data-idx="${i}" placeholder="0"></td>
            <td><input class="input-sm" type="number" min="0" step="0.01" value="${l.precioUnitario}"    data-field="precioUnitario"    data-idx="${i}" placeholder="0.00"></td>
            <td><input class="input-sm" type="number" min="0" step="0.01" value="${l.descuentoUnitario}" data-field="descuentoUnitario" data-idx="${i}" placeholder="0.00"></td>
            <td><input class="input-sm" type="text"  value="${l.notas}" data-field="notas" data-idx="${i}" placeholder="Opcional"></td>
            <td><button class="btn btn-sm danger" data-remove="${i}">✕</button></td>
        </tr>`
    ).join("");

    tbody.querySelectorAll("input[data-field]").forEach(inp => {
        inp.addEventListener("input", (e) => {
            lineasDetalle[Number(e.target.dataset.idx)][e.target.dataset.field] = e.target.value;
            actualizarTotalesPreview();
        });
    });

    tbody.querySelectorAll("[data-remove]").forEach(btn => {
        btn.addEventListener("click", (e) => {
            lineasDetalle.splice(Number(e.target.dataset.remove), 1);
            renderLineasDetalle();
            actualizarTotalesPreview();
        });
    });
}

function actualizarTotalesPreview() {
    const subtotal = lineasDetalle.reduce((acc, l) => {
        return acc + (Number(l.cantidad)||0) * ((Number(l.precioUnitario)||0) - (Number(l.descuentoUnitario)||0));
    }, 0);
    const iva   = Number(document.getElementById("nvIvaMonto")?.value) || 0;
    const total = subtotal + iva;

    document.getElementById("nvSubtotal").textContent  = fmtMonto(subtotal);
    document.getElementById("nvIvaPreview").textContent = fmtMonto(iva);
    document.getElementById("nvTotal").textContent      = fmtMonto(total);
}

async function guardarVenta() {
    const clienteId     = numVal("nvClienteId");
    const direccionId   = numVal("nvDireccionId");
    const vendedorId    = numVal("nvVendedorId");
    const estadoVentaId = numVal("nvEstadoVentaId");
    const estadoPagoId  = numVal("nvEstadoPagoId");
    const tipoEntregaId = numVal("nvTipoEntregaId");
    const metodoPagoId  = numVal("nvMetodoPagoId") || null;
    const ivaMonto      = Number(document.getElementById("nvIvaMonto")?.value) || 0;
    const fechaEntrega  = document.getElementById("nvFechaEntrega")?.value || null;
    const notas         = document.getElementById("nvNotas")?.value?.trim() || null;

    if (!clienteId)   return alert("Seleccione un cliente.");
    if (!direccionId) return alert("Seleccione la dirección de entrega.");
    if (!vendedorId)  return alert("Seleccione un vendedor.");
    if (!lineasDetalle.length) return alert("Agrega al menos un producto al detalle.");

    const detalle = lineasDetalle.map(l => ({
        inventarioId:      Number(l.inventarioId),
        productoId:        Number(l.productoId),
        cantidad:          Number(l.cantidad),
        precioUnitario:    Number(l.precioUnitario),
        descuentoUnitario: Number(l.descuentoUnitario) || 0,
        notas:             l.notas || null
    }));

    if (detalle.some(d => !d.inventarioId || !d.productoId || d.cantidad <= 0 || d.precioUnitario <= 0))
        return alert("Revisá que todos los campos del detalle estén completos y sean válidos.");

    try {
        const { data } = await api("/api/venta", {
            method: "POST",
            body: { clienteId, direccionEntregaId: direccionId, vendedorId, estadoVentaId, estadoPagoId, tipoEntregaId, metodoPagoId, ivaMonto, fechaEntrega, notas, detalle }
        });
        alert(`Venta creada. ID: ${data?.ventaId ?? "ok"}`);
        cerrarModal("modalNuevaVenta");
        await cargarVentas();
    } catch (err) {
        alert(err?.message || "Error creando venta.");
    }
}

// =============================================
// MODAL — Detalle de venta
// =============================================

function bindModalDetalleVenta() {
    document.getElementById("btnCerrarDetalleVenta")?.addEventListener("click",  () => cerrarModal("modalDetalleVenta"));
    document.getElementById("backdropDetalleVenta")?.addEventListener("click",   () => cerrarModal("modalDetalleVenta"));
    document.getElementById("btnCambiarEstado")?.addEventListener("click",       () => abrirModal("modalCambiarEstado"));
    document.getElementById("btnConfirmarPago")?.addEventListener("click",       () => abrirModal("modalConfirmarPago"));
    document.getElementById("btnCancelarVenta")?.addEventListener("click",       accionCancelarVenta);
    document.getElementById("btnDescargarFactura")?.addEventListener("click",    generarFacturaPDF);
}

async function abrirDetalleVenta(ventaId) {
    ventaActual = null;
    document.getElementById("detalleVentaTitle").textContent = `Venta #${ventaId}`;
    document.getElementById("detalleVentaBody").innerHTML = `<div class="table-empty">Cargando...</div>`;
    abrirModal("modalDetalleVenta");

    try {
        const { data } = await api(`/api/venta/${ventaId}`);
        ventaActual = data;
        renderDetalleVenta(data);
    } catch (err) {
        document.getElementById("detalleVentaBody").innerHTML = `<p class="danger">Error cargando venta.</p>`;
    }
}

function renderDetalleVenta(v) {
    const color = v.colorEstadoVenta ?? "#888";
    document.getElementById("detalleVentaBody").innerHTML = `
        <div class="detail-grid">
            <div class="detail-item"><span>Cliente</span><strong>${escapeHtml(v.nombreCliente)}</strong></div>
            <div class="detail-item"><span>Dirección entrega</span><strong>${escapeHtml(v.direccionEntrega)}</strong></div>
            <div class="detail-item"><span>Vendedor</span><strong>${escapeHtml(v.nombreVendedor)}</strong></div>
            <div class="detail-item"><span>Fecha pedido</span><strong>${fmtDate(v.fechaPedido)}</strong></div>
            <div class="detail-item"><span>Fecha entrega</span><strong>${fmtDate(v.fechaEntrega)}</strong></div>
            <div class="detail-item"><span>Factura</span><strong>${escapeHtml(v.numeroFactura ?? "—")}</strong></div>
            <div class="detail-item"><span>Estado venta</span>
                <span class="estado-pill" style="border-color:${color}44;background:${color}18;color:${color};">
                    ${escapeHtml(v.nombreEstadoVenta)}
                </span>
            </div>
            <div class="detail-item"><span>Estado pago</span><strong>${escapeHtml(v.nombreEstadoPago)}</strong></div>
            <div class="detail-item"><span>Método pago</span><strong>${escapeHtml(v.nombreMetodoPago ?? "—")}</strong></div>
            <div class="detail-item"><span>Tipo entrega</span><strong>${escapeHtml(v.nombreTipoEntrega)}</strong></div>
        </div>

        <h3 style="margin:16px 0 8px;font-size:15px;">Productos</h3>
        <div class="table-wrap">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Código</th>
                        <th>Cant.</th>
                        <th class="col-right">Precio unit.</th>
                        <th class="col-right">Descuento</th>
                        <th class="col-right">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${(v.detalle ?? []).map(d => `
                    <tr>
                        <td>${escapeHtml(d.nombreProducto)}</td>
                        <td>${escapeHtml(d.codigoProducto)}</td>
                        <td>${escapeHtml(d.cantidad)}</td>
                        <td class="col-right">${fmtMonto(d.precioUnitario)}</td>
                        <td class="col-right">${fmtMonto(d.descuentoUnitario)}</td>
                        <td class="col-right">${fmtMonto(d.subtotal)}</td>
                    </tr>`).join("")}
                </tbody>
            </table>
        </div>

        <div class="totales-bar" style="margin-top:12px;">
            <span>Subtotal: <strong>${fmtMonto(v.subtotal)}</strong></span>
            <span>IVA: <strong>${fmtMonto(v.ivaMonto)}</strong></span>
            <span>Total: <strong>${fmtMonto(v.total)}</strong></span>
        </div>

        ${v.notas ? `<p class="nota"><em>Notas:</em> ${escapeHtml(v.notas)}</p>` : ""}
    `;
}

// =============================================
// MODAL — Cambiar estado
// =============================================

function bindModalCambiarEstado() {
    document.getElementById("btnCerrarCambiarEstado")?.addEventListener("click",    () => cerrarModal("modalCambiarEstado"));
    document.getElementById("btnCancelarCambiarEstado")?.addEventListener("click",  () => cerrarModal("modalCambiarEstado"));
    document.getElementById("backdropCambiarEstado")?.addEventListener("click",     () => cerrarModal("modalCambiarEstado"));
    document.getElementById("btnConfirmarCambiarEstado")?.addEventListener("click", accionCambiarEstado);
}

async function accionCambiarEstado() {
    if (!ventaActual) return;
    const estadoVentaId = numVal("ceEstadoVentaId");
    const notas         = document.getElementById("ceNotas")?.value?.trim() || null;
    if (!estadoVentaId) return alert("Seleccione un estado.");

    try {
        await api(`/api/venta/${ventaActual.ventaId}/estado`, { method: "PATCH", body: { estadoVentaId, notas } });
        alert("Estado actualizado.");
        cerrarModal("modalCambiarEstado");
        await abrirDetalleVenta(ventaActual.ventaId);
        await cargarVentas();
    } catch (err) {
        alert(err?.message || "Error cambiando estado.");
    }
}

// =============================================
// MODAL — Confirmar pago
// =============================================

function bindModalConfirmarPago() {
    document.getElementById("btnCerrarConfirmarPago")?.addEventListener("click",   () => cerrarModal("modalConfirmarPago"));
    document.getElementById("btnCancelarConfirmarPago")?.addEventListener("click", () => cerrarModal("modalConfirmarPago"));
    document.getElementById("backdropConfirmarPago")?.addEventListener("click",    () => cerrarModal("modalConfirmarPago"));
    document.getElementById("btnGuardarConfirmarPago")?.addEventListener("click",  accionConfirmarPago);
}

async function accionConfirmarPago() {
    if (!ventaActual) return;
    const estadoPagoId = numVal("cpEstadoPagoId");
    const metodoPagoId = numVal("cpMetodoPagoId");
    const notas        = document.getElementById("cpNotas")?.value?.trim() || null;
    if (!estadoPagoId) return alert("Seleccione el estado de pago.");
    if (!metodoPagoId) return alert("Seleccione el método de pago.");

    try {
        await api(`/api/venta/${ventaActual.ventaId}/pago`, { method: "PATCH", body: { estadoPagoId, metodoPagoId, notas } });
        alert("Pago confirmado.");
        cerrarModal("modalConfirmarPago");
        await abrirDetalleVenta(ventaActual.ventaId);
        await cargarVentas();
    } catch (err) {
        alert(err?.message || "Error confirmando pago.");
    }
}

// =============================================
// Cancelar venta
// =============================================

async function accionCancelarVenta() {
    if (!ventaActual) return;
    const motivo = prompt("Motivo de cancelación:", "Cancelado por el cliente");
    if (motivo === null) return;
    if (!motivo.trim()) return alert("El motivo es requerido.");
    if (!confirm(`¿Cancelar la venta #${ventaActual.ventaId}?`)) return;

    try {
        await api(`/api/venta/${ventaActual.ventaId}/cancelar`, { method: "POST", body: { motivo: motivo.trim() } });
        alert("Venta cancelada.");
        cerrarModal("modalDetalleVenta");
        await cargarVentas();
    } catch (err) {
        alert(err?.message || "Error cancelando venta.");
    }
}

// =============================================
// Factura PDF — jsPDF (igual que antes)
// =============================================

async function generarFacturaPDF() {
    if (!ventaActual) return alert("No hay venta cargada.");
    if (!window.jspdf) {
        await cargarScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
    }

    const { jsPDF } = window.jspdf;
    const doc    = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const v      = ventaActual;
    const pageW  = doc.internal.pageSize.getWidth();
    const margin = 20;
    const col2   = pageW / 2;
    const verde    = [22, 163, 74];
    const grisText = [30, 30, 40];
    const grisMut  = [100, 116, 139];
    const lineClr  = [220, 220, 228];

    doc.setFillColor(...verde);
    doc.rect(0, 0, pageW, 32, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(22); doc.setTextColor(255,255,255);
    doc.text("HIDROVERDE", margin, 14);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(187,247,208);
    doc.text("Cultivos Hidropónicos Frescos", margin, 20);
    doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(255,255,255);
    doc.text("FACTURA", pageW - margin, 14, { align: "right" });
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(187,247,208);
    doc.text(v.numeroFactura ? `N° ${v.numeroFactura}` : "Sin número asignado", pageW - margin, 20, { align: "right" });
    doc.text(`Fecha: ${fmtDateSimple(v.fechaPedido)}`, pageW - margin, 26, { align: "right" });

    let y = 42;
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...grisText);
    doc.text("DATOS DEL CLIENTE", margin, y);
    doc.text("DATOS DE ENTREGA", col2, y);
    y += 6;
    doc.setLineWidth(0.3); doc.setDrawColor(...verde);
    doc.line(margin, y, col2 - 10, y);
    doc.line(col2, y, pageW - margin, y);
    y += 6;
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...grisMut);

    [["Cliente", v.nombreCliente ?? "—"],["Dirección", v.direccionEntrega ?? "—"],["Método pago", v.nombreMetodoPago ?? "—"],["Estado pago", v.nombreEstadoPago ?? "—"]].forEach(([label, valor]) => {
        doc.setFont("helvetica","bold"); doc.setTextColor(...grisMut); doc.text(`${label}:`, margin, y);
        doc.setFont("helvetica","normal"); doc.setTextColor(...grisText); doc.text(String(valor), margin + 30, y);
        y += 6;
    });
    y -= 24;
    [["Tipo entrega", v.nombreTipoEntrega ?? "—"],["Fecha entrega", v.fechaEntrega ? fmtDateSimple(v.fechaEntrega) : "—"],["Vendedor", v.nombreVendedor ?? "—"],["Estado venta", v.nombreEstadoVenta ?? "—"]].forEach(([label, valor]) => {
        doc.setFont("helvetica","bold"); doc.setTextColor(...grisMut); doc.text(`${label}:`, col2, y);
        doc.setFont("helvetica","normal"); doc.setTextColor(...grisText); doc.text(String(valor), col2 + 28, y);
        y += 6;
    });
    y += 8;

    doc.setFont("helvetica","bold"); doc.setFontSize(10); doc.setTextColor(...grisText);
    doc.text("DETALLE DE PRODUCTOS", margin, y);
    y += 4; doc.setLineWidth(0.3); doc.setDrawColor(...verde); doc.line(margin, y, pageW - margin, y); y += 5;
    doc.setFillColor(245,247,250); doc.rect(margin, y - 1, pageW - margin * 2, 8, "F");

    const colProducto = margin, colCodigo = margin+55, colCant = margin+90, colPrecio = margin+110, colDesc = margin+135, colSubtotal = pageW-margin;
    doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.setTextColor(...grisMut);
    doc.text("PRODUCTO", colProducto, y+4); doc.text("CÓDIGO", colCodigo, y+4);
    doc.text("CANT", colCant, y+4); doc.text("PRECIO", colPrecio, y+4);
    doc.text("DESC.", colDesc, y+4); doc.text("SUBTOTAL", colSubtotal, y+4, {align:"right"});
    y += 10;

    (v.detalle ?? []).forEach((d, i) => {
        if (i % 2 === 0) { doc.setFillColor(250,252,250); doc.rect(margin, y-3, pageW-margin*2, 8, "F"); }
        doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(...grisText);
        doc.text(truncate(d.nombreProducto ?? "—", 28), colProducto, y+2);
        doc.text(truncate(d.codigoProducto ?? "—", 14), colCodigo, y+2);
        doc.text(String(d.cantidad ?? 0), colCant, y+2);
        doc.text(fmtMontoRaw(d.precioUnitario), colPrecio, y+2);
        doc.text(fmtMontoRaw(d.descuentoUnitario ?? 0), colDesc, y+2);
        doc.text(fmtMontoRaw(d.subtotal ?? 0), colSubtotal, y+2, {align:"right"});
        y += 9;
    });

    y += 4; doc.setLineWidth(0.3); doc.setDrawColor(...lineClr); doc.line(pageW-margin-70, y, pageW-margin, y); y += 6;
    [["Subtotal", fmtMontoRaw(v.subtotal)],["IVA", fmtMontoRaw(v.ivaMonto)]].forEach(([label, valor]) => {
        doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(...grisMut);
        doc.text(label, pageW-margin-30, y, {align:"right"}); doc.setTextColor(...grisText);
        doc.text(valor, pageW-margin, y, {align:"right"}); y += 6;
    });
    doc.setFillColor(...verde); doc.roundedRect(pageW-margin-70, y-4, 70, 12, 2, 2, "F");
    doc.setFont("helvetica","bold"); doc.setFontSize(11); doc.setTextColor(255,255,255);
    doc.text("TOTAL", pageW-margin-30, y+4, {align:"right"});
    doc.text(fmtMontoRaw(v.total), pageW-margin-2, y+4, {align:"right"});
    y += 18;

    if (v.notas) {
        doc.setFont("helvetica","italic"); doc.setFontSize(8); doc.setTextColor(...grisMut);
        doc.text(`Notas: ${v.notas}`, margin, y);
    }

    const pageH = doc.internal.pageSize.getHeight();
    doc.setFillColor(...verde); doc.rect(0, pageH-14, pageW, 14, "F");
    doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(187,247,208);
    doc.text("HIDROVERDE — Cultivos Hidropónicos Frescos", pageW/2, pageH-6, {align:"center"});

    doc.save(v.numeroFactura ? `factura-${v.numeroFactura}.pdf` : `factura-venta-${v.ventaId}.pdf`);
}

// =============================================
// Utilidades
// =============================================

function abrirModal(id)  { const m = document.getElementById(id); if (!m) return; m.hidden = false; m.setAttribute("aria-hidden","false"); }
function cerrarModal(id) { const m = document.getElementById(id); if (!m) return; m.hidden = true;  m.setAttribute("aria-hidden","true"); }
function numVal(id) { const n = parseInt(document.getElementById(id)?.value ?? "", 10); return isNaN(n) ? 0 : n; }
function fmtMonto(n) { return new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC" }).format(Number(n ?? 0)); }
function fmtMontoRaw(n) { return `₡${Number(n ?? 0).toLocaleString("es-CR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function fmtDate(v) { if (!v) return "—"; const d = new Date(v); return isNaN(d) ? String(v) : d.toLocaleDateString("es-CR"); }
function fmtDateSimple(v) { if (!v) return "—"; const d = new Date(v); if (isNaN(d)) return String(v); const p = n => String(n).padStart(2,"0"); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`; }
function truncate(str, maxLen) { if (!str) return ""; return str.length > maxLen ? str.substring(0, maxLen-1) + "…" : str; }
function cargarScript(src) { return new Promise((resolve, reject) => { const s = document.createElement("script"); s.src = src; s.onload = resolve; s.onerror = reject; document.head.appendChild(s); }); }
