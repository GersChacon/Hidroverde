using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;

namespace Flujo
{
    // Equivalente a UsuarioFlujo de la referencia
    public class EmpleadoAuthFlujo : IEmpleadoAuthFlujo
    {
        private readonly IEmpleadoAuthDA _empleadoAuthDA;

        public EmpleadoAuthFlujo(IEmpleadoAuthDA empleadoAuthDA)
        {
            _empleadoAuthDA = empleadoAuthDA;
        }

        public async Task<int> RegistrarEmpleadoAuth(EmpleadoAuthBase empleado)
            => await _empleadoAuthDA.RegistrarEmpleadoAuth(empleado);

        public async Task<EmpleadoAuth> ObtenerEmpleadoAuth(EmpleadoAuthBase empleado)
            => await _empleadoAuthDA.ObtenerEmpleadoAuth(empleado);
    }
}
