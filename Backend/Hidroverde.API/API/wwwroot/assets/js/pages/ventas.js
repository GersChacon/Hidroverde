// =============================================
// pages/ventas.js — Módulo de ventas mejorado
// =============================================

import { api } from "../lib/http.js";
import { escapeHtml } from "../lib/dom.js";

// ─── Estado local ─────────────────────────────
let ventaActual    = null;
let lineasDetalle  = [];

// Catálogos en memoria (se cargan 1 vez)
let _productos    = [];
let _inventario   = [];  // stock actual disponible
let _tiposEntrega = [];
let _estadosVenta = [];

// Estados que implican movimiento físico (domicilio)
// En DB: EN_RUTA (5) sólo aplica si hay envío a domicilio
const CODIGOS_DOMICILIO = ["ENVIO", "EXPRESS"];
const ESTADO_PENDIENTE_CODIGO  = "PENDIENTE";
const ESTADO_PAGO_PENDIENTE_ID = 1; // ID del estado "Pendiente de Pago"
const ESTADO_VENTA_PENDIENTE_ID = 1; // ID del estado "Pendiente"

// ─── Init ────────────────────────────────────
export async function init() {
    bindBotonesCabecera();
    bindModalNuevaVenta();
    bindModalDetalleVenta();
    bindModalCambiarEstado();
    bindModalConfirmarPago();

    await Promise.all([cargarCatalogos(), cargarVentas()]);
}

// ─── Catálogos ───────────────────────────────
async function cargarCatalogos() {
    try {
        const [clientes, empleados, estadosVenta, estadosPago, tiposEntrega, metodosPago, productos] = await Promise.all([
            api("/api/cliente").then(r => r.data),
            api("/api/empleado").then(r => r.data),
            api("/api/estadoventa").then(r => r.data),
            api("/api/estadopago").then(r => r.data),
            api("/api/tipoentrega").then(r => r.data),
            api("/api/metodopago").then(r => r.data),
            api("/api/producto").then(r => r.data),
        ]);

        _productos    = Array.isArray(productos)    ? productos.filter(p => p.activo) : [];
        _tiposEntrega = Array.isArray(tiposEntrega) ? tiposEntrega : [];
        _estadosVenta = Array.isArray(estadosVenta) ? estadosVenta : [];

        // --- Modal Nueva Venta ---
        llenarSelect("nvClienteId",  clientes,  v => v.clienteId,
            v => v.nombreComercial ?? `${v.nombre ?? ""} ${v.apellidos ?? ""}`.trim() ?? `Cliente #${v.clienteId}`);

        llenarSelect("nvVendedorId", empleados, v => v.empleadoId,
            v => `${v.nombre} ${v.apellidos ?? ""}`.trim());

        // Tipo entrega
        llenarSelect("nvTipoEntregaId", _tiposEntrega, v => v.tipoEntregaId, v => v.nombre, true);

        // Método de pago (opcional)
        llenarSelect("nvMetodoPagoId", metodosPago, v => v.metodoPagoId, v => v.nombre, false, true);

        // Estado venta: al crear SÓLO "Pendiente" — el usuario no debe saltar estados
        const soloPendiente = _estadosVenta.filter(e => e.codigo === ESTADO_PENDIENTE_CODIGO || e.estadoVentaId === ESTADO_VENTA_PENDIENTE_ID);
        llenarSelect("nvEstadoVentaId", soloPendiente.length ? soloPendiente : _estadosVenta.slice(0,1),
            v => v.estadoVentaId, v => v.nombre, true);
        document.getElementById("nvEstadoVentaId")?.setAttribute("disabled", "true");

        // Estado pago: siempre "Pendiente de Pago" al crear — se confirma después
        llenarSelect("nvEstadoPagoId", estadosPago.filter(e => e.codigo === "PENDIENTE" || e.estadoPagoId === ESTADO_PAGO_PENDIENTE_ID),
            v => v.estadoPagoId, v => v.nombre, true);
        document.getElementById("nvEstadoPagoId")?.setAttribute("disabled", "true");

        // Modales secundarios (cambiar estado / confirmar pago)
        llenarSelect("ceEstadoVentaId", estadosVenta, v => v.estadoVentaId, v => v.nombre, true);
        llenarSelect("cpEstadoPagoId",  estadosPago,  v => v.estadoPagoId,  v => v.nombre, true);
        llenarSelect("cpMetodoPagoId",  metodosPago,  v => v.metodoPagoId,  v => v.nombre, true);

        // Cuando cambia cliente → cargar sus direcciones
        document.getElementById("nvClienteId")?.addEventListener("change", cargarDireccionesCliente);

        // Cuando cambia tipo entrega → filtrar estados de venta disponibles en modal cambiar estado
        document.getElementById("nvTipoEntregaId")?.addEventListener("change", actualizarInfoEntrega);

        // Fecha mínima = hoy
        const ahora = new Date();
        const minDate = ahora.toISOString().slice(0, 16);
        const fechaInput = document.getElementById("nvFechaEntrega");
        if (fechaInput) {
            fechaInput.min = minDate;
            fechaInput.addEventListener("change", () => {
                if (fechaInput.value && fechaInput.value < minDate) {
                    fechaInput.value = minDate;
                    alert("La fecha de entrega no puede ser anterior a hoy.");
                }
            });
        }

    } catch (err) {
        console.error("Error cargando catálogos de ventas:", err);
    }
}

