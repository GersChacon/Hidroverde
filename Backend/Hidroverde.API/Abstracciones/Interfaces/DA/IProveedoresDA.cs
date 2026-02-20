using Abstracciones.Modelos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Abstracciones.Interfaces.DA
{
    public interface IProveedoresDA
    {
        Task<IEnumerable<ProveedorPendientePagoDto>> ListarPendientesPago();
        Task<ProveedorPendientePagoDto> RegistrarCompraMonto(int proveedorId, decimal montoCompra);
        Task<ProveedorPagoResponse> RegistrarPago(int proveedorId, decimal montoPago);
        Task<IEnumerable<ProveedorPagoHistorialDto>> ListarPagosPorProveedor(int proveedorId);
        Task<IEnumerable<ProveedorPagoHistorialDto>> ListarPagos();
    }
}