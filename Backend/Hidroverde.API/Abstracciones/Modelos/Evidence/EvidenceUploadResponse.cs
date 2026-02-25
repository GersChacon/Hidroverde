using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Abstracciones.Modelos.Evidence
{
    public class EvidenceUploadResponse
    {
        public int EvidenceId { get; set; }
        public string FileName { get; set; } = string.Empty;
        public DateTime UploadedAt { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}