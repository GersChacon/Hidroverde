using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;

namespace Abstracciones.Interfaces.API
{
    public interface IVentaController
    {
        Task<IActionResult> Obtener();
        Task<IActionResult> Obtener(int ventaId);
        Task<IActionResult> Crear(VentaRequest venta);
        Task<IActionResult> CambiarEstado(int ventaId, VentaEstadoRequest request);
        Task<IActionResult> ConfirmarPago(int ventaId, VentaPagoRequest request);
        Task<IActionResult> Cancelar(int ventaId, VentaCancelarRequest request);
        Task<IActionResult> AgregarDetalle(int ventaId, VentaAgregarDetalleRequest request);
        Task<IActionResult> EliminarDetalle(int ventaId, int detalleId);
    }
}