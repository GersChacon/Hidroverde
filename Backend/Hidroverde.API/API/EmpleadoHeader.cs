using Microsoft.AspNetCore.Http;

namespace Hidroverde.API
{
    public static class EmpleadoHeader
    {
        public static int ObtenerEmpleadoId(HttpRequest request)
        {
            if (!request.Headers.TryGetValue("X-Empleado-Id", out var valor))
                throw new Exception("Falta el header X-Empleado-Id.");

            if (!int.TryParse(valor.ToString(), out int empleadoId) || empleadoId <= 0)
                throw new Exception("Header X-Empleado-Id inválido.");

            return empleadoId;
        }
    }
}
