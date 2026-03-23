import { api } from "../lib/http.js";
import { $ } from "../lib/dom.js";

let alertaSeleccionada = null;

// ─── Helpers ─────────────────────────────────────────────
function setStatus(msg) {
    const el = $("#alertasStatus");
    if (el) el.textContent = msg;
}

function formatFecha(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("es-CR", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    });
}

// ─── Cargar y renderizar alertas ─────────────────────────
async function cargarAlertas() {
    setStatus("Cargando alertas...");
    $("#alertasVacio")?.style && ($("#alertasVacio").style.display = "none");
    $("#alertasLista").innerHTML = "";

    let alertas = [];
    try {
        const r = await api("/api/alertas/activas");
        alertas = Array.isArray(r.data) ? r.data : [];
    } catch (e) {
        setStatus(`Error al cargar alertas: ${e.message}`);
        return;
    }

    // Actualizar resumen
    const resumen = $("#alertasResumen");
    const cntEl = $("#alertasCntActivas");
    if (cntEl) cntEl.textContent = alertas.length;
    if (resumen) resumen.style.display = alertas.length > 0 ? "flex" : "none";

    if (alertas.length === 0) {
        setStatus("");
        $("#alertasVacio").style.display = "flex";
        return;
    }

    setStatus(`${alertas.length} alerta(s) activa(s)`);

    const lista = $("#alertasLista");
    lista.innerHTML = "";

    alertas.forEach((a) => {
        const card = document.createElement("div");
        card.className = "card alerta-card";
        card.dataset.alertaId = a.alertaId;

        const pct = a.snapshotMinimo > 0
            ? Math.min(100, Math.round((a.snapshotDisponible / a.snapshotMinimo) * 100))
            : 0;

        const pctColor = pct <= 25 ? "var(--danger)" : pct <= 60 ? "var(--warn)" : "var(--ok)";

        card.innerHTML = `
            <div class="alerta-header">
                <div class="alerta-icon">⚠️</div>
                <div class="alerta-info">
                    <div class="alerta-producto">${escapeHtml(a.nombreProducto ?? "")}</div>
                    <div class="muted alerta-fecha">${formatFecha(a.fechaCreacion)}</div>
                </div>
                <div class="alerta-badge-tipo">${escapeHtml(a.tipoAlerta ?? "")}</div>
            </div>
            <div class="alerta-mensaje">${escapeHtml(a.mensaje ?? "")}</div>
            <div class="alerta-stock-row">
                <div class="alerta-stock-item">
                    <span class="muted">Disponible</span>
                    <strong style="color:${pctColor}">${a.snapshotDisponible}</strong>
                </div>
                <div class="alerta-stock-bar-wrap">
                    <div class="alerta-stock-bar" style="width:${pct}%; background:${pctColor};"></div>
                </div>
                <div class="alerta-stock-item">
                    <span class="muted">Mínimo</span>
                    <strong>${a.snapshotMinimo}</strong>
                </div>
            </div>
            <div style="text-align:right; margin-top:10px;">
                <button class="btn-primary btn-aceptar" type="button"
                    data-alerta-id="${a.alertaId}"
                    data-producto="${escapeHtml(a.nombreProducto ?? "")}"
                    data-disponible="${a.snapshotDisponible}"
                    data-minimo="${a.snapshotMinimo}">
                    ✔ Aceptar / Revisar
                </button>
            </div>
        `;

        lista.appendChild(card);
    });

    // Eventos en botones de aceptar
    lista.querySelectorAll(".btn-aceptar").forEach((btn) => {
        btn.addEventListener("click", () => {
            alertaSeleccionada = Number(btn.dataset.alertaId);
            $("#modalProducto").textContent = btn.dataset.producto;
            $("#modalDisponible").textContent = btn.dataset.disponible;
            $("#modalMinimo").textContent = btn.dataset.minimo;
            abrirModal();
        });
    });
}

// ─── Modal ───────────────────────────────────────────────
function abrirModal() {
    $("#modalAceptar")?.classList.remove("hidden");
}

function cerrarModal() {
    $("#modalAceptar")?.classList.add("hidden");
    alertaSeleccionada = null;
}

async function confirmarAceptar() {
    if (!alertaSeleccionada) return;

    // empleadoId desde localStorage (mismo patrón que http.js)
    const empleadoId = Number(localStorage.getItem("empleadoId") || "1");

    try {
        await api(`/api/alertas/${alertaSeleccionada}/aceptar?empleadoId=${empleadoId}`, {
            method: "POST"
        });
        cerrarModal();
        await cargarAlertas();
    } catch (e) {
        alert(`Error al aceptar alerta: ${e.message}`);
    }
}

// ─── Escape util (básico, sin depender de dom.js) ────────
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

// ─── Init ────────────────────────────────────────────────
export async function init() {
    console.log("✅ alertas.init()");

    $("#btnRefrescarAlertas")?.addEventListener("click", () =>
        cargarAlertas().catch((e) => alert(e.message))
    );

    $("#btnCancelarModal")?.addEventListener("click", cerrarModal);
    $("#btnConfirmarAceptar")?.addEventListener("click", confirmarAceptar);

    // Cerrar modal al hacer click fuera
    $("#modalAceptar")?.addEventListener("click", (e) => {
        if (e.target === $("#modalAceptar")) cerrarModal();
    });

    await cargarAlertas();
}
