import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/"                index element={<Inicio />} />
          <Route path="/alertas"         element={<Alertas />} />
          <Route path="/ciclos"          element={<Ciclos />} />
          <Route path="/consumos"        element={<Consumos />} />
          <Route path="/inventario"      element={<Inventario />} />
          <Route path="/inventario-real" element={<InventarioReal />} />
          <Route path="/plagas"          element={<Plagas />} />
          <Route path="/proveedores"     element={<Proveedores />} />
          <Route path="/margenes"        element={<Margenes />} />
          <Route path="/ventas"          element={<Ventas />} />
          <Route path="/kpis"            element={<Kpis />} />
          <Route path="/clientes"        element={<Clientes />} />
          <Route path="/empleados"       element={<Empleados />} />
          <Route path="*"               element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
