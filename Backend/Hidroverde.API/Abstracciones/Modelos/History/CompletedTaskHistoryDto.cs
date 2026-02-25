using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace Abstracciones.Modelos.History
{
    public class CompletedTaskHistoryDto
    {
        public int TaskId { get; set; }
        public string TaskDescription { get; set; } = string.Empty;
        public string Responsible { get; set; } = string.Empty;
        public int CompletedByUserId { get; set; }
        public string CompletedByUserName { get; set; } = string.Empty;
        public DateTime CompletedAt { get; set; }
        public int? EvidenceId { get; set; }
        public string? EvidenceFileName { get; set; }
        public string? BatchId { get; set; } // optional, for batch/lot filtering
    }
}