function actualizarInfoEntrega() {
    const sel = document.getElementById("nvTipoEntregaId");
    const tipoId = Number(sel?.value);
    const tipoEntrega = _tiposEntrega.find(t => t.tipoEntregaId === tipoId);
    const esDomicilio = tipoEntrega ? CODIGOS_DOMICILIO.includes(tipoEntrega.codigo) : false;

    // Mostrar/ocultar campo fecha entrega según tipo
    const wrapFecha = document.getElementById("wrapFechaEntrega");
    if (wrapFecha) wrapFecha.style.display = "block"; // siempre visible

    // Mostrar nota informativa
    const nota = document.getElementById("nvNotaEntrega");
    if (nota) {
        if (esDomicilio) {
            nota.textContent = "📦 Envío a domicilio: el estado de venta podrá avanzar hasta 'En Ruta' y 'Entregado'.";
            nota.style.display = "block";
        } else {
            nota.textContent = "🏪 Retiro en local: el estado de venta avanzará hasta 'Listo para Entrega'.";
            nota.style.display = "block";
        }
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
        opt.value   = getId(item);
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
        const dirs = Array.isArray(data) ? data.filter(d => d.activa !== false) : [];

        if (!dirs.length) {
            sel.innerHTML = `<option value="">Sin direcciones registradas</option>`;
            return;
        }

        sel.innerHTML = dirs.map(d => {
            const label = d.alias
                ? `${escapeHtml(d.alias)} — ${escapeHtml(d.direccionExacta ?? "")}`
                : escapeHtml(d.direccionExacta ?? d.descripcion ?? `Dir #${d.direccionId}`);
            return `<option value="${d.direccionId}">${label}</option>`;
        }).join("");

        // Si sólo hay una, la seleccionamos automáticamente
        if (dirs.length === 1) sel.selectedIndex = 0;

    } catch {
        sel.innerHTML = `<option value="">Error cargando direcciones</option>`;
    }
}

// ─── Tabla principal ─────────────────────────
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
        <td><strong>#${escapeHtml(String(v.ventaId))}</strong></td>
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

// ─── Botones de cabecera ──────────────────────
function bindBotonesCabecera() {
    document.getElementById("btnNuevaVenta")?.addEventListener("click",    abrirModalNuevaVenta);
    document.getElementById("btnRefrescarVentas")?.addEventListener("click", cargarVentas);
}

// ─── MODAL — Nueva Venta ──────────────────────
function bindModalNuevaVenta() {
    document.getElementById("btnCerrarNuevaVenta")?.addEventListener("click",   () => cerrarModal("modalNuevaVenta"));
    document.getElementById("btnCancelarNuevaVenta")?.addEventListener("click", () => cerrarModal("modalNuevaVenta"));
    document.getElementById("backdropNuevaVenta")?.addEventListener("click",    () => cerrarModal("modalNuevaVenta"));
    document.getElementById("btnAgregarLinea")?.addEventListener("click",       agregarLineaDetalle);
    document.getElementById("btnGuardarVenta")?.addEventListener("click",       guardarVenta);
    document.getElementById("nvIvaMonto")?.addEventListener("input",            actualizarTotalesPreview);
}

