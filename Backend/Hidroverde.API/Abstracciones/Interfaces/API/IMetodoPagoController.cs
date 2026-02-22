using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;

namespace Abstracciones.Interfaces.API
{
    public interface IMetodoPagoController
    {
        Task<IActionResult> Obtener();
        Task<IActionResult> Obtener(int metodoPagoId);
        Task<IActionResult> Agregar(MetodoPagoRequest metodoPago);
        Task<IActionResult> Editar(int metodoPagoId, MetodoPagoRequest metodoPago);
        Task<IActionResult> Eliminar(int metodoPagoId);
    }
}


