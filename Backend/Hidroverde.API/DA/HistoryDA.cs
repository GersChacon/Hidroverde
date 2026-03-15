using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos.History;
using Dapper;
using Microsoft.Data.SqlClient;

namespace DA
{
    public class HistoryDA : IHistoryDA
    {
        private readonly IRepositorioDapper _repositorioDapper;
        private readonly SqlConnection _sqlConnection;

        public HistoryDA(IRepositorioDapper repositorioDapper)
        {
            _repositorioDapper = repositorioDapper;
            _sqlConnection = _repositorioDapper.ObtenerRepositorio();
        }

        public async Task<IEnumerable<CompletedTaskHistoryDto>> GetHistoryAsync(HistoryFilterRequest filter)
        {
            const string sp = "dbo.sp_History_GetCompletedTasks";

            var parameters = new
            {
                userId = filter.UserId,
                batchId = filter.BatchId,
                dateFrom = filter.DateFrom?.Date,
                dateTo = filter.DateTo?.Date
            };

            try
            {
                var result = await _sqlConnection.QueryAsync<CompletedTaskHistoryDto>(
                    sp,
                    parameters,
                    commandType: CommandType.StoredProcedure
                );

                return result ?? Enumerable.Empty<CompletedTaskHistoryDto>();
            }
            catch (Exception ex)
            {
                // Log the error and return empty list
                Console.WriteLine($"Error in GetHistoryAsync: {ex.Message}");
                return Enumerable.Empty<CompletedTaskHistoryDto>();
            }
        }
    }
}