function abrirModalNuevaVenta() {
    lineasDetalle = [];
    renderLineasDetalle();
    actualizarTotalesPreview();

    // Resetear campos
    ["nvClienteId","nvVendedorId","nvTipoEntregaId","nvMetodoPagoId"].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.removeAttribute("disabled"); el.selectedIndex = 0; }
    });

    // Estados bloqueados al crear — siempre Pendiente
    const estadoVentaSel = document.getElementById("nvEstadoVentaId");
    if (estadoVentaSel) { estadoVentaSel.selectedIndex = 0; estadoVentaSel.setAttribute("disabled","true"); }
    const estadoPagoSel = document.getElementById("nvEstadoPagoId");
    if (estadoPagoSel) { estadoPagoSel.selectedIndex = 0; estadoPagoSel.setAttribute("disabled","true"); }

    document.getElementById("nvDireccionId").innerHTML = `<option value="">Seleccione cliente primero</option>`;
    document.getElementById("nvFechaEntrega").value  = "";
    document.getElementById("nvNotas").value         = "";
    document.getElementById("nvIvaMonto").value      = "0";

    // Ocultar nota de entrega
    const nota = document.getElementById("nvNotaEntrega");
    if (nota) nota.style.display = "none";

    abrirModal("modalNuevaVenta");
}

// ─── Detalle de productos ─────────────────────

function agregarLineaDetalle() {
    lineasDetalle.push({ productoId: "", inventarioId: "", cantidad: 1, precioUnitario: 0, stockDisponible: null, notas: "" });
    renderLineasDetalle();
}

function renderLineasDetalle() {
    const tbody = document.getElementById("tblDetalleNueva");
    if (!tbody) return;

    if (!lineasDetalle.length) {
        tbody.innerHTML = `<tr><td colspan="6" class="table-empty">Agregá al menos un producto.</td></tr>`;
        return;
    }

    tbody.innerHTML = lineasDetalle.map((l, i) => {
        const optsProducto = _productos.map(p =>
            `<option value="${p.productoId}" ${Number(l.productoId) === p.productoId ? "selected" : ""}>${escapeHtml(p.nombreProducto)}</option>`
        ).join("");

        const stockTxt = l.stockDisponible !== null
            ? `<span class="stock-badge ${l.stockDisponible > 0 ? "ok" : "agotado"}">${l.stockDisponible} disponibles</span>`
            : `<span class="stock-badge muted">—</span>`;

        return `
        <tr data-row="${i}">
            <td style="min-width:180px;">
                <select class="input-sm" data-field="productoId" data-idx="${i}">
                    <option value="">Seleccione producto...</option>
                    ${optsProducto}
                </select>
            </td>
            <td style="min-width:100px; text-align:center;">${stockTxt}</td>
            <td style="min-width:80px;">
                <input class="input-sm" type="number" min="1"
                    max="${l.stockDisponible ?? 9999}"
                    value="${l.cantidad}"
                    data-field="cantidad" data-idx="${i}" placeholder="0">
            </td>
            <td style="min-width:100px;">
                <input class="input-sm" type="number" min="0" step="0.01"
                    value="${l.precioUnitario}"
                    data-field="precioUnitario" data-idx="${i}" placeholder="0.00" readonly>
            </td>
            <td style="min-width:120px;">
                <input class="input-sm" type="text" value="${escapeHtml(l.notas ?? "")}"
                    data-field="notas" data-idx="${i}" placeholder="Opcional">
            </td>
            <td><button class="btn btn-sm danger" data-remove="${i}">✕</button></td>
        </tr>`;
    }).join("");

    // Evento cambio de producto → cargar stock y precio
    tbody.querySelectorAll("select[data-field='productoId']").forEach(sel => {
        sel.addEventListener("change", async (e) => {
            const idx = Number(e.target.dataset.idx);
            const productoId = Number(e.target.value);
            lineasDetalle[idx].productoId = productoId;
            lineasDetalle[idx].inventarioId = "";
            lineasDetalle[idx].stockDisponible = null;
            lineasDetalle[idx].precioUnitario  = 0;

            if (productoId) await cargarStockYPrecio(idx, productoId);
            else renderLineasDetalle();
        });
    });

    // Evento cantidad
    tbody.querySelectorAll("input[data-field='cantidad']").forEach(inp => {
        inp.addEventListener("input", e => {
            const idx = Number(e.target.dataset.idx);
            lineasDetalle[idx].cantidad = Number(e.target.value) || 0;
            actualizarTotalesPreview();
        });
    });

    // Evento notas
    tbody.querySelectorAll("input[data-field='notas']").forEach(inp => {
        inp.addEventListener("input", e => {
            const idx = Number(e.target.dataset.idx);
            lineasDetalle[idx].notas = e.target.value;
        });
    });

    // Eliminar línea
    tbody.querySelectorAll("[data-remove]").forEach(btn => {
        btn.addEventListener("click", e => {
            lineasDetalle.splice(Number(e.target.dataset.remove), 1);
            renderLineasDetalle();
            actualizarTotalesPreview();
        });
    });
}

