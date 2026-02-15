using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos;
using Dapper;
using Microsoft.Data.SqlClient;

namespace DA
{
    public class AlertasDA : IAlertasDA
    {
        private readonly IRepositorioDapper _repositorioDapper;
        private readonly SqlConnection _sqlConnection;

        public AlertasDA(IRepositorioDapper repositorioDapper)
        {
            _repositorioDapper = repositorioDapper;
            _sqlConnection = _repositorioDapper.ObtenerRepositorio();
        }
        public void GenerarAlertasStockBajo()
        {
            const string sp = @"notif.sp_Alertas_StockBajo_GenerarYListar";

            // Ejecuta el SP y descarta los datasets (no los necesitamos aquí)
            _sqlConnection.Execute(sp, commandType: System.Data.CommandType.StoredProcedure);
        }

        public AlertaBadgeDto ObtenerBadge()
        {
            // SP: notif.sp_Alertas_Badge -> retorna columna badge_count
            const string sp = @"notif.sp_Alertas_Badge";

            // QueryFirstOrDefault para traer 1 fila
            // Mapeo manual porque el SP devuelve badge_count y nuestro DTO es BadgeCount
            var row = _sqlConnection.QueryFirstOrDefault(sp, commandType: System.Data.CommandType.StoredProcedure);

            var badge = 0;
            if (row != null)
            {
                // dynamic: row.badge_count
                // Si cambia el nombre, se rompe: es intencional para no asumir.
                badge = (int)row.badge_count;
            }

            return new AlertaBadgeDto { BadgeCount = badge };
        }

        public IEnumerable<AlertaActivaDto> ListarAlertasActivas()
        {
            // SP: notif.sp_Alertas_ListarActivas
            const string sp = @"notif.sp_Alertas_ListarActivas";

            // Para evitar problemas de mapeo por nombres con guiones bajos,
            // hacemos alias explícitos en el SP o mapeo manual.
            // Como NO vamos a tocar el SP aquí, hacemos una consulta dinámica y transformamos.
            var rows = _sqlConnection.Query(sp, commandType: System.Data.CommandType.StoredProcedure);

            var lista = new List<AlertaActivaDto>();
            foreach (var r in rows)
            {
                // Estos nombres vienen del SP que definimos:
                // alerta_id, tipo_alerta, estado, fecha_creacion, mensaje, producto_id, nombre_producto, snapshot_disponible, snapshot_minimo
                lista.Add(new AlertaActivaDto
                {
                    AlertaId = (int)r.alerta_id,
                    TipoAlerta = (string)r.tipo_alerta,
                    Estado = (string)r.estado,
                    FechaCreacion = (DateTime)r.fecha_creacion,
                    Mensaje = (string)r.mensaje,
                    ProductoId = (int)r.producto_id,
                    NombreProducto = (string)r.nombre_producto,
                    SnapshotDisponible = (int)r.snapshot_disponible,
                    SnapshotMinimo = (int)r.snapshot_minimo
                });
            }

            return lista;
        }

        public void AceptarAlerta(int alertaId, int empleadoId)
        {
            // SP: notif.sp_Alertas_Aceptar
            const string sp = @"notif.sp_Alertas_Aceptar";

            _sqlConnection.Execute(
                sp,
                new { alerta_id = alertaId, empleado_id = empleadoId },
                commandType: System.Data.CommandType.StoredProcedure
            );

        }
    }
}
