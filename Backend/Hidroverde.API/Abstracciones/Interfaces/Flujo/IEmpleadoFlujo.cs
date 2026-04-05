using Abstracciones.Modelos;

namespace Abstracciones.Interfaces.Flujo
{
    public interface IEmpleadoFlujo
    {
        Task<IEnumerable<EmpleadoResponse>> Obtener();
        Task<EmpleadoResponse> Obtener(int empleadoId);
        Task<IEnumerable<RolResponse>> ObtenerRolesxEmpleado(int empleadoId);
        Task<int> Agregar(EmpleadoRequest empleado);
        Task<int> Editar(int empleadoId, EmpleadoRequest empleado);
        Task<int> CambiarEstado(int empleadoId, string estado);
    }
}
