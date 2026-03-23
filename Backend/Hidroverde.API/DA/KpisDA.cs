using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos;
using Dapper;
using Microsoft.Data.SqlClient;

namespace DA
{
    public class KpisDA : IKpisDA
    {
        private readonly IRepositorioDapper _repositorioDapper;
        private readonly SqlConnection _sqlConnection;

        public KpisDA(IRepositorioDapper repositorioDapper)
        {
            _repositorioDapper = repositorioDapper;
            _sqlConnection = _repositorioDapper.ObtenerRepositorio();
        }

        public KpiResumenResponse ObtenerResumen(DateTime? fechaDesde, DateTime? fechaHasta)
        {
            const string sp = "dbo.sp_KPIs_Resumen";

            var parameters = new DynamicParameters();
            parameters.Add("@fecha_desde", fechaDesde.HasValue ? (object)fechaDesde.Value.Date : DBNull.Value);
            parameters.Add("@fecha_hasta", fechaHasta.HasValue ? (object)fechaHasta.Value.Date : DBNull.Value);

            // El SP devuelve 2 result sets: totales y tendencia
            using var multi = _sqlConnection.QueryMultiple(
                sp,
                parameters,
                commandType: System.Data.CommandType.StoredProcedure
            );

            var totales   = multi.Read<KpiTotalDto>().ToList();
            var tendencia = multi.Read<KpiTendenciaDto>().ToList();

            return new KpiResumenResponse
            {
                Totales   = totales,
                Tendencia = tendencia
            };
        }
    }
}
