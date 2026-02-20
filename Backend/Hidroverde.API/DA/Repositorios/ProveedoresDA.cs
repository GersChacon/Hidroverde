using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos;
using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DA
{
    public class ProveedoresDA : IProveedoresDA
    {
        private readonly IRepositorioDapper _repositorioDapper;
        private readonly SqlConnection _sqlConnection;

        public ProveedoresDA(IRepositorioDapper repositorioDapper)
        {
            _repositorioDapper = repositorioDapper;
            _sqlConnection = _repositorioDapper.ObtenerRepositorio();
        }

        public async Task<IEnumerable<ProveedorPendientePagoDto>> ListarPendientesPago()
        {
            var resultado = await _sqlConnection.QueryAsync<ProveedorPendientePagoDto>(
                "sp_Proveedores_PendientesPago",
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }

        public async Task<ProveedorPendientePagoDto> RegistrarCompraMonto(int proveedorId, decimal montoCompra)
        {
            var resultado = await _sqlConnection.QueryFirstAsync<ProveedorPendientePagoDto>(
                "sp_Proveedor_RegistrarCompraMonto",
                new { proveedor_id = proveedorId, monto_compra = montoCompra },
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }

        public async Task<ProveedorPagoResponse> RegistrarPago(int proveedorId, decimal montoPago)
        {
            var p = new DynamicParameters();
            p.Add("@proveedor_id", proveedorId);
            p.Add("@monto_pago", montoPago);
            p.Add("@mensaje", dbType: DbType.String, size: 300, direction: ParameterDirection.Output);

            var resp = await _sqlConnection.QueryFirstAsync<ProveedorPagoResponse>(
                "sp_Proveedor_RegistrarPago",
                p,
                commandType: CommandType.StoredProcedure
            );

            // El SP también devuelve el mensaje en OUTPUT (por si luego cambias el SELECT)
            var msg = p.Get<string>("@mensaje");
            if (!string.IsNullOrWhiteSpace(msg))
                resp.Mensaje = msg;

            return resp;
        }

        public async Task<IEnumerable<ProveedorPagoHistorialDto>> ListarPagosPorProveedor(int proveedorId)
        {
            var resultado = await _sqlConnection.QueryAsync<ProveedorPagoHistorialDto>(
                "sp_Proveedor_Pagos_ListarPorProveedor",
                new { proveedor_id = proveedorId },
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }

        public async Task<IEnumerable<ProveedorPagoHistorialDto>> ListarPagos()
        {
            var resultado = await _sqlConnection.QueryAsync<ProveedorPagoHistorialDto>(
                "sp_Proveedor_Pagos_Listar",
                commandType: CommandType.StoredProcedure
            );
            return resultado;
        }
    }
}