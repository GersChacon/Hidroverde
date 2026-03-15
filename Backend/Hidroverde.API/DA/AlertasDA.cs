using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos;
using Dapper;
using Microsoft.Data.SqlClient;

namespace DA
{
    public class AlertasDA : IAlertasDA
    {
        private readonly IRepositorioDapper _repositorioDapper;

        public AlertasDA(IRepositorioDapper repositorioDapper)
        {
            _repositorioDapper = repositorioDapper;
        }

        public async Task GenerarAlertasStockBajo()
        {
            const string sp = "notif.sp_Alertas_StockBajo_GenerarYListar";
            using var connection = _repositorioDapper.ObtenerRepositorio();
            await connection.ExecuteAsync(sp, commandType: System.Data.CommandType.StoredProcedure);
        }

        public async Task<AlertaBadgeDto> ObtenerBadge()
        {
            const string sp = "notif.sp_Alertas_Badge";
            using var connection = _repositorioDapper.ObtenerRepositorio();
            var row = await connection.QueryFirstOrDefaultAsync(sp, commandType: System.Data.CommandType.StoredProcedure);
            return new AlertaBadgeDto { BadgeCount = row?.badge_count ?? 0 };
        }

        public async Task<IEnumerable<AlertaActivaDto>> ListarAlertasActivas()
        {
            const string sp = "notif.sp_Alertas_ListarActivas";
            using var connection = _repositorioDapper.ObtenerRepositorio();
            var rows = await connection.QueryAsync(sp, commandType: System.Data.CommandType.StoredProcedure);
            return rows.Select(r => new AlertaActivaDto
            {
                AlertaId = r.alerta_id,
                TipoAlerta = r.tipo_alerta,
                Estado = r.estado,
                FechaCreacion = r.fecha_creacion,
                Mensaje = r.mensaje,
                ProductoId = r.producto_id,
                NombreProducto = r.nombre_producto,
                SnapshotDisponible = r.snapshot_disponible,
                SnapshotMinimo = r.snapshot_minimo
            }).ToList();
        }

        public async Task AceptarAlerta(int alertaId, int empleadoId)
        {
            const string sp = "notif.sp_Alertas_Aceptar";
            using var connection = _repositorioDapper.ObtenerRepositorio();
            await connection.ExecuteAsync(sp, new { alerta_id = alertaId, empleado_id = empleadoId },
                commandType: System.Data.CommandType.StoredProcedure);
        }
    }
}