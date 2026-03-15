using System;
using System.Collections.Generic;
using System.Data;
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
            const string sp = "dbo.sp_Checklist_MarcarCompletada";

            var parameters = new
            {
                tarea_id = tareaId,
                empleado_id = empleadoId,
                timestamp = timestamp
            };

            var result = await _sqlConnection.ExecuteScalarAsync<int>(
                sp,
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return result;
        }

        public async Task<int> EliminarTarea(int tareaId)
        {
            const string sp = "dbo.sp_Checklist_EliminarTarea";

            var result = await _sqlConnection.ExecuteScalarAsync<int>(
                sp,
                new { tarea_id = tareaId },
                commandType: CommandType.StoredProcedure
            );

            return result;
        }

        public async Task<int> CrearTarea(ChecklistTaskDto tarea)
        {
            const string sp = "dbo.sp_Checklist_CrearTarea";

            var parameters = new
            {
                descripcion = tarea.Description,
                responsable_rol = tarea.Responsible,
                asignado_id = tarea.AssignedUserId ?? 1,
                orden = tarea.Orden,
                es_critica = tarea.EsCritica
            };

            var result = await _sqlConnection.ExecuteScalarAsync<int>(
                sp,
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return result;
        }
    }
}