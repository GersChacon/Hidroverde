const API_MARGENES = "/api/compras-plantas/margenes";
const API_COMPRAS = "/api/compras-plantas";
const API_COMPRAS_DETALLE = "/api/compras-plantas/detalle";
const API_COMPRAS_MERMA = "/api/compras-plantas/merma";
const API_PROVEEDORES = "/api/proveedores/lista";
const API_PRODUCTOS = "/api/Producto";
const API_DETALLE_PARA_MERMA = "/api/compras-plantas/detalle-por-producto-proveedor";

const EMPLEADO_ID_DEFAULT = 1;

const UNIDADES = [
    { id: 1, nombre: "Unidad", simbolo: "u" },
    { id: 2, nombre: "Racimo", simbolo: "rac" },
    { id: 3, nombre: "Bandeja", simbolo: "bdj" },
    { id: 4, nombre: "Kilogramo", simbolo: "kg" },
    { id: 5, nombre: "Gramo", simbolo: "g" },
    { id: 6, nombre: "Paquete", simbolo: "paq" },
    { id: 7, nombre: "Atado", simbolo: "atd" }
];

let margenesOriginal = [];
let margenesFiltrados = [];
let detalleActual = null;

function $(id) {
    return document.getElementById(id);
}

async function apiFetch(url, options = {}) {
    const response = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        ...options
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Error HTTP ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
        return response.json();
    }

    return null;
}

function normalizarLista(result) {
    if (Array.isArray(result?.data)) return result.data;
    if (Array.isArray(result)) return result;
    return [];
}

function abrirModal(id) {
    const el = $(id);
    if (el) el.hidden = false;
}

function cerrarModal(id) {
    const el = $(id);
    if (el) el.hidden = true;
}

function limpiarInput(id) {
    const el = $(id);
    if (el) el.value = "";
}

function limpiarSelect(id) {
    const el = $(id);
    if (el) el.value = "";
}

function obtenerNumero(id) {
    const el = $(id);
    if (!el) return 0;
    return Number(el.value || 0);
}

function obtenerTexto(id) {
    const el = $(id);
    if (!el) return "";
    return (el.value || "").trim();
}

function formatearNumero(valor, decimales = 2) {
    const numero = Number(valor || 0);
    return numero.toLocaleString("es-CR", {
        minimumFractionDigits: decimales,
        maximumFractionDigits: decimales
    });
}

