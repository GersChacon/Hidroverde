let EMPLEADO_ID = 1; // por ahora fijo. Luego lo hacemos dinámico.
let CICLOS = [];

export function init() {
    // botones
    document.getElementById("btnRefrescarCiclos")?.addEventListener("click", cargarActivos);
    document.getElementById("btnNuevaSiembra")?.addEventListener("click", () => abrirModal("modalSiembra"));

    // modal close (click en backdrop o botón X)
    document.querySelectorAll('[data-close="modalSiembra"]').forEach(el => {
        el.addEventListener("click", () => cerrarModal("modalSiembra"));
    });

    // form submit
    document.getElementById("frmSiembra")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        await guardarSiembra();
    });

    // defaults fecha
    setFechasDefault();

    // carga inicial
    cargarActivos();

    // acciones tabla (cosechar / cancelar)
    document.addEventListener("click", async (e) => {
        // ==========================
        // CANCELAR
        // ==========================
        const btnCancelar = e.target.closest(".btn-cancelar");
        if (btnCancelar) {
            const cicloId = btnCancelar.dataset.id;

            const motivo = prompt("Motivo de cancelación (opcional):", "Creado por error");
            if (motivo === null) return; // canceló el prompt

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

            return; // importante: no seguir con cosechar
        }

        // ==========================
        // COSECHAR
        // ==========================
        const btnCosechar = e.target.closest(".btn-cosechar");
        if (!btnCosechar) return;

        const cicloId = btnCosechar.dataset.id;

        // Buscar ciclo en memoria
        const ciclo = CICLOS.find(x => String(x.cicloId) === String(cicloId));

        // Validar fecha estimada
        if (ciclo?.fechaCosechaEstimada) {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            const est = new Date(ciclo.fechaCosechaEstimada);
            est.setHours(0, 0, 0, 0);

            if (hoy < est) {
                const ok = confirm("Esta cosecha aún no está lista (fecha estimada no se cumple). ¿Estás seguro de que quieres cosechar?");
                if (!ok) return;
            }
        }

        // Confirmación normal
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
                const txt = await res.text();
                throw new Error(txt);
            }

            const data = await res.json();
            alert(`Cosecha exitosa.\nLote: ${data.loteGenerado}`);

            await cargarActivos(); // refrescar tabla
        } catch (err) {
            alert(err?.message || "Error cosechando");
        }
    });
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

    // ahora son 9 columnas (incluye Acciones)
    tbody.innerHTML = `<tr><td colspan="9" class="muted">Cargando...</td></tr>`;

    try {
        const res = await fetch("/api/ciclos/activos");

        if (res.status === 204) {
            tbody.innerHTML = `<tr><td colspan="9" class="muted">No hay ciclos activos.</td></tr>`;
            return;
        }

        if (!res.ok) {
            const txt = await res.text();
            throw new Error(txt || `Error HTTP ${res.status}`);
        }

        const data = await res.json();
        CICLOS = data;

        if (!Array.isArray(data) || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" class="muted">No hay ciclos activos.</td></tr>`;
            return;
        }

        tbody.innerHTML = data.map(rowHtml).join("");
    } catch (err) {
        console.error(err);
        tbody.innerHTML = `<tr><td colspan="9" class="muted">Error cargando ciclos.</td></tr>`;
        alert("Error cargando ciclos. Revisá consola.");
    }
}

function rowHtml(c) {
    const siembra = fmtDate(c.fechaSiembra);
    const cosechaEst = fmtDate(c.fechaCosechaEstimada);
    const responsable = c.responsableNombre ?? "-";

    const cultivo = `${c.productoCodigo ?? ""} - ${c.productoNombre ?? ""}`;
    const variedad = c.variedadNombre ?? "-";
    const torre = c.torreCodigo ?? `#${c.torreId}`;

    const btnCosechar = c.esActivo
        ? `<button class="btn-cosechar" data-id="${c.cicloId}">🌾 Cosechar</button>`
        : ``;

    const btnCancelar = c.esActivo
        ? `<button class="btn-cancelar" data-id="${c.cicloId}">🗑️ Cancelar</button>`
        : ``;

    return `
  <tr>
    <td>${safe(c.cicloId)}</td>
    <td>
      <div><strong>${safe(cultivo)}</strong></div>
      <div class="muted small">${safe(variedad)}</div>
    </td>
    <td>${safe(torre)}</td>
    <td>${safe(c.estadoNombre)}</td>
    <td>${safe(siembra)}</td>
    <td>${safe(cosechaEst)}</td>
    <td>${safe(c.cantidadPlantas)}</td>
    <td>${safe(responsable)}</td>
    <td>
      ${btnCosechar}
      ${btnCancelar}
    </td>
  </tr>
`;
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

async function guardarSiembra() {
    // leer inputs
    const productoId = num("productoId");
    const variedadId = num("variedadId");
    const torreId = num("torreId");
    const estadoCicloCodigo = val("estadoCicloCodigo");
    const fechaSiembra = val("fechaSiembra");
    const fechaCosechaEstimada = val("fechaCosechaEstimada");
    const cantidadPlantas = num("cantidadPlantas");
    const loteSemilla = emptyToNull(val("loteSemilla"));
    const notas = emptyToNull(val("notas"));

    // validaciones mínimas
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

        const data = await res.json();
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
    m.setAttribute("aria-hidden", "false");
    m.classList.add("is-open");
}

function cerrarModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.setAttribute("aria-hidden", "true");
    m.classList.remove("is-open");
}

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
