using Abstracciones.Modelos;

namespace Abstracciones.Interfaces.DA
{
    public interface IVentaDA
    {
        Task<IEnumerable<VentaResumenResponse>> Obtener();
        Task<VentaResponse> Obtener(int ventaId);
        Task<int> Crear(VentaRequest venta);
        Task<int> CambiarEstado(int ventaId, int estadoVentaId, string? notas);
        Task<int> ConfirmarPago(int ventaId, int estadoPagoId, int metodoPagoId, string? notas);
        Task<int> Cancelar(int ventaId, string motivo);
        Task<int> AgregarDetalle(int ventaId, List<DetalleVentaRequest> detalle);
        Task<int> EliminarDetalle(int ventaId, int detalleId);
    }
}