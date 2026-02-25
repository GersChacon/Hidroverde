using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
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
            // MVP: Mock data – replace with actual stored procedure call.
            var mockData = new List<CompletedTaskHistoryDto>
            {
                new CompletedTaskHistoryDto
                {
                    TaskId = 1,
                    TaskDescription = "Preparación de insumos (semillas, sustrato, nutrientes)",
                    Responsible = "Fiorella",
                    CompletedByUserId = 1,
                    CompletedByUserName = "Fiorella",
                    CompletedAt = DateTime.Now.AddDays(-1),
                    EvidenceId = 101,
                    EvidenceFileName = "evidence1.jpg",
                    BatchId = "BATCH-001"
                },
                new CompletedTaskHistoryDto
                {
                    TaskId = 2,
                    TaskDescription = "Plantación / trasplante en torres",
                    Responsible = "Asistente",
                    CompletedByUserId = 2,
                    CompletedByUserName = "Carlos",
                    CompletedAt = DateTime.Now.AddDays(-2),
                    EvidenceId = null,
                    EvidenceFileName = null,
                    BatchId = "BATCH-002"
                },
                new CompletedTaskHistoryDto
                {
                    TaskId = 3,
                    TaskDescription = "Revisión y programación del riego",
                    Responsible = "Diego",
                    CompletedByUserId = 3,
                    CompletedByUserName = "Diego",
                    CompletedAt = DateTime.Now.AddDays(-3),
                    EvidenceId = 102,
                    EvidenceFileName = "evidence2.pdf",
                    BatchId = "BATCH-001"
                }
            };

            // Apply filters (simulated)
            var query = mockData.AsEnumerable();

            if (filter.UserId.HasValue)
                query = query.Where(x => x.CompletedByUserId == filter.UserId.Value);

            if (!string.IsNullOrEmpty(filter.BatchId))
                query = query.Where(x => x.BatchId?.Contains(filter.BatchId, StringComparison.OrdinalIgnoreCase) == true);

            if (filter.DateFrom.HasValue)
                query = query.Where(x => x.CompletedAt.Date >= filter.DateFrom.Value.Date);

            if (filter.DateTo.HasValue)
                query = query.Where(x => x.CompletedAt.Date <= filter.DateTo.Value.Date);

            return await Task.FromResult(query.ToList());
        }
    }
}