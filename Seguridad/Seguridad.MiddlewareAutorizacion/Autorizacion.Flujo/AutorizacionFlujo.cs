using Autorizacion.Abstracciones.DA;
using Autorizacion.Abstracciones.Flujo;
using Autorizacion.Abstracciones.Modelos;

namespace Autorizacion.Flujo
{
    public class AutorizacionFlujo : IAutorizacionFlujo
    {
        private readonly ISeguridadDA _seguridadDA;

        public AutorizacionFlujo(ISeguridadDA seguridadDA)
        {
            _seguridadDA = seguridadDA;
        }
        public async Task<Empleado> ObtenerEmpleado(Empleado empleado)
            => await _seguridadDA.ObtenerInformacionEmpleado(empleado);
        public async Task<IEnumerable<Rol>> ObtenerRolesxEmpleado(Empleado empleado)
            => await _seguridadDA.ObtenerRolesxEmpleado(empleado);
    }
}
