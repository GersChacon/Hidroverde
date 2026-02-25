using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Abstracciones.Modelos.Checklist;

namespace Abstracciones.Interfaces.Flujo
{
    public interface IChecklistFlujo
    {
        Task<IEnumerable<ChecklistTaskDto>> ObtenerChecklistHoy(int? usuarioId = null);
        Task MarcarTareaCompletada(int tareaId, int empleadoId, DateTime timestamp);
    }
}