async function cargarStockYPrecio(idx, productoId) {
    try {
        // Precio base del producto
        const producto = _productos.find(p => p.productoId === productoId);
        if (producto) {
            lineasDetalle[idx].precioUnitario = Number(producto.precioBase) || 0;
        }

        // Cargar TODOS los lotes disponibles del producto
        const { data } = await api(`/api/inventario/actual?productoId=${productoId}&soloDisponibles=true`);
        const lotes = Array.isArray(data) ? data.filter(i => Number(i.cantidadDisponible) > 0) : [];

        // Stock total = suma de todos los lotes
        const totalStock = lotes.reduce((sum, l) => sum + Number(l.cantidadDisponible), 0);

        // Guardar lotes para distribuir al guardar (multi-lote)
        lineasDetalle[idx].lotes           = lotes.sort((a, b) => b.cantidadDisponible - a.cantidadDisponible);
        lineasDetalle[idx].stockDisponible  = totalStock;
        // inventarioId del lote principal (el de más stock) — se usa si toda la cantidad cabe en uno
        lineasDetalle[idx].inventarioId    = lotes.length ? lotes[0].inventarioId : "";

    } catch (err) {
        console.warn("Error cargando stock/precio:", err);
        lineasDetalle[idx].lotes           = [];
        lineasDetalle[idx].stockDisponible  = 0;
        lineasDetalle[idx].inventarioId    = "";
    }

    renderLineasDetalle();
    actualizarTotalesPreview();
}

