using Abstracciones.Modelos;

namespace Abstracciones.Interfaces.DA
{
    // Equivalente a IUsuarioDA de la referencia
    // ObtenerUsuario          → ObtenerEmpleadoAuth
    // ObtenerPerfilesxUsuario → ObtenerRolesxEmpleado
    // CrearUsuario            → RegistrarEmpleadoAuth
    public interface IEmpleadoAuthDA
    {
        Task<EmpleadoAuth> ObtenerEmpleadoAuth(EmpleadoAuthBase empleado);
        Task<IEnumerable<RolResponse>> ObtenerRolesxEmpleado(EmpleadoAuthBase empleado);
        Task<int> RegistrarEmpleadoAuth(EmpleadoAuthBase empleado);
    }
}
