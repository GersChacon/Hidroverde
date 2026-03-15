let EMPLEADO_ID = 1; // por ahora fijo. Luego lo hacemos dinámico.
let CICLOS = [];
const MOCK_CICLOS = [
    { cicloId: 1, productoId: 1, productoCodigo: "LEC", productoNombre: "Lechuga", variedadNombre: "Romana", torreCodigo: "T-01", fechaSiembra: "2025-03-01", fechaCosechaEstimada: "2025-03-28", cantidadPlantas: 100, estadoNombre: "ACTIVO", esActivo: true },
    { cicloId: 2, productoId: 2, productoCodigo: "TOM", productoNombre: "Tomate", variedadNombre: "Cherry", torreCodigo: "T-02", fechaSiembra: "2025-03-05", fechaCosechaEstimada: "2025-04-02", cantidadPlantas: 80, estadoNombre: "ACTIVO", esActivo: true }
];
export function init() {
    // Buscador
    document.getElementById("txtBuscarCiclos")?.addEventListener("input", (e) => {
        const q = (e.target.value || "").toLowerCase().trim();
        renderTablaFiltrada(q);
    });
    // In init(), after detecting offline
    //if (offline) document.getElementById("btnNuevaSiembra").disabled = true;
    // Botones
    document.getElementById("btnRefrescarCiclos")?.addEventListener("click", cargarActivos);
    document.getElementById("btnNuevaSiembra")?.addEventListener("click", () => abrirModal("modalSiembra"));

    // Modal close (backdrop o X o Cancelar)
    document.querySelectorAll('[data-close="modalSiembra"]').forEach(el => {
        el.addEventListener("click", () => cerrarModal("modalSiembra"));
    });

    // Form submit
    document.getElementById("frmSiembra")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        await guardarSiembra();
    });

    // Defaults fecha
    setFechasDefault();

    // Carga inicial
    cargarActivos();

    // Acciones tabla (delegación)
    document.addEventListener("click", async (e) => {
        // CANCELAR
        const btnCancelar = e.target.closest(".btn-cancelar");
        if (btnCancelar) {
            const cicloId = btnCancelar.dataset.id;

            const motivo = prompt("Motivo de cancelación (opcional):", "Creado por error");
            if (motivo === null) return;

            if (!confirm("¿Seguro que deseas cancelar este ciclo?")) return;

            try {
                const res = await fetch(`/api/ciclos/${cicloId}/cancelar`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Empleado-Id": String(EMPLEADO_ID)
                    },
                    body: JSON.stringify({ motivo: motivo.trim() || null })
                });

                if (!res.ok) {
                    const txt = await res.text().catch(() => "");
                    throw new Error(txt || `Error HTTP ${res.status}`);
                }

                alert("Ciclo cancelado.");
                await cargarActivos();
            } catch (err) {
                alert(err?.message || "Error cancelando ciclo");
            }
            return;
        }

        // COSECHAR
        const btnCosechar = e.target.closest(".btn-cosechar");
        if (!btnCosechar) return;

        const cicloId = btnCosechar.dataset.id;

        // Buscar ciclo en memoria
        const ciclo = CICLOS.find(x => String(x.cicloId) === String(cicloId));

        // Validar fecha estimada
        if (ciclo?.fechaCosechaEstimada) {
            const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
            const est = new Date(ciclo.fechaCosechaEstimada); est.setHours(0, 0, 0, 0);

            if (hoy < est) {
                const ok = confirm("Esta cosecha aún no está lista (fecha estimada no se cumple). ¿Estás seguro de que quieres cosechar?");
                if (!ok) return;
            }
        }

        if (!confirm("¿Desea cosechar este ciclo?")) return;

        try {
            const res = await fetch(`/api/ciclos/${cicloId}/cosecha`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Empleado-Id": String(EMPLEADO_ID)
                },
                body: JSON.stringify({
                    ubicacionId: 1,
                    estadoCalidadCodigo: "OPTIMO",
                    motivo: "Cosecha desde UI"
                })
            });

            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                throw new Error(txt || `Error HTTP ${res.status}`);
            }

            const data = await res.json().catch(() => ({}));
            alert(`Cosecha exitosa.\nLote: ${data.loteGenerado ?? "-"}`);

            await cargarActivos();
        } catch (err) {
            alert(err?.message || "Error cosechando");
        }
    });
}

/* =========================
   Render / filtro
   ========================= */
function renderTablaFiltrada(q) {
    const tbody = document.getElementById("tblCiclosBody");
    if (!tbody) return;

    const data = !q ? CICLOS : CICLOS.filter(c => {
        const cultivo = `${c.productoCodigo ?? ""} ${c.productoNombre ?? ""} ${c.variedadNombre ?? ""}`.toLowerCase();
        const torre = `${c.torreCodigo ?? ""} ${c.torreId ?? ""}`.toLowerCase();
        const estado = `${c.estadoNombre ?? ""}`.toLowerCase();
        return cultivo.includes(q) || torre.includes(q) || estado.includes(q) || String(c.cicloId).includes(q);
    });

    if (!data.length) {
        tbody.innerHTML = `<tr><td colspan="7" class="muted">Sin resultados.</td></tr>`;
        return;
    }

    tbody.innerHTML = data.map(rowHtml).join("");
}

function setFechasDefault() {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const dd = String(hoy.getDate()).padStart(2, "0");
    const hoyStr = `${yyyy}-${mm}-${dd}`;

    const fechaSiembra = document.getElementById("fechaSiembra");
    if (fechaSiembra && !fechaSiembra.value) fechaSiembra.value = hoyStr;
}

