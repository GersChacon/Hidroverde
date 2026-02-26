using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Abstracciones.Modelos.Plagas
{
    public class PlagaGraficaItemDto
    {
        public DateTime Periodo { get; set; }         // DATE en SQL -> DateTime en C#
        public int PlagaId { get; set; }
        public string PlagaNombre { get; set; } = string.Empty;
        public int TotalCantidad { get; set; }
        public int TotalIncidencias { get; set; }
    }
}