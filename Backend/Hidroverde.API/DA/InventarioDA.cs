using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos;
using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DA
{
    public class InventarioDA : IInventarioDA
    {
        private readonly IRepositorioDapper _repositorioDapper;

        public InventarioDA(IRepositorioDapper repositorioDapper)
        {
            _repositorioDapper = repositorioDapper;
        }

        public async Task<IEnumerable<InventarioActualResponse>> ListarActual(
            int? cicloOrigenId,
            int? productoId,
            string? lote,
            bool soloDisponibles)
        {
            using var connection = _repositorioDapper.ObtenerRepositorio();
            return await connection.QueryAsync<InventarioActualResponse>(
                "dbo.sp_InventarioActual_Listar",
                new
                {
                    ciclo_origen_id = cicloOrigenId,
                    producto_id = productoId,
                    lote = lote,
                    solo_disponibles = soloDisponibles ? 1 : 0
                },
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<InventarioActualResponse?> ObtenerActualPorId(int inventarioId)
        {
            using var connection = _repositorioDapper.ObtenerRepositorio();
            return await connection.QueryFirstOrDefaultAsync<InventarioActualResponse>(
                "dbo.sp_InventarioActual_Obtener",
                new { inventario_id = inventarioId },
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<IEnumerable<MovimientoInventarioResponse>> ListarMovimientos(
            int inventarioId,
            DateTime? desde,
            DateTime? hasta)
        {
            using var connection = _repositorioDapper.ObtenerRepositorio();
            return await connection.QueryAsync<MovimientoInventarioResponse>(
                "dbo.sp_Inventario_Movimientos_Listar",
                new { inventario_id = inventarioId, desde = desde, hasta = hasta },
                commandType: CommandType.StoredProcedure
            );
        }
    }
}