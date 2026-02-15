using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Abstracciones.Modelos
{
    public class ConsumoRequest
    {
        public int CicloId { get; set; }
        public int TipoRecursoId { get; set; }
        public decimal Cantidad { get; set; }
        public System.DateTime FechaConsumo { get; set; }
        public string? Notas { get; set; }
    }
}