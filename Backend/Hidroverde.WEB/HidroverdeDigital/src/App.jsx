import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout         from "./components/Layout";
import RutaProtegida  from "./components/RutaProtegida";
import Login          from "./pages/Login";
import Registro       from "./pages/Registro";
import Inicio         from "./pages/Inicio";
import Alertas        from "./pages/Alertas";
import Ciclos         from "./pages/Ciclos";
import Consumos       from "./pages/Consumos";
import Inventario     from "./pages/Inventario";
import InventarioReal from "./pages/InventarioReal";
import Plagas         from "./pages/Plagas";
import Proveedores    from "./pages/Proveedores";
import Margenes       from "./pages/Margenes";
import Ventas         from "./pages/Ventas";
import Kpis           from "./pages/Kpis";
import Clientes       from "./pages/Clientes";
import Empleados      from "./pages/Empleados";

const ROLES = {
  ADMIN:      "ADMIN",     
  SUPERVISOR: "SUPERVISOR",  
  OPERARIO:   "OPERARIO",   
  VENTAS:     "VENTAS",     
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Rutas públicas */}
        <Route path="/login"    element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* Contenedor con layout protegido — cualquier empleado autenticado */}
        <Route
          element={
            <RutaProtegida>
              <Layout />
            </RutaProtegida>
          }
        >
          {/* ── Todos los roles ── */}
          <Route path="/"        index element={<Inicio />} />
          <Route path="/alertas"        element={<Alertas />} />

          {/* ── Producción: operarios, supervisores y admin ── */}
          <Route path="/ciclos"
            element={
              <RutaProtegida roles={[ROLES.OPERARIO, ROLES.SUPERVISOR, ROLES.ADMIN]}>
                <Ciclos />
              </RutaProtegida>
            }
          />
          <Route path="/inventario"
            element={
              <RutaProtegida roles={[ROLES.OPERARIO, ROLES.SUPERVISOR, ROLES.ADMIN]}>
                <Inventario />
              </RutaProtegida>
            }
          />
          <Route path="/inventario-real"
            element={
              <RutaProtegida roles={[ROLES.OPERARIO, ROLES.SUPERVISOR, ROLES.ADMIN]}>
                <InventarioReal />
              </RutaProtegida>
            }
          />
          <Route path="/consumos"
            element={
              <RutaProtegida roles={[ROLES.OPERARIO, ROLES.SUPERVISOR, ROLES.ADMIN]}>
                <Consumos />
              </RutaProtegida>
            }
          />
          <Route path="/plagas"
            element={
              <RutaProtegida roles={[ROLES.OPERARIO, ROLES.SUPERVISOR, ROLES.ADMIN]}>
                <Plagas />
              </RutaProtegida>
            }
          />

          {/* ── Comercial: ventas, supervisores y admin ── */}
          <Route path="/ventas"
            element={
              <RutaProtegida roles={[ROLES.VENTAS, ROLES.SUPERVISOR, ROLES.ADMIN]}>
                <Ventas />
              </RutaProtegida>
            }
          />
          <Route path="/clientes"
            element={
              <RutaProtegida roles={[ROLES.VENTAS, ROLES.SUPERVISOR, ROLES.ADMIN]}>
                <Clientes />
              </RutaProtegida>
            }
          />
          <Route path="/proveedores"
            element={
              <RutaProtegida roles={[ROLES.VENTAS, ROLES.SUPERVISOR, ROLES.ADMIN]}>
                <Proveedores />
              </RutaProtegida>
            }
          />
          <Route path="/margenes"
            element={
              <RutaProtegida roles={[ROLES.SUPERVISOR, ROLES.ADMIN]}>
                <Margenes />
              </RutaProtegida>
            }
          />

          {/* ── Reportes / KPIs: supervisores y admin ── */}
          <Route path="/kpis"
            element={
              <RutaProtegida roles={[ROLES.SUPERVISOR, ROLES.ADMIN]}>
                <Kpis />
              </RutaProtegida>
            }
          />

          {/* ── Administración: solo admin ── */}
          <Route path="/empleados"
            element={
              <RutaProtegida roles={[ROLES.ADMIN]}>
                <Empleados />
              </RutaProtegida>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