async function cargarActivos() {
    const tbody = document.getElementById("tblCiclosBody");
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="7" class="muted">Cargando...</td></tr>`;

    try {
        const res = await fetch("/api/ciclos/activos");
        if (res.status === 204) {
            CICLOS = [];
            tbody.innerHTML = `<tr><td colspan="7" class="muted">No hay ciclos activos.</td></tr>`;
            return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        CICLOS = Array.isArray(data) ? data : [];
    } catch (err) {
        console.warn("Offline mode, showing mock ciclos", err);
        CICLOS = MOCK_CICLOS;
    }

    const q = (document.getElementById("txtBuscarCiclos")?.value || "").toLowerCase().trim();
    renderTablaFiltrada(q);
}

/* =========================
   Row Lovable-like
   ========================= */
function rowHtml(c) {
    const inicio = fmtDate(c.fechaSiembra);
    const fin = fmtDate(c.fechaCosechaEstimada);

    const cultivo = `${c.productoCodigo ?? ""} ${c.productoNombre ?? ""}`.trim() || "-";
    const nombre = `Ciclo #${c.cicloId}`;

    const pct = calcProgresoPct(c.fechaSiembra, c.fechaCosechaEstimada);

    const estadoTxt = c.esActivo ? "Activo" : (c.estadoNombre ?? "Inactivo");
    const estadoClass = c.esActivo ? "pill green" : "pill";

    const btnCosechar = c.esActivo
        ? `<button class="btn small btn-primary btn-cosechar" data-id="${safe(c.cicloId)}">Cosechar</button>`
        : ``;

    const btnCancelar = c.esActivo
        ? `<button class="btn small danger btn-cancelar" data-id="${safe(c.cicloId)}">Cancelar</button>`
        : ``;

    return `
  <tr>
    <td><strong>${safe(nombre)}</strong></td>
    <td>${safe(cultivo)}</td>
    <td>${safe(inicio)}</td>
    <td>${safe(fin)}</td>
    <td>
      <div class="progressWrap">
        <div class="progressBar">
          <div class="progressFill" style="width:${pct}%"></div>
        </div>
        <span class="progressPct">${pct}%</span>
      </div>
    </td>
    <td><span class="${estadoClass}">${safe(estadoTxt)}</span></td>
    <td>
      <div class="actionsCell">
        ${btnCosechar}
        ${btnCancelar}
      </div>
    </td>
  </tr>
`;
}

function calcProgresoPct(fechaInicio, fechaFin) {
    const a = new Date(fechaInicio);
    const b = new Date(fechaFin);
    if (isNaN(a.getTime()) || isNaN(b.getTime())) return 0;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    a.setHours(0, 0, 0, 0);
    b.setHours(0, 0, 0, 0);

    const total = b - a;
    if (total <= 0) return 0;

    const trans = hoy - a;
    const pct = Math.round((trans / total) * 100);
    return Math.max(0, Math.min(100, pct));
}

function fmtDate(v) {
    if (!v) return "-";
    const d = new Date(v);
    if (isNaN(d.getTime())) return String(v);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

/* =========================
   Siembra / modal
   ========================= */
async function guardarSiembra() {
    const productoId = num("productoId");
    const variedadId = num("variedadId");
    const torreId = num("torreId");
    const estadoCicloCodigo = val("estadoCicloCodigo");
    const fechaSiembra = val("fechaSiembra");
    const fechaCosechaEstimada = val("fechaCosechaEstimada");
    const cantidadPlantas = num("cantidadPlantas");
    const loteSemilla = emptyToNull(val("loteSemilla"));
    const notas = emptyToNull(val("notas"));

    if (productoId <= 0 || variedadId <= 0 || torreId <= 0) {
        alert("ProductoId, VariedadId y TorreId deben ser mayores a 0.");
        return;
    }
    if (!estadoCicloCodigo) {
        alert("EstadoCicloCodigo es requerido.");
        return;
    }
    if (!fechaSiembra || !fechaCosechaEstimada) {
        alert("Fechas requeridas.");
        return;
    }
    if (cantidadPlantas <= 0) {
        alert("CantidadPlantas debe ser mayor a 0.");
        return;
    }

    const body = {
        productoId,
        variedadId,
        torreId,
        estadoCicloCodigo,
        fechaSiembra,
        fechaCosechaEstimada,
        cantidadPlantas,
        loteSemilla,
        notas
    };

    try {
        const res = await fetch("/api/ciclos/siembra", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Empleado-Id": String(EMPLEADO_ID)
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const ct = res.headers.get("content-type") || "";
            let msg = `Error HTTP ${res.status}`;

            if (ct.includes("application/json")) {
                const j = await res.json().catch(() => null);
                msg = (typeof j === "string" ? j : (j?.message || j?.title)) || msg;
            } else {
                const txt = await res.text().catch(() => "");
                msg = txt || msg;
            }
            throw new Error(msg);
        }

        const data = await res.json().catch(() => ({}));
        alert(`Siembra registrada. CicloId: ${data?.cicloIdCreado ?? "?"}`);

        cerrarModal("modalSiembra");
        await cargarActivos();
    } catch (err) {
        console.error(err);
        alert(err?.message || "Error registrando siembra.");
    }
}

function abrirModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.hidden = false;
    m.setAttribute("aria-hidden", "false");
}

function cerrarModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.hidden = true;
    m.setAttribute("aria-hidden", "true");
}

/* =========================
   Helpers
   ========================= */
function val(id) {
    const el = document.getElementById(id);
    return (el?.value ?? "").trim();
}

function num(id) {
    const n = parseInt(val(id), 10);
    return isNaN(n) ? 0 : n;
}

function emptyToNull(s) {
    return s && s.length > 0 ? s : null;
}

function safe(v) {
    if (v === null || v === undefined) return "";
    return String(v)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
