using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos;
using Dapper;
using Hidroverde.Abstracciones.Modelos.Ciclos;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DA
{
    public class CiclosDA : ICiclosDA
    {
        private readonly SqlConnection _conn;

        public CiclosDA(IRepositorioDapper repo)
        {
            _conn = repo.ObtenerRepositorio();
        }

        public async Task<IEnumerable<CicloActivoResponse>> ObtenerActivos()
        {
            const string sp = "dbo.sp_Ciclos_ListarActivos";
            return await _conn.QueryAsync<CicloActivoResponse>(sp, commandType: CommandType.StoredProcedure);
        }

        public async Task<int> RegistrarSiembraAsync(RegistrarSiembraRequest request, int responsableId)
        {
            const string sp = "dbo.sp_Ciclo_RegistrarSiembra";

            var p = new DynamicParameters();
            p.Add("@producto_id", request.ProductoId, DbType.Int32);
            p.Add("@variedad_id", request.VariedadId, DbType.Int32);
            p.Add("@torre_id", request.TorreId, DbType.Int32);
            p.Add("@estado_ciclo_codigo", request.EstadoCicloCodigo, DbType.String);
            p.Add("@fecha_siembra", request.FechaSiembra.Date, DbType.Date);
            p.Add("@fecha_cosecha_estimada", request.FechaCosechaEstimada.Date, DbType.Date);
            p.Add("@cantidad_plantas", request.CantidadPlantas, DbType.Int32);
            p.Add("@responsable_id", responsableId, DbType.Int32);
            p.Add("@lote_semilla", request.LoteSemilla, DbType.String);
            p.Add("@notas", request.Notas, DbType.String);

            // Tu SP devuelve: SELECT SCOPE_IDENTITY() AS ciclo_id_creado;
            var id = await _conn.ExecuteScalarAsync<int>(sp, p, commandType: CommandType.StoredProcedure);
            return id;
        }
        public async Task<CosecharCicloResponse> CosecharAsync(
    int cicloId,
    CosecharCicloRequest request,
    int usuarioId)
        {
            const string sp = "dbo.sp_Ciclo_Cosechar";

            var p = new DynamicParameters();
            p.Add("@ciclo_id", cicloId, DbType.Int32);
            p.Add("@ubicacion_id", request.UbicacionId, DbType.Int32);
            p.Add("@estado_calidad_codigo", request.EstadoCalidadCodigo, DbType.String);
            p.Add("@usuario_id", usuarioId, DbType.Int32);
            p.Add("@motivo", request.Motivo, DbType.String);

            // 👇 IMPORTANTE: usamos QuerySingleAsync<T>
            return await _conn.QuerySingleAsync<CosecharCicloResponse>(
                sp,
                p,
                commandType: CommandType.StoredProcedure
            );
        }
        public async Task<int> CancelarAsync(int cicloId, int usuarioId, string? motivo)
        {
            const string sp = "dbo.sp_Ciclo_Cancelar";

            var p = new DynamicParameters();
            p.Add("@ciclo_id", cicloId, DbType.Int32);
            p.Add("@usuario_id", usuarioId, DbType.Int32);
            p.Add("@motivo", (object?)motivo ?? DBNull.Value, DbType.String);

            var row = await _conn.QueryFirstAsync(sp, p, commandType: CommandType.StoredProcedure);

            return (int)row.ciclo_id_cancelado;
        }


    }
}
