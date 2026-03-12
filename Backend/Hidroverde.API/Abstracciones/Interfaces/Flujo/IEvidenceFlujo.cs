using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Abstracciones.Modelos.Evidence;
using Microsoft.AspNetCore.Http;

namespace Abstracciones.Interfaces.Flujo
{
    public interface IEvidenceFlujo
    {
        Task<EvidenceUploadResponse> UploadEvidenceAsync(int taskId, int empleadoId, IFormFile file, string? notes);
    }
}