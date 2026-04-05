using Abstracciones.Modelos;

namespace Abstracciones.Interfaces.Flujo
{
    // Equivalente a IUsuarioFlujo de la referencia
    public interface IEmpleadoAuthFlujo
    {
        Task<int> RegistrarEmpleadoAuth(EmpleadoAuthBase empleado);
        Task<EmpleadoAuth> ObtenerEmpleadoAuth(EmpleadoAuthBase empleado);
    }
}
