using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Flujo
{
    public class ProveedoresFlujo : IProveedoresFlujo
    {
        private readonly IProveedoresDA _proveedoresDA;

        public ProveedoresFlujo(IProveedoresDA proveedoresDA)
        {
            _proveedoresDA = proveedoresDA;
        }

        public async Task<IEnumerable<ProveedorPendientePagoDto>> ListarPendientesPago()
        {
            return await _proveedoresDA.ListarPendientesPago();
        }
        public async Task<ProveedorPendientePagoDto> RegistrarCompraMonto(ProveedorCompraMontoRequest request)
        {
            return await _proveedoresDA.RegistrarCompraMonto(request.ProveedorId, request.MontoCompra);
        }

        public async Task<ProveedorPagoResponse> RegistrarPago(ProveedorPagoRequest request)
        {
            return await _proveedoresDA.RegistrarPago(request.ProveedorId, request.MontoPago);
        }

        public async Task<IEnumerable<ProveedorPagoHistorialDto>> ListarPagosPorProveedor(int proveedorId)
        {
            return await _proveedoresDA.ListarPagosPorProveedor(proveedorId);
        }

        public async Task<IEnumerable<ProveedorPagoHistorialDto>> ListarPagos()
        {
            return await _proveedoresDA.ListarPagos();
        }
        public async Task<ProveedorPagoResponse> RegistrarCompraPorNombre(ProveedorCompraNombreRequest request)
        {
            return await _proveedoresDA.RegistrarCompraPorNombre(request.NombreProveedor, request.MontoCompra);
        }
        public async Task<IEnumerable<ProveedorItemDto>> ListarActivos()
        {
            return await _proveedoresDA.ListarActivos();
        }
        public async Task<ProveedorDto> CrearProveedor(ProveedorCrearRequest request)
        {
            return await _proveedoresDA.CrearProveedor(request);
        }
    }
}