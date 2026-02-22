using Abstracciones.Modelos;

namespace Abstracciones.Interfaces.Flujo
{
    public interface IVentaFlujo
    {
        Task<IEnumerable<VentaResumenResponse>> Obtener();
        Task<VentaResponse> Obtener(int ventaId);
        Task<int> Crear(VentaRequest venta);
        Task<int> CambiarEstado(int ventaId, VentaEstadoRequest request);
        Task<int> ConfirmarPago(int ventaId, VentaPagoRequest request);
        Task<int> Cancelar(int ventaId, VentaCancelarRequest request);
        Task<int> AgregarDetalle(int ventaId, VentaAgregarDetalleRequest request);
        Task<int> EliminarDetalle(int ventaId, int detalleId);
    }
}