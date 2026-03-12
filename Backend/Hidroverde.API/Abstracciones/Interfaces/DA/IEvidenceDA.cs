using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Abstracciones.Modelos.Evidence;

namespace Abstracciones.Interfaces.DA
{
    public interface IEvidenceDA
    {
        Task<int> SaveEvidenceAsync(int taskId, int empleadoId, string fileName, string filePath, string? notes);
    }
}