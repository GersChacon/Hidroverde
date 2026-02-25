using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Abstracciones.Modelos
{
    public class InventarioActualResponse
    {
        public int InventarioId { get; set; }
        public int ProductoId { get; set; }
        public int UbicacionId { get; set; }
        public int EstadoCalidadId { get; set; }
        public string Lote { get; set; }
        public decimal CantidadDisponible { get; set; }
        public DateTime FechaEntrada { get; set; }
        public DateTime? FechaCaducidad { get; set; }
        public int? CicloOrigenId { get; set; }
        public string? Notas { get; set; }
        public DateTime FechaCreacion { get; set; }

        // opcional UI
        public string? ProductoCodigo { get; set; }
        public string? ProductoNombre { get; set; }
    }
}
