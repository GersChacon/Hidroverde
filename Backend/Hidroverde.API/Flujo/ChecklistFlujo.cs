using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos.Checklist;

namespace Flujo
{
    public class ChecklistFlujo : IChecklistFlujo
    {
        private readonly IChecklistDA _checklistDA;

        public ChecklistFlujo(IChecklistDA checklistDA)
        {
            _checklistDA = checklistDA;
        }

        public async Task<IEnumerable<ChecklistTaskDto>> ObtenerChecklistHoy(int? usuarioId = null)
        {
            return await _checklistDA.ObtenerChecklistHoy(usuarioId);
        }

        public async Task MarcarTareaCompletada(int tareaId, int empleadoId, DateTime timestamp)
        {
            var result = await _checklistDA.MarcarTareaCompletada(tareaId, empleadoId, timestamp);
            if (result == 0)
                throw new Exception("No se pudo marcar la tarea como completada. Verifique que exista y no esté ya completada.");
        }

        public async Task EliminarTarea(int tareaId)
        {
            var result = await _checklistDA.EliminarTarea(tareaId);
            if (result == 0)
                throw new Exception("No se pudo eliminar la tarea.");
        }

        public async Task<int> CrearTarea(ChecklistTaskDto tarea)
        {
            // Validate
            if (string.IsNullOrWhiteSpace(tarea.Description))
                throw new Exception("La descripción es obligatoria.");
            if (string.IsNullOrWhiteSpace(tarea.Responsible))
                throw new Exception("El responsable es obligatorio.");
            if (!tarea.AssignedUserId.HasValue || tarea.AssignedUserId.Value <= 0)
                throw new Exception("El ID de usuario asignado es inválido.");

            return await _checklistDA.CrearTarea(tarea);
        }
    }
}