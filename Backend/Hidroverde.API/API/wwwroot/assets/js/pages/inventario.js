// /assets/js/pages/inventario.js

import { api } from "../lib/http.js";
import { escapeHtml, setValue } from "../lib/dom.js";
import { showModal, setModalTitle } from "../lib/modal.js";
import { getTrim, getNumber, getDecimal, getBool, nullableString } from "../lib/form.js";

const API_PRODUCTO = "/api/Producto";

const UNIDADES = [
    { id: 1, nombre: "Unidad", simbolo: "u" },
    { id: 2, nombre: "Racimo", simbolo: "rac" },
    { id: 3, nombre: "Bandeja", simbolo: "bdj" },
    { id: 4, nombre: "Kilogramo", simbolo: "kg" },
    { id: 5, nombre: "Gramo", simbolo: "g" },
    { id: 6, nombre: "Paquete", simbolo: "paq" },
    { id: 7, nombre: "Atado", simbolo: "atd" },
];

let modoEdicion = false;
let productoEditandoId = null;
let productoEditandoCodigo = null;
console.log("📄 inventario.js cargado");

export function init() {
    console.log("✅ inventario init ejecutado");

    // Listeners UI
    document.getElementById("btnRefrescarProductos")?.addEventListener("click", () => {
        cargarProductos();
    });

    document.getElementById("btnNuevoProducto")?.addEventListener("click", abrirModalNuevo);

    document.getElementById("btnCerrarProducto")?.addEventListener("click", () => {
        showModal("modalProducto", false);
    });

    document.getElementById("btnGuardarProducto")?.addEventListener("click", guardarProducto);

    // Delegación tabla
    const tbody = document.getElementById("productosBody");
    if (tbody) tbody.addEventListener("click", onTableClick);

    // correr después del paint (SPA)
    requestAnimationFrame(() => cargarProductos());
}

/* =========================
   Cargar / Render
   ========================= */
async function cargarProductos() {
    const tbody = document.getElementById("productosBody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="9" class="muted">Cargando…</td></tr>`;

    try {
        const r = await fetch(API_PRODUCTO, {
            headers: { "X-Empleado-Id": localStorage.getItem("empleadoId") || "1" },
        });

        // ✅ Manejo correcto de errores HTTP
        if (r.status === 204) {
            tbody.innerHTML = `<tr><td colspan="9" class="muted">No hay productos</td></tr>`;
            return;
        }
        if (!r.ok) {
            const txt = await r.text().catch(() => "");
            throw new Error(`API ${r.status}: ${txt || r.statusText}`);
        }

        const data = await r.json().catch(() => null);

        if (!Array.isArray(data) || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" class="muted">No hay productos</td></tr>`;
            return;
        }

        renderTabla(data);
    } catch (err) {
        console.error(err);
        tbody.innerHTML = `<tr><td colspan="9" class="danger">Error al cargar datos</td></tr>`;
        alert(err?.message || "Error al cargar datos");
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
          <td class="col-acciones">
            <div class="acciones-wrapper">
              <button class="btn" data-action="edit" data-id="${id}">Editar</button>
              <button class="btn danger" data-action="del" data-id="${id}">Eliminar</button>
            </div>
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
    productoEditandoCodigo = null; // ✅ reset
    setModalTitle("modalProducto", "Nuevo producto");
    limpiarFormulario();
    cargarUnidadesDropdown(1);
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

        productoEditandoCodigo = data.codigo;   // ✅ GUARDAR CODIGO REAL
        fillForm(data);
        setMsg("");
    } catch (err) {
        console.error(err);
        setMsg(err?.message || "Error al cargar el producto", true);
    }
}

function fillForm(p) {
    setValue("pNombreProducto", p?.nombreProducto ?? "");
    setValue("pPrecioBase", p?.precioBase ?? "");
    setValue("pDiasCaducidad", p?.diasCaducidad ?? "");
    setValue("pStockMinimo", p?.stockMinimo ?? "");
    setValue("pDescripcion", p?.descripcion ?? "");
    setValue("pImagenUrl", p?.imagenUrl ?? "");

    cargarUnidadesDropdown(p?.unidadId ?? 1);

    const rr = document.getElementById("pRequiereRefrigeracion");
    const ac = document.getElementById("pActivo");
    if (rr) rr.value = String(!!p?.requiereRefrigeracion);
    if (ac) ac.value = String(!!p?.activo);
}

function limpiarFormulario() {
    ["pNombreProducto", "pPrecioBase", "pDiasCaducidad", "pStockMinimo", "pDescripcion", "pImagenUrl"].forEach((id) =>
        setValue(id, "")
    );

    cargarUnidadesDropdown(1);

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
        await cargarProductos();
        showModal("modalProducto", false);
    } catch (err) {
        console.error(err);
        setMsg(err?.message || "Error al guardar", true);
    }
}

function buildPayload() {
    const stockTxt = getTrim("pStockMinimo");

    return {
        // ✅ POST: null (autogenera)
        // ✅ PUT: usa el existente
        codigo: modoEdicion ? productoEditandoCodigo : null,

        nombreProducto: getTrim("pNombreProducto"),
        variedadId: 1,
        unidadId: getNumber("pUnidadId"),
        precioBase: getDecimal("pPrecioBase"),
        diasCaducidad: getNumber("pDiasCaducidad"),
        stockMinimo: stockTxt === "" ? null : Number(stockTxt),
        requiereRefrigeracion: getBool("pRequiereRefrigeracion"),
        activo: getBool("pActivo"),
        descripcion: nullableString(getTrim("pDescripcion")),
        imagenUrl: nullableString(getTrim("pImagenUrl")),
        pesoGramos: 0
    };
}

function cargarUnidadesDropdown(selectedId = 1) {
    const sel = document.getElementById("pUnidadId");
    if (!sel) return;

    sel.innerHTML = UNIDADES.map(
        (u) => `<option value="${u.id}">${escapeHtml(u.nombre)} (${escapeHtml(u.simbolo)})</option>`
    ).join("");

    sel.value = String(selectedId);
}

function validar(p) {
    if (!p.nombreProducto) return { ok: false, msg: "El nombre es necesario" };

    if (!Number.isFinite(p.unidadId) || p.unidadId <= 0) return { ok: false, msg: "Unidad inválida" };

    if (p.precioBase != null && (!Number.isFinite(p.precioBase) || p.precioBase < 0))
        return { ok: false, msg: "Precio inválido" };

    if (p.diasCaducidad != null && (!Number.isFinite(p.diasCaducidad) || p.diasCaducidad < 0))
        return { ok: false, msg: "Días inválidos" };

    if (p.stockMinimo !== null && (!Number.isFinite(p.stockMinimo) || p.stockMinimo < 0))
        return { ok: false, msg: "Stock mínimo inválido" };

    return { ok: true };
}

/* =========================
   Eliminar
   ========================= */
async function eliminarProducto(productoId) {
    if (!confirm(`¿Eliminar el producto #${productoId}? Esta acción no se puede deshacer.`)) return;

    try {
        await api(`${API_PRODUCTO}/${productoId}`, { method: "DELETE" });
        await cargarProductos();
    } catch (err) {
        console.error(err);

        // ✅ caso esperado por requerimiento: no se puede borrar si hay relaciones
        if (err?.status === 409) {
            alert("No se puede eliminar este producto porque tiene registros asociados (por ejemplo, alertas). Primero elimina esos registros y vuelve a intentarlo.");
            return;
        }

        // otros errores
        alert(err?.message || "Error al eliminar");
    }
}