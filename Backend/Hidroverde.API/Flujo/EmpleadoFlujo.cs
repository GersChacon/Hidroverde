using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;

namespace Flujo
{
    public class EmpleadoFlujo : IEmpleadoFlujo
    {
        private readonly IEmpleadoDA _empleadoDA;
        public EmpleadoFlujo(IEmpleadoDA empleadoDA) => _empleadoDA = empleadoDA;

        public Task<int> Agregar(EmpleadoRequest empleado) => _empleadoDA.Agregar(empleado);
        public Task<int> Editar(int empleadoId, EmpleadoRequest empleado) => _empleadoDA.Editar(empleadoId, empleado);
        public Task<int> CambiarEstado(int empleadoId, string estado) => _empleadoDA.CambiarEstado(empleadoId, estado);
        public Task<IEnumerable<EmpleadoResponse>> Obtener() => _empleadoDA.Obtener();
        public Task<EmpleadoResponse> Obtener(int empleadoId) => _empleadoDA.Obtener(empleadoId);
    }
}