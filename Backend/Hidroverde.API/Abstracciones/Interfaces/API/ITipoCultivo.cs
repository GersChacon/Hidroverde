using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;

namespace Abstracciones.Interfaces.API
{
    public interface IUnidadMedidaController
    {
        Task<IActionResult> Obtener();
        Task<IActionResult> Obtener(int unidadId);
        Task<IActionResult> Agregar(UnidadMedidaRequest unidadMedida);
        Task<IActionResult> Editar(int unidadId, UnidadMedidaRequest unidadMedida);
        Task<IActionResult> Eliminar(int unidadId);
    }
}