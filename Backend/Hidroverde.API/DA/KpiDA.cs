using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos.Kpi;
using Dapper;
using Microsoft.Data.SqlClient;

namespace DA
{
    public class KpiDA : IKpiDA
    {
        private readonly IRepositorioDapper _repositorioDapper;
        private readonly SqlConnection _sqlConnection;

        public KpiDA(IRepositorioDapper repositorioDapper)
        {
            _repositorioDapper = repositorioDapper;
            _sqlConnection = _repositorioDapper.ObtenerRepositorio();
        }

        public async Task<IEnumerable<KpiComparisonResponse>> ObtenerComparacion(string periodo, int? año, int? mes)
        {
            const string sp = "dbo.sp_Kpi_Comparacion";

            var parameters = new
            {
                periodo = periodo,
                año = año,
                mes = mes
            };

            try
            {
                var result = await _sqlConnection.QueryAsync<KpiComparisonResponse>(
                    sp,
                    parameters,
                    commandType: CommandType.StoredProcedure
                );

                return result;
            }
            catch (Exception ex)
            {
                // Log the error and rethrow - no mock data
                Console.WriteLine($"Error in KpiDA.ObtenerComparacion: {ex.Message}");
                throw;
            }
        }
    }
}