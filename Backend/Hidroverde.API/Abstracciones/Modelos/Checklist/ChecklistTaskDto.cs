using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace Abstracciones.Modelos.Checklist
{
    public class ChecklistTaskDto
    {
        public int TaskId { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Responsible { get; set; } = string.Empty;
        public bool IsCompleted { get; set; }
        public DateTime? DueDate { get; set; }
        public int? AssignedUserId { get; set; }
        public int Orden { get; set; } = 10;
        public bool EsCritica { get; set; } = false;
    }
}