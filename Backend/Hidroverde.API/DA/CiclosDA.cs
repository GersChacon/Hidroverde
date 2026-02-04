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
            var row = await _conn.QueryFirstAsync<dynamic>(sp, p, commandType: CommandType.StoredProcedure);
            return (int)row.ciclo_id_creado;
        }
    }
}
