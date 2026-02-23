const API = "/api/proveedores";

export function init() {
    // ====== Tabs ======
    const tabPend = document.getElementById("tabPendientes");
    const tabPagos = document.getElementById("tabPagos");
    const viewPend = document.getElementById("viewPendientes");
    const viewPagos = document.getElementById("viewPagos");

    // ====== Pendientes ======
    const tbody = document.getElementById("tablaProveedores");
    const empty = document.getElementById("provEmpty");

    // ====== Nuevo pendiente (registrar compra por pagar) ======
    const btnNuevoPendiente = document.getElementById("btnNuevoPendiente");
    const modalNuevoPendiente = document.getElementById("modalNuevoPendiente");
    const selProveedor = document.getElementById("selProveedor");
    const inputMontoCompra = document.getElementById("inputMontoCompra");
    const inputComentarioCompra = document.getElementById("inputComentarioCompra");
    const btnCancelarNuevoPendiente = document.getElementById("btnCancelarNuevoPendiente");
    const btnConfirmarNuevoPendiente = document.getElementById("btnConfirmarNuevoPendiente");

    // ====== Modal pago ======
    const modalPago = document.getElementById("modalPago");
    const inputMonto = document.getElementById("inputMontoPago");
    const provIdInput = document.getElementById("provIdSeleccionado");
    const btnCancelarPago = document.getElementById("btnCancelarPago");
    const btnConfirmarPago = document.getElementById("btnConfirmarPago");

    // ====== Modal historial por proveedor ======
    const modalHist = document.getElementById("modalHistorial");
    const btnCerrarHist = document.getElementById("btnCerrarHistorial");
    const tablaHist = document.getElementById("tablaHistorial");
    const histTitle = document.getElementById("histTitle");
    const histEmpty = document.getElementById("histEmpty");

    // ====== Pagos globales ======
    const tablaPagos = document.getElementById("tablaPagos");
    const pagosEmpty = document.getElementById("pagosEmpty");


    const btnNuevoProveedor = document.getElementById("btnNuevoProveedor");
    const modalNuevoProveedor = document.getElementById("modalNuevoProveedor");
    const inpProvNombre = document.getElementById("inpProvNombre");
    const inpProvDesc = document.getElementById("inpProvDesc");
    const inpProvCorreo = document.getElementById("inpProvCorreo");
    const inpProvTel = document.getElementById("inpProvTel");
    const btnCancelarNuevoProveedor = document.getElementById("btnCancelarNuevoProveedor");
    const btnConfirmarNuevoProveedor = document.getElementById("btnConfirmarNuevoProveedor");
    // ---------- Helpers ----------
    function fmt(n) {
        const num = Number(n ?? 0);
        return new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC" }).format(num);
    }

    function fmtDate(d) {
        const dt = new Date(d);
        if (isNaN(dt.getTime())) return "";
        return dt.toLocaleString("es-CR");
    }

    function tagEstado(estado) {
        const cls = (estado || "").toLowerCase();
        return `<span class="prov-tag ${cls}">${estado ?? ""}</span>`;
    }

    function activarTab(nombre) {
        const esPend = nombre === "pendientes";

        tabPend?.classList.toggle("active", esPend);
        tabPagos?.classList.toggle("active", !esPend);

        if (viewPend) viewPend.style.display = esPend ? "block" : "none";
        if (viewPagos) viewPagos.style.display = esPend ? "none" : "block";
    }

    async function apiJson(url, options) {
        const resp = await fetch(url, options);
        if (!resp.ok) {
            const t = await resp.text();
            throw new Error(t || `HTTP ${resp.status}`);
        }
        // si el endpoint devuelve vacío, evitar crash
        const ct = resp.headers.get("content-type") || "";
        if (!ct.includes("application/json")) return null;
        return await resp.json();
    }

    // ---------- Pendientes ----------
    async function cargarPendientes() {
        if (!tbody) return;

        const data = await apiJson(`${API}/pendientes-pago`);
        const arr = Array.isArray(data) ? data : [];

        tbody.innerHTML = "";
        if (empty) empty.style.display = arr.length ? "none" : "block";
        if (!arr.length) return;

        arr.forEach(p => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
        <td>${p.nombre ?? ""}</td>
        <td>${fmt(p.totalCompras)}</td>
        <td>${fmt(p.totalPagado)}</td>
        <td>${fmt(p.saldoPendiente)}</td>
        <td><button class="btn-pagar" type="button">Pagar</button></td>
        <td><button class="btn-hist" type="button">Historial</button></td>
      `;

            tr.querySelector(".btn-pagar")?.addEventListener("click", () => abrirModalPago(p.proveedorId));
            tr.querySelector(".btn-hist")?.addEventListener("click", () => abrirHistorial(p.proveedorId, p.nombre));

            tbody.appendChild(tr);
        });
    }

    function abrirModalPago(proveedorId) {
        if (!modalPago || !provIdInput || !inputMonto) return;

        provIdInput.value = String(proveedorId);
        inputMonto.value = "";
        modalPago.style.display = "flex";
        inputMonto.focus?.();
    }

    btnCancelarPago?.addEventListener("click", () => {
        if (modalPago) modalPago.style.display = "none";
    });

    btnConfirmarPago?.addEventListener("click", async () => {
        try {
            const proveedorId = parseInt(provIdInput?.value ?? "0", 10);
            const monto = parseFloat(inputMonto?.value ?? "0");

            if (!proveedorId) return alert("Proveedor inválido.");
            if (!monto || monto <= 0) return alert("Ingrese un monto válido.");

            const data = await apiJson(`${API}/pagos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ proveedorId, montoPago: monto })
            });

            alert((data?.estadoPago === "PARCIAL" ? "⚠️ " : "✅ ") + (data?.mensaje ?? "Pago registrado"));
            if (modalPago) modalPago.style.display = "none";

            if (viewPagos && viewPagos.style.display !== "none") await cargarPagosGlobal();
            else await cargarPendientes();
        } catch (err) {
            console.error(err);
            alert(err.message || "Error al registrar pago");
        }
    });

    // ---------- Historial por proveedor ----------
    async function abrirHistorial(proveedorId, nombre) {
        try {
            if (!modalHist || !tablaHist || !histTitle) return;

            histTitle.textContent = `Historial de pagos · ${nombre ?? ""}`;
            tablaHist.innerHTML = "";
            if (histEmpty) histEmpty.style.display = "none";

            modalHist.style.display = "flex";

            const data = await apiJson(`${API}/${proveedorId}/pagos`);
            const arr = Array.isArray(data) ? data : [];

            if (!arr.length) {
                if (histEmpty) histEmpty.style.display = "block";
                return;
            }

            arr.forEach(x => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
          <td>${fmtDate(x.fechaPago)}</td>
          <td>${fmt(x.montoPago)}</td>
          <td>${fmt(x.saldoAntes)}</td>
          <td>${fmt(x.saldoDespues)}</td>
          <td>${tagEstado(x.estadoPago)}</td>
          <td>${x.comentario ?? ""}</td>
        `;
                tablaHist.appendChild(tr);
            });
        } catch (err) {
            console.error(err);
            if (tablaHist) tablaHist.innerHTML = `<tr><td colspan="6">${err.message}</td></tr>`;
        }
    }

    btnCerrarHist?.addEventListener("click", () => {
        if (modalHist) modalHist.style.display = "none";
    });

    // ---------- Nuevo pendiente: cargar lista de proveedores (por nombre) ----------
    async function cargarProveedoresSelect() {
        if (!selProveedor) return;

        // ✅ este endpoint lo creamos: GET /api/proveedores/lista
        const data = await apiJson(`${API}/lista`);
        const arr = Array.isArray(data) ? data : [];

        selProveedor.innerHTML = "";
        arr.forEach(p => {
            const opt = document.createElement("option");
            // value = nombre (porque el POST será por nombre)
            opt.value = p.nombre;
            opt.textContent = p.nombre;
            selProveedor.appendChild(opt);
        });
    }

    function abrirModalNuevoPendiente() {
        if (!modalNuevoPendiente) return;

        if (inputMontoCompra) inputMontoCompra.value = "";
        if (inputComentarioCompra) inputComentarioCompra.value = "";

        modalNuevoPendiente.style.display = "flex";
        inputMontoCompra?.focus?.();
    }

    btnNuevoPendiente?.addEventListener("click", async () => {
        try {
            await cargarProveedoresSelect();
            abrirModalNuevoPendiente();
        } catch (e) {
            console.error(e);
            alert("No se pudieron cargar proveedores para seleccionar.");
        }
    });

    btnCancelarNuevoPendiente?.addEventListener("click", () => {
        if (modalNuevoPendiente) modalNuevoPendiente.style.display = "none";
    });

    btnConfirmarNuevoPendiente?.addEventListener("click", async () => {
        try {
            const nombreProveedor = (selProveedor?.value || "").trim();
            const monto = parseFloat(inputMontoCompra?.value || "0");

            if (!nombreProveedor) return alert("Seleccione un proveedor.");
            if (!monto || monto <= 0) return alert("Ingrese un monto válido.");

            // ✅ nuevo endpoint por nombre
            const payload = {
                nombreProveedor,
                montoCompra: monto
                // comentario no lo estás guardando en Proveedores_Saldo,
                // si luego quieres guardarlo, sería en una tabla de compras.
            };

            await apiJson(`${API}/compras/nombre`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (modalNuevoPendiente) modalNuevoPendiente.style.display = "none";
            alert("✅ Pendiente registrado");

            await cargarPendientes();
        } catch (err) {
            console.error(err);
            alert(err.message || "Error registrando pendiente.");
        }
    });

    // ---------- Pagos globales ----------
    async function cargarPagosGlobal() {
        if (!tablaPagos) return;

        const data = await apiJson(`${API}/pagos`);
        const arr = Array.isArray(data) ? data : [];

        tablaPagos.innerHTML = "";
        if (pagosEmpty) pagosEmpty.style.display = arr.length ? "none" : "block";
        if (!arr.length) return;

        arr.forEach(x => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
        <td>${fmtDate(x.fechaPago)}</td>
        <td>${x.nombre ?? ""}</td>
        <td>${fmt(x.montoPago)}</td>
        <td>${fmt(x.saldoAntes)}</td>
        <td>${fmt(x.saldoDespues)}</td>
        <td>${tagEstado(x.estadoPago)}</td>
        <td>${x.comentario ?? ""}</td>
      `;
            tablaPagos.appendChild(tr);
        });
    }

    // ---------- Events ----------
    document.getElementById("btnRefrescar")?.addEventListener("click", async () => {
        try {
            if (viewPagos && viewPagos.style.display !== "none") await cargarPagosGlobal();
            else await cargarPendientes();
        } catch (err) {
            console.error(err);
            alert("Error refrescando. Revisa consola.");
        }
    });

    tabPend?.addEventListener("click", async () => {
        activarTab("pendientes");
        try {
            await cargarPendientes();
        } catch (err) {
            console.error(err);
            alert("Error cargando pendientes.");
        }
    });

    tabPagos?.addEventListener("click", async () => {
        activarTab("pagos");
        try {
            await cargarPagosGlobal();
        } catch (err) {
            console.error(err);
            alert("Error cargando pagos.");
        }
    });
    btnNuevoProveedor?.addEventListener("click", () => {
        inpProvNombre.value = "";
        inpProvDesc.value = "";
        inpProvCorreo.value = "";
        inpProvTel.value = "";
        modalNuevoProveedor.style.display = "flex";
        inpProvNombre.focus?.();
    });

    btnCancelarNuevoProveedor?.addEventListener("click", () => {
        modalNuevoProveedor.style.display = "none";
    });

    btnConfirmarNuevoProveedor?.addEventListener("click", async () => {
        try {
            const nombre = (inpProvNombre.value || "").trim();
            if (!nombre) return alert("Nombre es obligatorio.");

            await apiJson(`${API}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre,
                    descripcion: (inpProvDesc.value || "").trim() || null,
                    correo: (inpProvCorreo.value || "").trim() || null,
                    telefono: (inpProvTel.value || "").trim() || null
                })
            });

            modalNuevoProveedor.style.display = "none";
            alert("✅ Proveedor creado");

            // refrescar dropdown del modal “Nuevo pendiente” si está abierto o si lo usas luego
            // (opcional) await cargarProveedoresSelect();

            // refrescar tabla pendientes (por si el proveedor nuevo luego tiene compras)
            await cargarPendientes();
        } catch (e) {
            console.error(e);
            alert(e.message || "Error creando proveedor");
        }
    });

    modalNuevoProveedor?.addEventListener("click", (e) => {
        if (e.target === modalNuevoProveedor) modalNuevoProveedor.style.display = "none";
    });

    // cerrar modales al click fuera
    modalPago?.addEventListener("click", (e) => {
        if (e.target === modalPago) modalPago.style.display = "none";
    });
    modalHist?.addEventListener("click", (e) => {
        if (e.target === modalHist) modalHist.style.display = "none";
    });
    modalNuevoPendiente?.addEventListener("click", (e) => {
        if (e.target === modalNuevoPendiente) modalNuevoPendiente.style.display = "none";
    });

    // ---------- Init ----------
    (async () => {
        try {
            if (!tabPend || !tabPagos || !viewPend || !viewPagos) {
                await cargarPendientes();
                return;
            }

            activarTab("pendientes");
            await cargarPendientes();
        } catch (err) {
            console.error(err);
            alert("Error inicializando proveedores. Revisa consola.");
        }
    })();
}