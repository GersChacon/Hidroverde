using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
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
    }
}
