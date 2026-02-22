using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;

namespace Flujo
{
    public class VentaFlujo : IVentaFlujo
    {
        private readonly IVentaDA _ventaDA;

        public VentaFlujo(IVentaDA ventaDA)
        {
            _ventaDA = ventaDA;
        }

        public Task<IEnumerable<VentaResumenResponse>> Obtener() =>
            _ventaDA.Obtener();

        public Task<VentaResponse> Obtener(int ventaId) =>
            _ventaDA.Obtener(ventaId);

        public Task<int> Crear(VentaRequest venta) =>
            _ventaDA.Crear(venta);

        public Task<int> CambiarEstado(int ventaId, VentaEstadoRequest request) =>
            _ventaDA.CambiarEstado(ventaId, request.EstadoVentaId, request.Notas);

        public Task<int> ConfirmarPago(int ventaId, VentaPagoRequest request) =>
            _ventaDA.ConfirmarPago(ventaId, request.EstadoPagoId, request.MetodoPagoId, request.Notas);

        public Task<int> Cancelar(int ventaId, VentaCancelarRequest request) =>
            _ventaDA.Cancelar(ventaId, request.Motivo);

        public Task<int> AgregarDetalle(int ventaId, VentaAgregarDetalleRequest request) =>
            _ventaDA.AgregarDetalle(ventaId, request.Detalle);

        public Task<int> EliminarDetalle(int ventaId, int detalleId) =>
            _ventaDA.EliminarDetalle(ventaId, detalleId);
    }
}