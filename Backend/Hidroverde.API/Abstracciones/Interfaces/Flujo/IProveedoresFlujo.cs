using Abstracciones.Modelos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Abstracciones.Interfaces.Flujo
{
    public interface IProveedoresFlujo
    {
        Task<IEnumerable<ProveedorPendientePagoDto>> ListarPendientesPago();
        Task<ProveedorPendientePagoDto> RegistrarCompraMonto(ProveedorCompraMontoRequest request);
        Task<ProveedorPagoResponse> RegistrarPago(ProveedorPagoRequest request);
        Task<IEnumerable<ProveedorPagoHistorialDto>> ListarPagosPorProveedor(int proveedorId);
        Task<IEnumerable<ProveedorPagoHistorialDto>> ListarPagos();
    }
}