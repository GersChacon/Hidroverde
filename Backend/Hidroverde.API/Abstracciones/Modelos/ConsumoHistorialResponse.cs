using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Abstracciones.Modelos
{
    public class ConsumoHistorialResponse
    {
        public long ConsumoVersionId { get; set; }
        public long ConsumoId { get; set; }
        public int VersionNo { get; set; }

        public decimal Cantidad { get; set; }
        public System.DateTime FechaConsumo { get; set; }

        public string? Notas { get; set; }
        public bool EsActual { get; set; }

        public System.DateTime FechaRegistro { get; set; }
        public int RegistradoPorEmpleadoId { get; set; }

        public string? MotivoCambio { get; set; }
    }
}
