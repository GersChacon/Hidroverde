using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;

namespace Abstracciones.Interfaces.API
{
    public interface IEstadoPagoController
    {
        Task<IActionResult> Obtener();
        Task<IActionResult> Obtener(int estadoPagoId);
        Task<IActionResult> Agregar(EstadoPagoRequest estadoPago);
        Task<IActionResult> Editar(int estadoPagoId, EstadoPagoRequest estadoPago);
        Task<IActionResult> Eliminar(int estadoPagoId);
    }
}