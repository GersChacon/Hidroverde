using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;

namespace Abstracciones.Interfaces.API
{
    public interface ITipoCultivoController
    {
        Task<IActionResult> Obtener();
        Task<IActionResult> Obtener(int unidadId);
        Task<IActionResult> Agregar(TipoCultivoRequest tipoCultivo);
        Task<IActionResult> Editar(int unidadId, TipoCultivoRequest tipoCultivo);
        Task<IActionResult> Eliminar(int unidadId);
    }
}