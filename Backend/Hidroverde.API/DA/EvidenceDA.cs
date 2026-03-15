using Abstracciones.Interfaces.DA;
using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DA
{
    public class EvidenceDA : IEvidenceDA
    {
        private readonly IRepositorioDapper _repositorioDapper;

        public EvidenceDA(IRepositorioDapper repositorioDapper)
        {
            _repositorioDapper = repositorioDapper;
        }

        public async Task<int> SaveEvidenceAsync(int taskId, int empleadoId, string fileName, string filePath, string? notes)
        {
            const string sp = "dbo.sp_Evidencias_Insert";
            using var connection = _repositorioDapper.ObtenerRepositorio();
            var parameters = new
            {
                ciclo_checklist_id = taskId, // assume taskId is ciclo_checklist_id
                nombre_archivo = fileName,
                ruta_archivo = filePath,
                tipo_contenido = "image/jpeg", // detect later
                tamano_bytes = 0,
                notas = notes,
                subido_por = empleadoId
            };
            var id = await connection.ExecuteScalarAsync<int>(sp, parameters, commandType: CommandType.StoredProcedure);
            return id;
        }
    }
}