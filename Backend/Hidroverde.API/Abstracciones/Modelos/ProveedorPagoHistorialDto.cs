using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Abstracciones.Modelos
{
    public class ProveedorPagoHistorialDto
    {
        public int PagoId { get; set; }
        public int ProveedorId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public decimal MontoPago { get; set; }
        public decimal SaldoAntes { get; set; }
        public decimal SaldoDespues { get; set; }
        public string EstadoPago { get; set; } = string.Empty;
        public DateTime FechaPago { get; set; }
        public int? UsuarioId { get; set; }
        public string? Comentario { get; set; }
    }
}