function actualizarTotalesPreview() {
    const subtotal = lineasDetalle.reduce((acc, l) => {
        return acc + (Number(l.cantidad) || 0) * (Number(l.precioUnitario) || 0);
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
    const estadoVentaId = numVal("nvEstadoVentaId") || ESTADO_VENTA_PENDIENTE_ID;
    const estadoPagoId  = numVal("nvEstadoPagoId")  || ESTADO_PAGO_PENDIENTE_ID;
    const tipoEntregaId = numVal("nvTipoEntregaId");
    const metodoPagoId  = numVal("nvMetodoPagoId")  || null;
    const ivaMonto      = Number(document.getElementById("nvIvaMonto")?.value) || 0;
    const notas         = document.getElementById("nvNotas")?.value?.trim() || null;

    // Fecha entrega — validar que no sea en el pasado
    const fechaEntregaVal = document.getElementById("nvFechaEntrega")?.value || null;
    const fechaEntrega    = fechaEntregaVal || null;
    if (fechaEntrega) {
        const hoy = new Date(); hoy.setSeconds(0, 0);
        if (new Date(fechaEntrega) < hoy) {
            return alert("La fecha de entrega no puede ser anterior a la fecha actual.");
        }
    }

    if (!clienteId)     return alert("Seleccione un cliente.");
    if (!direccionId)   return alert("Seleccione la dirección de entrega.");
    if (!vendedorId)    return alert("Seleccione un vendedor.");
    if (!tipoEntregaId) return alert("Seleccione el tipo de entrega.");
    if (!lineasDetalle.length) return alert("Agregá al menos un producto al detalle.");

    // Validar líneas
    for (let i = 0; i < lineasDetalle.length; i++) {
        const l = lineasDetalle[i];
        if (!l.productoId)           return alert(`Línea ${i + 1}: seleccioná un producto.`);
        if (!(l.cantidad > 0))       return alert(`Línea ${i + 1}: la cantidad debe ser mayor a 0.`);
        if (!(l.precioUnitario > 0)) return alert(`Línea ${i + 1}: el precio unitario debe ser mayor a 0.`);
        if (!l.lotes || !l.lotes.length)
            return alert(`Línea ${i + 1}: no hay inventario disponible para este producto.`);
        if (l.cantidad > l.stockDisponible)
            return alert(`Línea ${i + 1}: la cantidad (${l.cantidad}) supera el stock total disponible (${l.stockDisponible}).`);
    }

    // ── Distribución multi-lote ──────────────────────────────────────────
    // Si la cantidad de una línea supera un solo lote, se generan sub-líneas
    // automáticamente consumiendo lotes en orden descendente de stock.
    const detalle = [];
    for (const l of lineasDetalle) {
        let restante = Number(l.cantidad);
        for (const lote of l.lotes) {
            if (restante <= 0) break;
            const disponible  = Number(lote.cantidadDisponible);
            const consumir    = Math.min(restante, disponible);
            detalle.push({
                inventarioId:      lote.inventarioId,
                productoId:        Number(l.productoId),
                cantidad:          consumir,
                precioUnitario:    Number(l.precioUnitario),
                descuentoUnitario: 0,
                notas:             l.notas || null
            });
            restante -= consumir;
        }
    }

    try {
        const { data } = await api("/api/venta", {
            method: "POST",
            body: {
                clienteId, direccionEntregaId: direccionId, vendedorId,
                estadoVentaId, estadoPagoId, tipoEntregaId, metodoPagoId,
                ivaMonto, fechaEntrega, notas, detalle
            }
        });
        alert(`✅ Venta creada correctamente. ID: #${data?.ventaId ?? "ok"}`);
        cerrarModal("modalNuevaVenta");
        await cargarVentas();
    } catch (err) {
        alert(`❌ ${err?.message || "Error al crear la venta."}`);
    }
}

// ─── MODAL — Detalle de venta ─────────────────
function bindModalDetalleVenta() {
    document.getElementById("btnCerrarDetalleVenta")?.addEventListener("click",  () => cerrarModal("modalDetalleVenta"));
    document.getElementById("backdropDetalleVenta")?.addEventListener("click",   () => cerrarModal("modalDetalleVenta"));
    document.getElementById("btnCambiarEstado")?.addEventListener("click",       abrirModalCambiarEstado);
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
    } catch {
        document.getElementById("detalleVentaBody").innerHTML = `<p class="danger">Error cargando la venta.</p>`;
    }
}

function renderDetalleVenta(v) {
    const color = v.colorEstadoVenta ?? "#888";

    // Determinar si la venta está en estado terminal para ocultar botones irrelevantes
    const codigoEstado  = _estadosVenta.find(e => e.estadoVentaId === v.estadoVentaId)?.codigo ?? "";
    const esTerminal    = codigoEstado === "ENTREGADO" || codigoEstado === "CANCELADO";
    const esCancelado   = codigoEstado === "CANCELADO";

    // Botones del footer según estado
    const btnCambiarEstado = document.getElementById("btnCambiarEstado");
    const btnCancelarVenta = document.getElementById("btnCancelarVenta");
    if (btnCambiarEstado) btnCambiarEstado.style.display = esTerminal ? "none" : "";
    if (btnCancelarVenta) btnCancelarVenta.style.display = esCancelado ? "none" : "";

    document.getElementById("detalleVentaBody").innerHTML = `
        <div class="detail-grid">
            <div class="detail-item"><span>Cliente</span><strong>${escapeHtml(v.nombreCliente)}</strong></div>
            <div class="detail-item"><span>Dirección entrega</span><strong>${escapeHtml(v.direccionEntrega)}</strong></div>
            <div class="detail-item"><span>Vendedor</span><strong>${escapeHtml(v.nombreVendedor)}</strong></div>
            <div class="detail-item"><span>Fecha pedido</span><strong>${fmtDate(v.fechaPedido)}</strong></div>
            <div class="detail-item">
                <span>Fecha entrega</span>
                <strong>${v.fechaEntrega ? fmtDateTime(v.fechaEntrega) : '<em style="color:var(--text-muted,#94a3b8)">No especificada</em>'}</strong>
            </div>
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
                        <th>Lote / Inv.</th>
                        <th>Cant.</th>
                        <th class="col-right">Precio unit.</th>
                        <th class="col-right">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${(v.detalle ?? []).map(d => `
                    <tr>
                        <td>${escapeHtml(d.nombreProducto)}</td>
                        <td>${escapeHtml(d.codigoProducto ?? "—")}</td>
                        <td style="color:var(--text-muted,#94a3b8);font-size:12px;">#${d.inventarioId}</td>
                        <td>${escapeHtml(String(d.cantidad))}</td>
                        <td class="col-right">${fmtMonto(d.precioUnitario)}</td>
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

        ${v.notas ? `<p class="nota" style="margin-top:10px;"><em>Notas:</em> ${escapeHtml(v.notas)}</p>` : ""}
    `;
}

// ─── MODAL — Cambiar estado ───────────────────
function bindModalCambiarEstado() {
    document.getElementById("btnCerrarCambiarEstado")?.addEventListener("click",    () => cerrarModal("modalCambiarEstado"));
    document.getElementById("btnCancelarCambiarEstado")?.addEventListener("click",  () => cerrarModal("modalCambiarEstado"));
    document.getElementById("backdropCambiarEstado")?.addEventListener("click",     () => cerrarModal("modalCambiarEstado"));
    document.getElementById("btnConfirmarCambiarEstado")?.addEventListener("click", accionCambiarEstado);
}

function abrirModalCambiarEstado() {
    if (!ventaActual) return;

    // Usar código de tipo entrega directo de la venta (viene del SP actualizado)
    // Fallback: buscar en catálogo local si el SP aún no fue actualizado
    const codigoEntrega = ventaActual.codigoTipoEntrega
        ?? _tiposEntrega.find(t => t.tipoEntregaId === ventaActual.tipoEntregaId)?.codigo
        ?? "";
    const esDomicilio   = CODIGOS_DOMICILIO.includes(codigoEntrega);

    // Orden actual del estado de la venta (del SP actualizado, o fallback 0)
    const ordenActual   = ventaActual.ordenEstadoVenta ?? 0;
    const estadoActualId = ventaActual.estadoVentaId;

    // Bloquear si ya está en estado terminal
    const codigoActual = _estadosVenta.find(e => e.estadoVentaId === estadoActualId)?.codigo ?? "";
    if (codigoActual === "ENTREGADO" || codigoActual === "CANCELADO") {
        alert("Esta venta está en un estado terminal y no puede modificarse.");
        return;
    }

    // Sólo mostrar estados con orden > al actual (avanzar, nunca retroceder)
    // y no mostrar EN_RUTA si no es domicilio.
    // También excluir CANCELADO del flujo normal (para eso está el botón "Cancelar venta").
    const estadosFiltrados = _estadosVenta.filter(e => {
        if (!e.activo) return false;
        if (e.codigo === "CANCELADO") return false;             // se cancela con su propio botón
        if (e.orden <= ordenActual) return false;              // no retroceder ni quedarse igual
        if (e.codigo === "EN_RUTA" && !esDomicilio) return false; // EN_RUTA solo para domicilio
        return true;
    });

    const sel = document.getElementById("ceEstadoVentaId");
    if (sel) {
        if (!estadosFiltrados.length) {
            sel.innerHTML = `<option value="">No hay estados disponibles</option>`;
        } else {
            sel.innerHTML = estadosFiltrados.map(e =>
                `<option value="${e.estadoVentaId}">${escapeHtml(e.nombre)}</option>`
            ).join("");
        }
    }

    // Nota informativa
    const nota = document.getElementById("ceNotaEntrega");
    if (nota) {
        nota.textContent = esDomicilio
            ? "📦 Entrega a domicilio — el estado puede avanzar hasta Entregado pasando por En Ruta."
            : "🏪 Retiro en local — el estado avanza hasta Listo para Entrega y luego Entregado (sin En Ruta).";
        nota.style.display = "block";
    }

    document.getElementById("ceNotas").value = "";
    abrirModal("modalCambiarEstado");
}

async function accionCambiarEstado() {
    if (!ventaActual) return;
    const estadoVentaId = numVal("ceEstadoVentaId");
    const notas         = document.getElementById("ceNotas")?.value?.trim() || null;
    if (!estadoVentaId) return alert("Seleccioná un estado.");

    try {
        await api(`/api/venta/${ventaActual.ventaId}/estado`, { method: "PATCH", body: { estadoVentaId, notas } });
        alert("Estado actualizado correctamente.");
        cerrarModal("modalCambiarEstado");
        await abrirDetalleVenta(ventaActual.ventaId);
        await cargarVentas();
    } catch (err) {
        alert(err?.message || "Error cambiando el estado.");
    }
}

// ─── MODAL — Confirmar pago ───────────────────
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
    if (!estadoPagoId) return alert("Seleccioná el estado de pago.");
    if (!metodoPagoId) return alert("Seleccioná el método de pago.");

    try {
        await api(`/api/venta/${ventaActual.ventaId}/pago`, { method: "PATCH", body: { estadoPagoId, metodoPagoId, notas } });
        alert("Pago confirmado correctamente.");
        cerrarModal("modalConfirmarPago");
        await abrirDetalleVenta(ventaActual.ventaId);
        await cargarVentas();
    } catch (err) {
        alert(err?.message || "Error confirmando el pago.");
    }
}

// ─── Cancelar venta ───────────────────────────
async function accionCancelarVenta() {
    if (!ventaActual) return;
    const motivo = prompt("Motivo de cancelación:", "Cancelado por el cliente");
    if (motivo === null) return;
    if (!motivo.trim()) return alert("El motivo es requerido.");
    if (!confirm(`¿Cancelar la venta #${ventaActual.ventaId}?\n\nEsta acción devolverá el stock al inventario.`)) return;

    try {
        await api(`/api/venta/${ventaActual.ventaId}/cancelar`, { method: "POST", body: { motivo: motivo.trim() } });
        alert("Venta cancelada.");
        cerrarModal("modalDetalleVenta");
        await cargarVentas();
    } catch (err) {
        alert(err?.message || "Error cancelando la venta.");
    }
}

// ─── Factura PDF ──────────────────────────────
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

    const colProducto = margin, colCodigo = margin+55, colCant = margin+90, colPrecio = margin+115, colSubtotal = pageW-margin;
    doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.setTextColor(...grisMut);
    doc.text("PRODUCTO", colProducto, y+4); doc.text("CÓDIGO", colCodigo, y+4);
    doc.text("CANT", colCant, y+4); doc.text("PRECIO", colPrecio, y+4);
    doc.text("SUBTOTAL", colSubtotal, y+4, {align:"right"});
    y += 10;

    (v.detalle ?? []).forEach((d, i) => {
        if (i % 2 === 0) { doc.setFillColor(250,252,250); doc.rect(margin, y-3, pageW-margin*2, 8, "F"); }
        doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(...grisText);
        doc.text(truncate(d.nombreProducto ?? "—", 28), colProducto, y+2);
        doc.text(truncate(d.codigoProducto ?? "—", 14), colCodigo, y+2);
        doc.text(String(d.cantidad ?? 0), colCant, y+2);
        doc.text(fmtMontoRaw(d.precioUnitario), colPrecio, y+2);
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

// ─── Utilidades ───────────────────────────────
function abrirModal(id)  { const m = document.getElementById(id); if (!m) return; m.hidden = false; m.setAttribute("aria-hidden","false"); }
function cerrarModal(id) { const m = document.getElementById(id); if (!m) return; m.hidden = true;  m.setAttribute("aria-hidden","true"); }
function numVal(id) { const n = parseInt(document.getElementById(id)?.value ?? "", 10); return isNaN(n) ? 0 : n; }
function fmtMonto(n) { return new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC" }).format(Number(n ?? 0)); }
function fmtMontoRaw(n) { return `₡${Number(n ?? 0).toLocaleString("es-CR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function fmtDate(v) { if (!v) return "—"; const d = new Date(v); return isNaN(d) ? String(v) : d.toLocaleDateString("es-CR"); }
function fmtDateTime(v) { if (!v) return "—"; const d = new Date(v); if (isNaN(d)) return String(v); return d.toLocaleDateString("es-CR") + " " + d.toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" }); }
function fmtDateSimple(v) { if (!v) return "—"; const d = new Date(v); if (isNaN(d)) return String(v); const p = n => String(n).padStart(2,"0"); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`; }
function truncate(str, maxLen) { if (!str) return ""; return str.length > maxLen ? str.substring(0, maxLen-1) + "…" : str; }
function cargarScript(src) { return new Promise((resolve, reject) => { const s = document.createElement("script"); s.src = src; s.onload = resolve; s.onerror = reject; document.head.appendChild(s); }); }
