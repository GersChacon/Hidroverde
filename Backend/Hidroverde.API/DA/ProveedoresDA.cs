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

        public ProveedoresDA(IRepositorioDapper repositorioDapper)
        {
            _repositorioDapper = repositorioDapper;
        }

        public async Task<IEnumerable<ProveedorPendientePagoDto>> ListarPendientesPago()
        {
            using var conn = _repositorioDapper.ObtenerRepositorio();
            return await conn.QueryAsync<ProveedorPendientePagoDto>("sp_Proveedores_Pendientes", commandType: CommandType.StoredProcedure);
        }

        public async Task<ProveedorPendientePagoDto> RegistrarCompraMonto(int proveedorId, decimal montoCompra)
        {
            using var conn = _repositorioDapper.ObtenerRepositorio();
            return await conn.QueryFirstOrDefaultAsync<ProveedorPendientePagoDto>("sp_Proveedores_RegistrarCompra",
                new { proveedorId, montoCompra }, commandType: CommandType.StoredProcedure);
        }

        public async Task<ProveedorPagoResponse> RegistrarPago(int proveedorId, decimal montoPago)
        {
            using var conn = _repositorioDapper.ObtenerRepositorio();
            return await conn.QueryFirstOrDefaultAsync<ProveedorPagoResponse>("sp_Proveedores_RegistrarPago",
                new { proveedorId, montoPago }, commandType: CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<ProveedorPagoHistorialDto>> ListarPagosPorProveedor(int proveedorId)
        {
            using var conn = _repositorioDapper.ObtenerRepositorio();
            return await conn.QueryAsync<ProveedorPagoHistorialDto>("sp_Proveedores_PagosPorProveedor",
                new { proveedorId }, commandType: CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<ProveedorPagoHistorialDto>> ListarPagos()
        {
            using var conn = _repositorioDapper.ObtenerRepositorio();
            return await conn.QueryAsync<ProveedorPagoHistorialDto>("sp_Proveedores_Pagos", commandType: CommandType.StoredProcedure);
        }

        public async Task<ProveedorPagoResponse> RegistrarCompraPorNombre(string nombreProveedor, decimal montoCompra)
        {
            using var conn = _repositorioDapper.ObtenerRepositorio();
            return await conn.QueryFirstOrDefaultAsync<ProveedorPagoResponse>("sp_Proveedores_RegistrarCompraPorNombre",
                new { nombreProveedor, montoCompra }, commandType: CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<ProveedorItemDto>> ListarActivos()
        {
            using var conn = _repositorioDapper.ObtenerRepositorio();
            return await conn.QueryAsync<ProveedorItemDto>("sp_Proveedores_Activos", commandType: CommandType.StoredProcedure);
        }

        public async Task<ProveedorDto> CrearProveedor(ProveedorCrearRequest request)
        {
            using var conn = _repositorioDapper.ObtenerRepositorio();
            return await conn.QueryFirstOrDefaultAsync<ProveedorDto>("sp_Proveedores_Crear",
                new { request.Nombre, request.Descripcion, request.Correo, request.Telefono }, commandType: CommandType.StoredProcedure);
        }
    }
}