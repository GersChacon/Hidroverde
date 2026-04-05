using Autorizacion.Abstracciones.Modelos;

namespace Autorizacion.Abstracciones.DA
{
    public interface ISeguridadDA
    {
        Task<Empleado> ObtenerInformacionEmpleado(Empleado empleado);
        Task<IEnumerable<Rol>> ObtenerRolesxEmpleado(Empleado empleado);
    }
}
