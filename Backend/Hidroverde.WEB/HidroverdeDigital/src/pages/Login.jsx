import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import { sha256, guardarSesion } from "../services/auth";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm]         = useState({ usuarioSistema: "", clave: "" });
  const [error, setError]       = useState("");
  const [cargando, setCargando] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.usuarioSistema || !form.clave) {
      setError("Ingresá usuario y contraseña.");
      return;
    }

    setCargando(true);
    try {
      // Hashear contraseña antes de enviar — igual que en Productos
      const claveHash = await sha256(form.clave);

      const res = await api("/api/autenticacion/login", {
        method: "POST",
        body: {
          usuarioSistema: form.usuarioSistema,
          claveHash,
          email: "",
        },
      });

      const { accessToken, validacionExitosa } = res.data;

      if (!validacionExitosa || !accessToken) {
        setError("Usuario o contraseña incorrectos.");
        return;
      }

      // Extraer empleadoId del token JWT
      const payload    = JSON.parse(atob(accessToken.split(".")[1]));
      const empleadoId = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]
                      ?? payload.nameid
                      ?? payload.sub
                      ?? "1";

      guardarSesion(accessToken, empleadoId);
      navigate("/", { replace: true });
    } catch {
      setError("Usuario o contraseña incorrectos.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <span className="text-4xl mb-2">🌿</span>
          <h1 className="text-2xl font-bold text-green-700">Hidroverde</h1>
          <p className="text-sm text-gray-500 mt-1">Sistema de gestión hidropónica</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuario
            </label>
            <input
              type="text"
              name="usuarioSistema"
              value={form.usuarioSistema}
              onChange={handleChange}
              placeholder="usuario"
              autoComplete="username"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              name="clave"
              value={form.clave}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60
                       text-white font-semibold rounded-lg py-2 text-sm transition-colors"
          >
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Primera vez?{" "}
          <Link to="/registro" className="text-green-600 hover:underline font-medium">
            Activá tu cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}
