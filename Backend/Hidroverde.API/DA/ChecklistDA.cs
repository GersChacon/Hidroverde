using System;
using System.Collections.Generic;
<<<<<<< HEAD
using System.Data;
using System.Linq;
=======
using System.Linq;
using System.Text;
>>>>>>> c258a47c036e1f2f3bda8cbc9ae982b2e22d35a1
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
<<<<<<< HEAD
            const string sp = "dbo.sp_Checklist_TareasHoy";

            var parameters = new { usuario_id = usuarioId };

            var tasks = await _sqlConnection.QueryAsync<ChecklistTaskDto>(
                sp,
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return tasks;
=======
            // MVP: Mock data – replace with real DB call later
            var mock = new List<ChecklistTaskDto>
            {
                new ChecklistTaskDto
                {
                    TaskId = 1,
                    Description = "Preparación de insumos (semillas, sustrato, nutrientes)",
                    Responsible = "Fiorella",
                    IsCompleted = false,
                    DueDate = DateTime.Today,
                    AssignedUserId = 1
                },
                new ChecklistTaskDto
                {
                    TaskId = 2,
                    Description = "Plantación / trasplante en torres",
                    Responsible = "Asistente",
                    IsCompleted = false,
                    DueDate = DateTime.Today,
                    AssignedUserId = 2
                },
                new ChecklistTaskDto
                {
                    TaskId = 3,
                    Description = "Revisión y programación del riego",
                    Responsible = "Diego",
                    IsCompleted = true,
                    DueDate = DateTime.Today,
                    AssignedUserId = 3
                }
            };

            if (usuarioId.HasValue)
            {
                mock = mock.Where(t => t.AssignedUserId == usuarioId.Value).ToList();
            }

            return await Task.FromResult(mock);
>>>>>>> c258a47c036e1f2f3bda8cbc9ae982b2e22d35a1
        }

        public async Task<int> MarcarTareaCompletada(int tareaId, int empleadoId, DateTime timestamp)
        {
<<<<<<< HEAD
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
=======
            // MVP: Simulate success for tasks 1–3
            if (tareaId >= 1 && tareaId <= 3)
            {
                // In real implementation, insert into a completion table and update task status
                return await Task.FromResult(1);
            }
            return 0;
>>>>>>> c258a47c036e1f2f3bda8cbc9ae982b2e22d35a1
        }
    }
}