function formatearMoneda(valor) {
    const numero = Number(valor || 0);
    return numero.toLocaleString("es-CR", {
        style: "currency",
        currency: "CRC",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function claseMargen(valor) {
    const n = Number(valor || 0);
    if (n < 0) return "mu-badge mu-badge--negativo";
    if (n < 20) return "mu-badge mu-badge--medio";
    return "mu-badge mu-badge--positivo";
}

function cerrarDetalle() {
    const panel = $("muDetallePanel");
    if (panel) panel.hidden = true;
    detalleActual = null;
}

function mostrarDetalle(item) {
    detalleActual = item;

    if ($("muDetalleProducto")) $("muDetalleProducto").textContent = item.nombreProducto ?? "-";
    if ($("muDetalleProveedor")) $("muDetalleProveedor").textContent = item.proveedorNombre ?? "-";
    if ($("muDetalleCostoTotal")) $("muDetalleCostoTotal").textContent = formatearMoneda(item.costoTotal);
    if ($("muDetalleCostoInicial")) $("muDetalleCostoInicial").textContent = formatearMoneda(item.costoUnitarioInicial);
    if ($("muDetalleCostoReal")) $("muDetalleCostoReal").textContent = formatearMoneda(item.costoUnitarioReal);
    if ($("muDetalleMargenUnitario")) $("muDetalleMargenUnitario").textContent = formatearMoneda(item.margenUnitario);

    if ($("muDetalleTitulo")) $("muDetalleTitulo").textContent = `Detalle de ${item.nombreProducto ?? ""}`;
    if ($("muDetalleSubtitulo")) $("muDetalleSubtitulo").textContent = `Proveedor: ${item.proveedorNombre ?? "-"}`;

    const panel = $("muDetallePanel");
    if (panel) panel.hidden = false;
}

function renderResumen(data) {
    if ($("muTotalRegistros")) $("muTotalRegistros").textContent = data.length;

    const mejorMargen = data.length
        ? Math.max(...data.map(x => Number(x.margenPorcentaje || 0)))
        : 0;

    const peorMargen = data.length
        ? Math.min(...data.map(x => Number(x.margenPorcentaje || 0)))
        : 0;

    const mayorMerma = data.length
        ? Math.max(...data.map(x => Number(x.cantidadMerma || 0)))
        : 0;

    const topMargen = data.length
        ? [...data].sort((a, b) => Number(b.margenPorcentaje || 0) - Number(a.margenPorcentaje || 0))[0]
        : null;

    if ($("muMejorMargen")) $("muMejorMargen").textContent = `${formatearNumero(mejorMargen)}%`;
    if ($("muPeorMargen")) $("muPeorMargen").textContent = `${formatearNumero(peorMargen)}%`;
    if ($("muMayorMerma")) $("muMayorMerma").textContent = formatearNumero(mayorMerma);
    if ($("muProveedorTop")) $("muProveedorTop").textContent = topMargen?.proveedorNombre || "-";
    if ($("muProductoTop")) $("muProductoTop").textContent = topMargen?.nombreProducto || "-";
}

function renderTabla(data) {
    const tbody = $("tbodyMargenesUtilidad");
    const estado = $("margenesEstado");

    if (!tbody || !estado) return;

    tbody.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
        estado.textContent = "No hay datos para mostrar.";
        estado.style.display = "block";
        cerrarDetalle();
        return;
    }

    estado.style.display = "none";

    for (const item of data) {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${item.nombreProducto ?? ""}</td>
            <td>${item.proveedorNombre ?? ""}</td>
            <td>${formatearNumero(item.cantidadComprada)}</td>
            <td>${formatearNumero(item.cantidadMerma)}</td>
            <td>${formatearNumero(item.cantidadUtil)}</td>
            <td>${formatearMoneda(item.costoUnitarioReal)}</td>
            <td>${formatearMoneda(item.precioBase)}</td>
            <td>
                <span class="${claseMargen(item.margenPorcentaje)}">
                    ${formatearNumero(item.margenPorcentaje)}%
                </span>
            </td>
            <td>
                <button
                    class="btn btn--xs btn-ver-detalle"
                    data-producto="${item.productoId}"
                    data-proveedor="${item.proveedorId}">
                    Ver
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    }
}

function aplicarFiltros() {
    const filtroProducto = obtenerTexto("txtFiltroProducto").toLowerCase();
    const filtroProveedor = obtenerTexto("txtFiltroProveedor").toLowerCase();
    const orden = $("selOrdenMargen")?.value || "margenDesc";

    let data = [...margenesOriginal];

    if (filtroProducto) {
        data = data.filter(x =>
            (x.nombreProducto || "").toLowerCase().includes(filtroProducto)
        );
    }

    if (filtroProveedor) {
        data = data.filter(x =>
            (x.proveedorNombre || "").toLowerCase().includes(filtroProveedor)
        );
    }

    switch (orden) {
        case "margenAsc":
            data.sort((a, b) => Number(a.margenPorcentaje || 0) - Number(b.margenPorcentaje || 0));
            break;
        case "mermaDesc":
            data.sort((a, b) => Number(b.cantidadMerma || 0) - Number(a.cantidadMerma || 0));
            break;
        case "productoAsc":
            data.sort((a, b) => (a.nombreProducto || "").localeCompare(b.nombreProducto || ""));
            break;
        case "proveedorAsc":
            data.sort((a, b) => (a.proveedorNombre || "").localeCompare(b.proveedorNombre || ""));
            break;
        default:
            data.sort((a, b) => Number(b.margenPorcentaje || 0) - Number(a.margenPorcentaje || 0));
            break;
    }

    margenesFiltrados = data;
    renderResumen(margenesFiltrados);
    renderTabla(margenesFiltrados);
    cerrarDetalle();
}

function limpiarFiltros() {
    limpiarInput("txtFiltroProducto");
    limpiarInput("txtFiltroProveedor");

    if ($("selOrdenMargen")) {
        $("selOrdenMargen").value = "margenDesc";
    }

    aplicarFiltros();
}

async function cargarMargenes() {
    const estado = $("margenesEstado");

    if (estado) {
        estado.textContent = "Cargando márgenes...";
        estado.style.display = "block";
    }

    cerrarDetalle();

    const result = await apiFetch(API_MARGENES);
    margenesOriginal = normalizarLista(result);
    aplicarFiltros();
}

async function cargarProveedoresDropdown() {
    const sel = $("ncProveedorId");
    if (!sel) return;

    sel.innerHTML = `<option value="">Cargando proveedores...</option>`;

    try {
        const result = await apiFetch(API_PROVEEDORES);
        const proveedores = normalizarLista(result);

        sel.innerHTML =
            `<option value="">Seleccione un proveedor</option>` +
            proveedores.map(p => {
                const id = p.proveedorId ?? p.id ?? p.value;
                const nombre = p.nombre ?? `Proveedor ${id}`;
                return `<option value="${id}">${nombre}</option>`;
            }).join("");
    } catch (err) {
        console.error(err);
        sel.innerHTML = `<option value="">No se pudieron cargar proveedores</option>`;
    }
}

async function cargarProductosDropdown() {
    const sel = $("ncProductoId");
    if (!sel) return;

    sel.innerHTML = `<option value="">Cargando productos...</option>`;

    try {
        const result = await apiFetch(API_PRODUCTOS);
        const productos = normalizarLista(result);

        sel.innerHTML =
            `<option value="">Seleccione un producto</option>` +
            productos.map(p => {
                const id = p.productoId ?? p.id ?? p.value;
                const nombre = p.nombreProducto ?? p.nombre ?? `Producto ${id}`;
                return `<option value="${id}">${nombre}</option>`;
            }).join("");
    } catch (err) {
        console.error(err);
        sel.innerHTML = `<option value="">No se pudieron cargar productos</option>`;
    }
}

function cargarDropdownUnidades(selectedId = 1) {
    const sel = $("ncUnidadId");
    if (!sel) return;

    sel.innerHTML =
        `<option value="">Seleccione una unidad</option>` +
        UNIDADES.map(u =>
            `<option value="${u.id}">${u.nombre} (${u.simbolo})</option>`
        ).join("");

    if (selectedId) {
        sel.value = String(selectedId);
    }
}

function sincronizarCostoTotalLinea() {
    const totalFactura = obtenerNumero("ncTotalFactura");
    const campoHidden = $("ncCostoTotalLinea");
    const preview = $("ncCostoTotalLineaPreview");

    if (campoHidden) {
        campoHidden.value = totalFactura > 0 ? String(totalFactura) : "";
    }

    if (preview) {
        preview.textContent = totalFactura > 0
            ? formatearMoneda(totalFactura)
            : "Se calcula desde el total de factura";
    }
}

async function prepararModalNuevaCompra() {
    limpiarSelect("ncProveedorId");
    limpiarInput("ncFechaCompra");
    limpiarInput("ncTotalFactura");
    limpiarInput("ncObservaciones");

    limpiarSelect("ncProductoId");
    limpiarSelect("ncUnidadId");
    limpiarInput("ncCantidadComprada");
    limpiarInput("ncCostoTotalLinea");
    limpiarInput("ncObservacionesDetalle");

    await cargarProveedoresDropdown();
    await cargarProductosDropdown();
    cargarDropdownUnidades(1);
    sincronizarCostoTotalLinea();

    abrirModal("modalNuevaCompra");
}

async function guardarCompraCompleta() {
    const proveedorId = obtenerNumero("ncProveedorId");
    const empleadoId = EMPLEADO_ID_DEFAULT;
    const numeroFactura = null;
    const fechaCompra = obtenerTexto("ncFechaCompra");
    const totalFactura = obtenerNumero("ncTotalFactura");
    const observaciones = obtenerTexto("ncObservaciones");

    const productoId = obtenerNumero("ncProductoId");
    const unidadId = obtenerNumero("ncUnidadId");
    const cantidadComprada = obtenerNumero("ncCantidadComprada");
    const costoTotalLinea = totalFactura;
    const observacionesDetalle = obtenerTexto("ncObservacionesDetalle");

    if (!proveedorId || !totalFactura || !productoId || !unidadId || !cantidadComprada) {
        alert("Completa los campos obligatorios de la compra.");
        return;
    }

    const compraPayload = {
        proveedorId,
        empleadoId,
        numeroFactura,
        fechaCompra: fechaCompra || null,
        totalFactura,
        observaciones: observaciones || null
    };

    const compraId = await apiFetch(API_COMPRAS, {
        method: "POST",
        body: JSON.stringify(compraPayload)
    });

    const detallePayload = {
        compraId: Number(compraId),
        productoId,
        unidadId,
        cantidadComprada,
        costoTotalLinea,
        observaciones: observacionesDetalle || null
    };

    await apiFetch(API_COMPRAS_DETALLE, {
        method: "POST",
        body: JSON.stringify(detallePayload)
    });

    alert("Compra registrada correctamente.");
    cerrarModal("modalNuevaCompra");
    await cargarMargenes();
}

async function prepararModalMermaDesdeDetalle() {
    if (!detalleActual) {
        alert("Selecciona primero un registro con el botón Ver.");
        return;
    }

    limpiarInput("rmCompraDetalleId");
    limpiarInput("rmCantidadMerma");
    limpiarInput("rmMotivo");
    limpiarInput("rmDisponibleMermaRaw");

    try {
        const result = await apiFetch(
            `${API_DETALLE_PARA_MERMA}?productoId=${detalleActual.productoId}&proveedorId=${detalleActual.proveedorId}`
        );

        const data = result?.data ?? result;

        if (!data || !data.compraDetalleId) {
            alert("No se encontró una compra válida para ese producto y proveedor.");
            return;
        }

        if ($("rmCompraDetalleId")) $("rmCompraDetalleId").value = data.compraDetalleId;
        if ($("rmProductoNombre")) $("rmProductoNombre").textContent = data.nombreProducto ?? detalleActual.nombreProducto ?? "-";
        if ($("rmProveedorNombre")) $("rmProveedorNombre").textContent = data.proveedorNombre ?? detalleActual.proveedorNombre ?? "-";
        if ($("rmCantidadComprada")) $("rmCantidadComprada").textContent = formatearNumero(data.cantidadComprada ?? 0);
        if ($("rmCantidadMermaActual")) $("rmCantidadMermaActual").textContent = formatearNumero(data.cantidadMermaActual ?? 0);
        if ($("rmDisponibleMerma")) $("rmDisponibleMerma").textContent = formatearNumero(data.cantidadDisponibleParaMerma ?? 0);
        if ($("rmDisponibleMermaRaw")) $("rmDisponibleMermaRaw").value = data.cantidadDisponibleParaMerma ?? 0;

        abrirModal("modalMerma");
    } catch (err) {
        console.error(err);
        alert("No se pudo cargar la información para registrar la merma.");
    }
}

async function guardarMerma() {
    const compraDetalleId = obtenerNumero("rmCompraDetalleId");
    const empleadoId = EMPLEADO_ID_DEFAULT;
    const cantidadMerma = obtenerNumero("rmCantidadMerma");
    const motivo = obtenerTexto("rmMotivo");
    const disponible = obtenerNumero("rmDisponibleMermaRaw");

    if (!compraDetalleId || !cantidadMerma) {
        alert("Completa los campos obligatorios de la merma.");
        return;
    }

    if (cantidadMerma <= 0) {
        alert("La merma debe ser mayor a 0.");
        return;
    }

    if (cantidadMerma > disponible) {
        alert("La merma no puede superar la cantidad disponible para merma.");
        return;
    }

    const payload = {
        compraDetalleId,
        empleadoId,
        cantidadMerma,
        motivo: motivo || null
    };

    await apiFetch(API_COMPRAS_MERMA, {
        method: "POST",
        body: JSON.stringify(payload)
    });

    alert("Merma registrada correctamente.");
    cerrarModal("modalMerma");
    await cargarMargenes();
}

function registrarEventos() {
    $("btnRefrescarMargenes")?.addEventListener("click", () => {
        cargarMargenes().catch(err => {
            console.error(err);
            const estado = $("margenesEstado");
            if (estado) {
                estado.textContent = "No se pudieron cargar los márgenes.";
                estado.style.display = "block";
            }
        });
    });

    $("btnAplicarFiltrosMargenes")?.addEventListener("click", aplicarFiltros);
    $("btnLimpiarFiltrosMargenes")?.addEventListener("click", limpiarFiltros);

    $("txtFiltroProducto")?.addEventListener("keyup", (e) => {
        if (e.key === "Enter") aplicarFiltros();
    });

    $("txtFiltroProveedor")?.addEventListener("keyup", (e) => {
        if (e.key === "Enter") aplicarFiltros();
    });

    $("ncTotalFactura")?.addEventListener("input", sincronizarCostoTotalLinea);

    $("btnNuevaCompra")?.addEventListener("click", () => {
        prepararModalNuevaCompra().catch(err => {
            console.error(err);
            alert("No se pudo preparar el formulario de compra.");
        });
    });

    $("btnCerrarCompra")?.addEventListener("click", () => {
        cerrarModal("modalNuevaCompra");
    });

    $("btnGuardarCompra")?.addEventListener("click", async () => {
        try {
            await guardarCompraCompleta();
        } catch (err) {
            console.error(err);
            alert("Error al guardar la compra.");
        }
    });

    $("btnNuevaMerma")?.addEventListener("click", () => {
        prepararModalMermaDesdeDetalle().catch(err => {
            console.error(err);
            alert("No se pudo preparar el formulario de merma.");
        });
    });

    $("btnDetalleRegistrarMerma")?.addEventListener("click", () => {
        prepararModalMermaDesdeDetalle().catch(err => {
            console.error(err);
            alert("No se pudo preparar el formulario de merma.");
        });
    });

    $("btnCerrarMerma")?.addEventListener("click", () => {
        cerrarModal("modalMerma");
    });

    $("btnGuardarMerma")?.addEventListener("click", async () => {
        try {
            await guardarMerma();
        } catch (err) {
            console.error(err);
            alert("Error al registrar la merma.");
        }
    });

    $("btnVerCompras")?.addEventListener("click", () => {
        document.querySelector(`.nav button[data-page="comprasPlantas"]`)?.click();
    });

    $("btnCerrarDetalleMargen")?.addEventListener("click", cerrarDetalle);

    $("modalNuevaCompra")?.addEventListener("click", (e) => {
        if (e.target.id === "modalNuevaCompra" || e.target.classList.contains("mu-modal__backdrop")) {
            cerrarModal("modalNuevaCompra");
        }
    });

    $("modalMerma")?.addEventListener("click", (e) => {
        if (e.target.id === "modalMerma" || e.target.classList.contains("mu-modal__backdrop")) {
            cerrarModal("modalMerma");
        }
    });

    document.addEventListener("click", (e) => {
        const btnDetalle = e.target.closest(".btn-ver-detalle");
        if (!btnDetalle) return;

        const productoId = Number(btnDetalle.dataset.producto);
        const proveedorId = Number(btnDetalle.dataset.proveedor);

        const item = margenesFiltrados.find(x =>
            Number(x.productoId) === productoId &&
            Number(x.proveedorId) === proveedorId
        );

        if (item) {
            mostrarDetalle(item);
        }
    });
}

export async function init() {
    registrarEventos();
    await cargarMargenes();
}

document.addEventListener("DOMContentLoaded", () => {
    init().catch(err => {
        console.error(err);
        const estado = $("margenesEstado");
        if (estado) {
            estado.textContent = "Error al inicializar la página.";
            estado.style.display = "block";
        }
    });
});