using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;

namespace Abstracciones.Modelos.Evidence
{
    public class EvidenceUploadRequest
    {
        public int TaskId { get; set; }
        public IFormFile File { get; set; } = null!;
        public string? Notes { get; set; }
    }
}
