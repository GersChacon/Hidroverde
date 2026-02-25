using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
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
        }

        public async Task<int> MarcarTareaCompletada(int tareaId, int empleadoId, DateTime timestamp)
        {
            // MVP: Simulate success for tasks 1–3
            if (tareaId >= 1 && tareaId <= 3)
            {
                // In real implementation, insert into a completion table and update task status
                return await Task.FromResult(1);
            }
            return 0;
        }
    }
}