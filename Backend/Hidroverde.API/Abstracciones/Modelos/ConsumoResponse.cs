using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Abstracciones.Modelos
{
    public class ConsumoResponse
    {
        public long ConsumoId { get; set; }
        public int CicloId { get; set; }

        public int TipoRecursoId { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string RecursoNombre { get; set; } = string.Empty;
        public string Categoria { get; set; } = string.Empty;
        public string Unidad { get; set; } = string.Empty;

        public int VersionNo { get; set; }
        public decimal Cantidad { get; set; }
        public System.DateTime FechaConsumo { get; set; }

        public string? Notas { get; set; }
        public System.DateTime FechaRegistro { get; set; }
        public int RegistradoPorEmpleadoId { get; set; }
    }
}
