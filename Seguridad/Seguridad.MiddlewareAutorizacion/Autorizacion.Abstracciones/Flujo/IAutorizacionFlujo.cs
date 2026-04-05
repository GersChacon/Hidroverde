using Autorizacion.Abstracciones.Modelos;

namespace Autorizacion.Abstracciones.Flujo
{
    public interface IAutorizacionFlujo
    {
        Task<Empleado> ObtenerEmpleado(Empleado empleado);
        Task<IEnumerable<Rol>> ObtenerRolesxEmpleado(Empleado empleado);
    }
}
