using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;

namespace Abstracciones.Interfaces.API
{
    // Equivalente a IAutenticacionController de la referencia
    public interface IAutenticacionController
    {
        Task<IActionResult> PostAsync([FromBody] LoginBase login);
    }

    // Equivalente a IUsuarioController de la referencia
    public interface IEmpleadoAuthController
    {
        Task<IActionResult> PostAsync([FromBody] EmpleadoAuthBase empleado);
        Task<IActionResult> ObtenerEmpleadoAuth([FromBody] EmpleadoAuthBase empleado);
    }
}
