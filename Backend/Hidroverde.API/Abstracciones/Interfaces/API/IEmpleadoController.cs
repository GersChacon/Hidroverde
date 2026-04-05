using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;

namespace Abstracciones.Interfaces.API
{
    public interface IEmpleadoController
    {
        Task<IActionResult> Obtener();
        Task<IActionResult> Obtener(int empleadoId);
        Task<IActionResult> ObtenerRolesxEmpleado(int empleadoId);
        Task<IActionResult> Agregar(EmpleadoRequest empleado);
        Task<IActionResult> Editar(int empleadoId, EmpleadoRequest empleado);
        Task<IActionResult> CambiarEstado(int empleadoId, EmpleadoEstadoRequest request);
    }
}
