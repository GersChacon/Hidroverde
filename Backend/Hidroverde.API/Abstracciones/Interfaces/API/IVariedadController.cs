using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;

namespace Abstracciones.Interfaces.API
{
    public interface IVariedadController
    {
        Task<IActionResult> Obtener();
        Task<IActionResult> Obtener(int variedadId);
        Task<IActionResult> Agregar(VariedadRequest variedad);
        Task<IActionResult> Editar(int variedadId, VariedadRequest variedad);
        Task<IActionResult> Eliminar(int variedadId);
    }
}