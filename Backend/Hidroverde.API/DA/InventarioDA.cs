using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos;
using Dapper; 
using Microsoft.Data.SqlClient;
using System.Data;

namespace DA
{
    public class InventarioDA : IInventarioDA
    {
        private readonly SqlConnection _conn;

        public InventarioDA(IRepositorioDapper repo)
        {
            _conn = repo.ObtenerRepositorio();
        }

        public async Task<IEnumerable<InventarioActualResponse>> ListarActual(
    int? cicloOrigenId,
    int? productoId,
    string? productoNombre,
    string? lote,
    DateTime? desde,
    DateTime? hasta,
    bool soloDisponibles
)
        {
            return await _conn.QueryAsync<InventarioActualResponse>(
                "dbo.sp_InventarioActual_Listar",
                new
                {
                    ciclo_origen_id = cicloOrigenId,
                    producto_id = productoId,
                    producto_nombre = productoNombre,
                    lote = lote,
                    desde = desde,
                    hasta = hasta,
                    solo_disponibles = soloDisponibles ? 1 : 0
                },
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<InventarioActualResponse?> ObtenerActualPorId(int inventarioId)
        {
            return await _conn.QueryFirstOrDefaultAsync<InventarioActualResponse>(
                "dbo.sp_InventarioActual_Obtener",
                new { inventario_id = inventarioId },
                commandType: CommandType.StoredProcedure
            );
        }

    
    public async Task<IEnumerable<MovimientoInventarioResponse>> ListarMovimientos(
    int inventarioId,
    DateTime? desde,
    DateTime? hasta
)
        {
            return await _conn.QueryAsync<MovimientoInventarioResponse>(
                "dbo.sp_Inventario_Movimientos_Listar",
                new { inventario_id = inventarioId, desde = desde, hasta = hasta },
                commandType: CommandType.StoredProcedure
            );
        }
    }
}