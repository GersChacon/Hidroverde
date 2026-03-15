using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Abstracciones.Modelos.Checklist;

namespace Abstracciones.Interfaces.DA
{
    public interface IChecklistDA
    {
        Task<IEnumerable<ChecklistTaskDto>> ObtenerChecklistHoy(int? usuarioId = null);
        Task<int> MarcarTareaCompletada(int tareaId, int empleadoId, DateTime timestamp);
        Task<int> EliminarTarea(int tareaId);
        Task<int> CrearTarea(ChecklistTaskDto tarea);
    }
}