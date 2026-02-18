using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Abstracciones.Modelos
{
    public class MovimientoInventarioResponse
    {
        public int MovimientoId { get; set; }
        public int InventarioId { get; set; }
        public int ProductoId { get; set; }

        public string TipoMovimientoCodigo { get; set; } = "";
        public string TipoMovimientoNombre { get; set; } = "";

        public int? UbicacionOrigenId { get; set; }
        public int? UbicacionDestinoId { get; set; }

        public decimal Cantidad { get; set; }
        public string? Motivo { get; set; }
        public int UsuarioId { get; set; }
        public DateTime FechaMovimiento { get; set; }
    }
}