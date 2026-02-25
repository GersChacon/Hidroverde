using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos.Evidence;
using Dapper;
using Microsoft.Data.SqlClient;


namespace DA
{
    public class EvidenceDA : IEvidenceDA
    {
        private readonly IRepositorioDapper _repositorioDapper;
        private readonly SqlConnection _sqlConnection;

        public EvidenceDA(IRepositorioDapper repositorioDapper)
        {
            _repositorioDapper = repositorioDapper;
            _sqlConnection = _repositorioDapper.ObtenerRepositorio();
        }

        public async Task<int> SaveEvidenceAsync(int taskId, int empleadoId, string fileName, string filePath, string? notes)
        {
            // MVP: Mock implementation – return a dummy ID
            // In production, this would call a stored procedure like:
            /*
            const string sp = "dbo.sp_Evidence_Insert";
            var id = await _sqlConnection.ExecuteScalarAsync<int>(sp, new
            {
                task_id = taskId,
                empleado_id = empleadoId,
                file_name = fileName,
                file_path = filePath,
                notes = notes,
                uploaded_at = DateTime.Now
            }, commandType: System.Data.CommandType.StoredProcedure);
            return id;
            */
            return await Task.FromResult(new Random().Next(1000, 9999)); // mock ID
        }
    }
}