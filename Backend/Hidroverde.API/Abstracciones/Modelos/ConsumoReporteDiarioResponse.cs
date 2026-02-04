using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Abstracciones.Modelos
{
    public class ConsumoReporteDiarioResponse
    {
        public DateTime Fecha { get; set; }
        public int CicloId { get; set; }
        public int TipoRecursoId { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string RecursoNombre { get; set; } = string.Empty;
        public string Unidad { get; set; } = string.Empty;
        public decimal TotalCantidad { get; set; }
    }
}
