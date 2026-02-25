using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;

namespace Abstracciones.Interfaces.API
{
    public interface IEstadoVentaController
    {
        Task<IActionResult> Obtener();
        Task<IActionResult> Obtener(int estadoVentaId);
        Task<IActionResult> Agregar(EstadoVentaRequest estadoVenta);
        Task<IActionResult> Editar(int estadoVentaId, EstadoVentaRequest estadoVenta);
        Task<IActionResult> Eliminar(int estadoVentaId);
    }
}