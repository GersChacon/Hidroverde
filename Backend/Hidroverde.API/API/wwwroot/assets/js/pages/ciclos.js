let EMPLEADO_ID = 1; // por ahora fijo. Luego lo hacemos dinámico.
let CICLOS = [];

export function init() {
    // Buscador
    document.getElementById("txtBuscarCiclos")?.addEventListener("input", (e) => {
        const q = (e.target.value || "").toLowerCase().trim();
        renderTablaFiltrada(q);
    });

    // Botones
    document.getElementById("btnRefrescarCiclos")?.addEventListener("click", cargarActivos);
    document.getElementById("btnNuevaSiembra")?.addEventListener("click", async () => {
        abrirModal("modalSiembra");
        await cargarTorresParaSelector().catch(console.error);
    });

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
    initProductoAutocomplete();
    wireFechas();
    cargarTorresParaSelector().catch(console.error);
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
    const fechaCosecha = document.getElementById("fechaCosechaEstimada");

    if (fechaSiembra && !fechaSiembra.value) fechaSiembra.value = hoyStr;

    // min de cosecha = siembra
    if (fechaSiembra && fechaCosecha) {
        fechaCosecha.min = fechaSiembra.value;

        // si cosecha está vacía o quedó menor que siembra, ajusta
        if (!fechaCosecha.value || fechaCosecha.value < fechaSiembra.value) {
            fechaCosecha.value = fechaSiembra.value;
        }
    }
}
async function cargarActivos() {
    const tbody = document.getElementById("tblCiclosBody");
    if (!tbody) return;

    // Tabla nueva: 7 columnas
    tbody.innerHTML = `<tr><td colspan="7" class="muted">Cargando...</td></tr>`;

    try {
        const res = await fetch("/api/ciclos/activos");

        if (res.status === 204) {
            CICLOS = [];
            tbody.innerHTML = `<tr><td colspan="7" class="muted">No hay ciclos activos.</td></tr>`;
            return;
        }

        if (!res.ok) {
            const txt = await res.text().catch(() => "");
            throw new Error(txt || `Error HTTP ${res.status}`);
        }

        const data = await res.json().catch(() => []);
        CICLOS = Array.isArray(data) ? data : [];

        if (!CICLOS.length) {
            tbody.innerHTML = `<tr><td colspan="7" class="muted">No hay ciclos activos.</td></tr>`;
            return;
        }

        const q = (document.getElementById("txtBuscarCiclos")?.value || "").toLowerCase().trim();
        renderTablaFiltrada(q);
    } catch (err) {
        console.error(err);
        CICLOS = [];
        tbody.innerHTML = `<tr><td colspan="7" class="muted">Error cargando ciclos.</td></tr>`;
        alert("Error cargando ciclos. Revisá consola.");
    }
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
        alert("Debes seleccionar un Producto/Variedad y una Torre.");
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
        await cargarTorresParaSelector().catch(console.error);
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

    if (id === "modalSiembra") {
        // reset campos
        document.getElementById("frmSiembra")?.reset();

        // reset hidden ids (porque ahora hay hidden)
        document.getElementById("productoId").value = "";
        document.getElementById("variedadId").value = "";
        document.getElementById("torreId").value = "";

        // limpiar selección visual
        document.querySelectorAll("#torresGrid .torre-cell.selected").forEach(x => x.classList.remove("selected"));
    }
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
/* =========================
   Paso 1: Autocomplete Producto (usa GET /api/Producto)
   - Muestra dropdown en #productoSuggs
   - Al seleccionar: setea productoId/variedadId (hidden) y variedadNombre (visible)
   ========================= */

let _productosAll = null;   // cache de /api/Producto
let _prodCache = [];
let _prodDebounce = null;

function initProductoAutocomplete() {
    const inp = document.getElementById("productoNombre");
    const box = document.getElementById("productoSuggs");
    if (!inp || !box) return;

    inp.addEventListener("focus", async () => {
        // precargar lista al enfocar (solo 1 vez)
        if (_productosAll === null) {
            try { _productosAll = await cargarProductosAll(); }
            catch (e) { console.error(e); _productosAll = []; }
        }
    });

    inp.addEventListener("input", () => {
        const q = (inp.value || "").trim().toLowerCase();

        // si el usuario edita, invalida selección previa
        document.getElementById("productoId").value = "";
        document.getElementById("variedadId").value = "";
        const vNom = document.getElementById("variedadNombre");
        if (vNom) vNom.value = "";

        if (_prodDebounce) clearTimeout(_prodDebounce);
        _prodDebounce = setTimeout(async () => {
            if (_productosAll === null) {
                try { _productosAll = await cargarProductosAll(); }
                catch (e) { console.error(e); _productosAll = []; }
            }

            if (q.length < 2) {
                box.hidden = true;
                box.innerHTML = "";
                return;
            }

            const items = filtrarProductosLocal(_productosAll, q);
            _prodCache = items.slice(0, 12); // límite para no saturar UI
            renderProductoSuggs(_prodCache);
        }, 180);
    });

    // click afuera cierra
    document.addEventListener("click", (e) => {
        if (!box.hidden && !box.contains(e.target) && e.target !== inp) {
            box.hidden = true;
        }
    });
}

async function cargarProductosAll() {
    const res = await fetch("/api/Producto");
    if (!res.ok) throw new Error(`No se pudo cargar productos: HTTP ${res.status}`);
    const data = await res.json().catch(() => []);
    return Array.isArray(data) ? data : [];
}

function filtrarProductosLocal(arr, q) {
    return (arr || []).filter(x => {
        const nombre = (x.nombreProducto || "").toLowerCase();
        const codigo = (x.codigo || "").toLowerCase();
        const variedad = (x.nombreVariedad || "").toLowerCase();
        return nombre.includes(q) || codigo.includes(q) || variedad.includes(q);
    });
}

function renderProductoSuggs(items) {
    const box = document.getElementById("productoSuggs");
    if (!box) return;

    box.innerHTML = "";
    if (!items.length) {
        box.hidden = true;
        return;
    }

    items.forEach((p, idx) => {
        const div = document.createElement("div");
        div.className = "autocomplete-item";

        // texto sugerencia: CODIGO - Nombre — Variedad
        const left = `${p.codigo ? p.codigo + " - " : ""}${p.nombreProducto || ""}`.trim();
        const right = p.nombreVariedad ? ` — ${p.nombreVariedad}` : "";
        div.textContent = `${left}${right}`;

        div.addEventListener("mousedown", (e) => {
            e.preventDefault();
            seleccionarProducto(idx);
        });

        box.appendChild(div);
    });

    box.hidden = false;
}

function seleccionarProducto(idx) {
    const p = _prodCache[idx];
    if (!p) return;

    // Visible
    document.getElementById("productoNombre").value = p.nombreProducto || "";
    const vNom = document.getElementById("variedadNombre");
    if (vNom) vNom.value = p.nombreVariedad || "";

    // Hidden (para tu guardarSiembra existente)
    document.getElementById("productoId").value = String(p.productoId || "");
    document.getElementById("variedadId").value = String(p.variedadId || "");

    // cerrar lista
    const box = document.getElementById("productoSuggs");
    if (box) box.hidden = true;
}
function wireFechas() {
    const fechaSiembra = document.getElementById("fechaSiembra");
    const fechaCosecha = document.getElementById("fechaCosechaEstimada");
    if (!fechaSiembra || !fechaCosecha) return;

    const syncMin = () => {
        fechaCosecha.min = fechaSiembra.value || "";

        if (fechaCosecha.value && fechaSiembra.value && fechaCosecha.value < fechaSiembra.value) {
            fechaCosecha.value = fechaSiembra.value;
        }
    };

    // cuando el usuario cambia fechaSiembra, actualiza min y corrige cosecha si hace falta
    fechaSiembra.addEventListener("change", syncMin);

    // cuando el usuario elige cosecha, si por alguna razón queda inválida, corrige
    fechaCosecha.addEventListener("change", () => {
        if (fechaCosecha.value && fechaSiembra.value && fechaCosecha.value < fechaSiembra.value) {
            alert("La fecha de cosecha estimada no puede ser menor a la fecha de siembra.");
            fechaCosecha.value = fechaSiembra.value;
        }
    });

    syncMin();
}
/* =========================
   Torres: selector matriz
   ========================= */

let TORRES = [];

async function cargarTorresParaSelector() {
    const grid = document.getElementById("torresGrid");
    if (!grid) return;

    const res = await fetch("/api/torres", { cache: "no-store" });
    if (!res.ok) throw new Error(`No se pudo cargar torres: HTTP ${res.status}`);

    const data = await res.json().catch(() => []);
    TORRES = Array.isArray(data) ? data : [];

    renderTorresGrid(TORRES);
}

function renderTorresGrid(torres) {
    const grid = document.getElementById("torresGrid");
    if (!grid) return;

    const filas = {};
    torres.forEach(t => {
        const fila = String(t.fila ?? t.Fila ?? "").toUpperCase();
        if (!filas[fila]) filas[fila] = [];
        filas[fila].push(t);
    });

    const ordenFilas = Object.keys(filas).sort();

    grid.innerHTML = ordenFilas.map(f => {
        const arr = filas[f]
            .slice()
            .sort((a, b) =>
                extraerNumTorre(a.codigoTorre ?? a.codigo_torre ?? a.CodigoTorre) -
                extraerNumTorre(b.codigoTorre ?? b.codigo_torre ?? b.CodigoTorre)
            );

        const cells = arr.map(t => {
            const torreId = t.torreId ?? t.torre_id ?? t.TorreId;
            const codigo = t.codigoTorre ?? t.codigo_torre ?? t.CodigoTorre ?? "";

            const capRaw = t.capacidadMaximaPlantas ?? t.capacidad_maxima_plantas ?? t.CapacidadMaximaPlantas;
            const cap = Number.isFinite(Number(capRaw)) ? Number(capRaw) : 0;

            const dispRaw = t.huecosDisponibles ?? t.huecos_disponibles ?? t.HuecosDisponibles;
            const disp = Number.isFinite(Number(dispRaw)) ? Number(dispRaw) : null;

            let estadoClass = "free";
            if (disp !== null) {
                if (disp <= 0) estadoClass = "full";
                else if (disp < cap) estadoClass = "partial";
            }

            const textoDisponibles = (disp === null) ? "—" : `${disp} disponibles`;

            return `
              <div class="torre-cell ${estadoClass}"
                   data-torre-id="${torreId}"
                   data-codigo="${safe(codigo)}"
                   data-disponibles="${disp ?? ""}">
                <div class="torre-code">${safe(String(codigo).replace("TORRE-", ""))}</div>
                <div class="torre-cap">${safe(textoDisponibles)}</div>
              </div>`;
        }).join("");

        return `
          <div class="torres-row" data-fila="${safe(f)}">
            <div class="torres-row-label">${safe(f)}</div>
            ${cells}
          </div>`;
    }).join("");

    if (!grid.dataset.boundClick) {
        grid.addEventListener("click", (e) => {
            const cell = e.target.closest(".torre-cell");
            if (!cell) return;

            const dispStr = cell.dataset.disponibles;
            const disp = dispStr === "" ? null : parseInt(dispStr, 10);

            if (disp !== null && disp <= 0) {
                alert("Esta torre está llena. Seleccioná otra.");
                return;
            }

            grid.querySelectorAll(".torre-cell.selected").forEach(x => x.classList.remove("selected"));
            cell.classList.add("selected");

            document.getElementById("torreId").value = cell.dataset.torreId;
        });

        grid.dataset.boundClick = "1";
    }
}

function extraerNumTorre(codigo) {
    // "TORRE-A11" -> 11
    const m = String(codigo || "").match(/(\d+)$/);
    return m ? parseInt(m[1], 10) : 0;
}