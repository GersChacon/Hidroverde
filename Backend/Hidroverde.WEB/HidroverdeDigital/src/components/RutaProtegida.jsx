import { Navigate } from "react-router-dom";
import { estaAutenticado, tieneRol } from "../services/auth";

export default function RutaProtegida({ children, roles = [], redirectTo = "/" }) {
  if (!estaAutenticado()) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !tieneRol(...roles)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
