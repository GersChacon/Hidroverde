using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;

namespace Abstracciones.Interfaces.API
{
    public interface IRolController
    {
        Task<IActionResult> Obtener();
        Task<IActionResult> Obtener(int rolId);
        Task<IActionResult> Agregar(RolRequest rol);
        Task<IActionResult> Editar(int rolId, RolRequest rol);
        Task<IActionResult> Eliminar(int rolId);
    }
}