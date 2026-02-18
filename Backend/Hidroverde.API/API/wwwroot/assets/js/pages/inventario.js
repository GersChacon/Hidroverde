import { api } from "../lib/http.js";
import { escapeHtml, setValue } from "../lib/dom.js";
import { showModal, setModalTitle } from "../lib/modal.js";
import { getTrim, getNumber, getDecimal, getBool, nullableString } from "../lib/form.js";

const API_PRODUCTO = "/api/Producto";

let modoEdicion = false;
let productoEditandoId = null;



export function init() {
   

    // Listeners UI
    document.getElementById("btnRefrescarProductos")?.addEventListener("click", () => {
        cargarProductos(true);
    });

    document.getElementById("btnNuevoProducto")?.addEventListener("click", abrirModalNuevo);

    document.getElementById("btnCerrarProducto")?.addEventListener("click", () => {
        showModal("modalProducto", false);
    });

    document.getElementById("btnGuardarProducto")?.addEventListener("click", guardarProducto);

    // Delegación tabla
    const tbody = document.getElementById("productosBody");
    if (tbody) tbody.addEventListener("click", onTableClick);

    // IMPORTANTE: correr después del paint (evita carreras raras)
    queueMicrotask(() => cargarProductos());
}

/* =========================
   Cargar / Render
   ========================= */
async function cargarProductos() {
    const tbody = document.getElementById("productosBody");
    

    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="9" class="muted">Cargando…</td></tr>`;

    try {
       
        const r = await fetch("/api/Producto", {
            headers: { "X-Empleado-Id": localStorage.getItem("empleadoId") || "1" }
        });
       

        if (r.status === 204) {
            tbody.innerHTML = `<tr><td colspan="9" class="muted">No hay productos</td></tr>`;
            return;
        }

        const data = await r.json().catch(() => null);
       

        if (!Array.isArray(data) || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" class="muted">No hay productos</td></tr>`;
            return;
        }

        renderTabla(data);
    } catch (err) {
        console.error(err);
        alert(err?.message || "Error al cargar datos");
        tbody.innerHTML = `<tr><td colspan="9" class="danger">Error al cargar datos</td></tr>`;
    }
}

function renderTabla(productos) {
    const tbody = document.getElementById("productosBody");
    if (!tbody) return;

    tbody.innerHTML = productos
        .map((p) => {
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
        })
        .join("");
}

async function onTableClick(e) {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const id = Number(btn.dataset.id);
    const action = btn.dataset.action;

    if (!id) return;

    if (action === "edit") await abrirModalEditar(id);
    if (action === "del") await eliminarProducto(id);
}

/* =========================
   Modal
   ========================= */
function abrirModalNuevo() {
    modoEdicion = false;
    productoEditandoId = null;

    setModalTitle("modalProducto", "Nuevo producto");
    limpiarFormulario();
    setMsg("");

    showModal("modalProducto", true);
}

async function abrirModalEditar(productoId) {
    modoEdicion = true;
    productoEditandoId = productoId;

    setModalTitle("modalProducto", `Editar producto #${productoId}`);
    limpiarFormulario();
    setMsg("Cargando…");

    showModal("modalProducto", true);

    try {
        const { data } = await api(`${API_PRODUCTO}/${productoId}`);
        fillForm(data);
        setMsg("");
    } catch (err) {
        console.error(err);
        setMsg(err?.message || "Error al cargar el producto", true);
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

    const rr = document.getElementById("pRequiereRefrigeracion");
    const ac = document.getElementById("pActivo");
    if (rr) rr.value = String(!!p.requiereRefrigeracion);
    if (ac) ac.value = String(!!p.activo);
}

function limpiarFormulario() {
    [
        "pCodigo",
        "pNombreProducto",
        "pVariedadId",
        "pUnidadId",
        "pPrecioBase",
        "pDiasCaducidad",
        "pStockMinimo",
        "pDescripcion",
        "pImagenUrl",
    ].forEach((id) => setValue(id, ""));

    const rr = document.getElementById("pRequiereRefrigeracion");
    const ac = document.getElementById("pActivo");
    if (rr) rr.value = "false";
    if (ac) ac.value = "true";
}

function setMsg(texto, isError = false) {
    const el = document.getElementById("pMsg");
    if (!el) return;
    el.textContent = texto || "";
    el.classList.toggle("danger", !!isError);
}

/* =========================
   Guardar
   ========================= */
async function guardarProducto() {
    setMsg("");

    const payload = buildPayload();
    const valid = validar(payload);
    if (!valid.ok) return setMsg(valid.msg, true);

    const url = modoEdicion ? `${API_PRODUCTO}/${productoEditandoId}` : API_PRODUCTO;
    const method = modoEdicion ? "PUT" : "POST";

    try {
        await api(url, { method, body: payload });
        await cargarProductos(true);
        showModal("modalProducto", false);
    } catch (err) {
        console.error(err);
        setMsg(err?.message || "Error al guardar", true);
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

        stockMinimo: stockTxt === "" ? null : Number(stockTxt),

        requiereRefrigeracion: getBool("pRequiereRefrigeracion"),
        activo: getBool("pActivo"),

        descripcion: nullableString(getTrim("pDescripcion")),
        imagenUrl: nullableString(getTrim("pImagenUrl")),

        // ✅ Agregalo si tu modal lo va a manejar (o al menos mandar 0 por ahora)
        pesoGramos: 0
    };
}

function validar(p) {
    if (!p.codigo) return { ok: false, msg: "El código es necesario" };
    if (!p.nombreProducto) return { ok: false, msg: "El nombre es necesario" };

    if (!Number.isFinite(p.variedadId) || p.variedadId <= 0)
        return { ok: false, msg: "VariedadId inválido" };

    if (!Number.isFinite(p.unidadId) || p.unidadId <= 0)
        return { ok: false, msg: "UnidadId inválido" };

    if (!Number.isFinite(p.precioBase) || p.precioBase < 0)
        return { ok: false, msg: "Precio inválido" };

    if (!Number.isFinite(p.diasCaducidad) || p.diasCaducidad < 0)
        return { ok: false, msg: "Días inválidos" };

    if (p.stockMinimo !== null && (!Number.isFinite(p.stockMinimo) || p.stockMinimo < 0))
        return { ok: false, msg: "Stock mínimo inválido" };

    return { ok: true };
}

/* =========================
   Eliminar
   ========================= */
async function eliminarProducto(productoId) {
    if (!confirm(`¿Eliminar el producto #${productoId}?`)) return;

    try {
        await api(`${API_PRODUCTO}/${productoId}`, { method: "DELETE" });
        await cargarProductos(true);
    } catch (err) {
        console.error(err);
        alert(err?.message || "Error al eliminar");
    }
}
