import { Navigate } from "react-router-dom";
import { estaAutenticado } from "../services/auth";

export default function RutaProtegida({ children }) {
  if (!estaAutenticado()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
