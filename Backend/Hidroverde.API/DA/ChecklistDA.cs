using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos.Checklist;
using Dapper;
using Microsoft.Data.SqlClient;

namespace DA
{
    public class ChecklistDA : IChecklistDA
    {
        private readonly IRepositorioDapper _repositorioDapper;
        private readonly SqlConnection _sqlConnection;

        public ChecklistDA(IRepositorioDapper repositorioDapper)
        {
            _repositorioDapper = repositorioDapper;
            _sqlConnection = _repositorioDapper.ObtenerRepositorio();
        }

        public async Task<IEnumerable<ChecklistTaskDto>> ObtenerChecklistHoy(int? usuarioId = null)
        {
            const string sp = "dbo.sp_Checklist_TareasHoy";

            var parameters = new { usuario_id = usuarioId };

            var tasks = await _sqlConnection.QueryAsync<ChecklistTaskDto>(
                sp,
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return tasks;
        }

        public async Task<int> MarcarTareaCompletada(int tareaId, int empleadoId, DateTime timestamp)
        {
            // Insert into Ciclo_Checklist
            const string sql = @"
                INSERT INTO dbo.Ciclo_Checklist 
                    (ciclo_id, tarea_id, completado, completado_por, fecha_completado, fecha_creacion)
                VALUES 
                    (1, @TareaId, 1, @EmpleadoId, @Timestamp, SYSDATETIME());
                
                SELECT SCOPE_IDENTITY();";

            var result = await _sqlConnection.ExecuteScalarAsync<int>(sql, new
            {
                TareaId = tareaId,
                EmpleadoId = empleadoId,
                Timestamp = timestamp
            });

            return result;
        }
    }
}