using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Abstracciones.Modelos
{
    public class CicloActivoResponse
    {
        public int CicloId { get; set; }
        public int ProductoId { get; set; }
        public int TorreId { get; set; }

        public int EstadoCicloId { get; set; }
        public string EstadoNombre { get; set; } = string.Empty;
        public bool EsActivo { get; set; }

        public System.DateTime FechaSiembra { get; set; }
        public System.DateTime? FechaCosechaEstimada { get; set; }
        public System.DateTime? FechaCosechaReal { get; set; }

        public int CantidadPlantas { get; set; }

        public int? ResponsableId { get; set; }
        public string? ResponsableNombre { get; set; }
    }
}
