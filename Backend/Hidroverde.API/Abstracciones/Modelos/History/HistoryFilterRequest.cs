using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace Abstracciones.Modelos.History
{
    public class HistoryFilterRequest
    {
        public int? UserId { get; set; }
        public string? BatchId { get; set; }
        public DateTime? DateFrom { get; set; }
        public DateTime? DateTo { get; set; }
    }
}