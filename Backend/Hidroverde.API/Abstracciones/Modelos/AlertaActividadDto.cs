using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Abstracciones.Modelos
{
    public class AlertaActivaDto
    {
        public int AlertaId { get; set; }
        public string TipoAlerta { get; set; }
        public string Estado { get; set; }
        public DateTime FechaCreacion { get; set; }
        public string Mensaje { get; set; }

        public int ProductoId { get; set; }
        public string NombreProducto { get; set; }

        public int SnapshotDisponible { get; set; }
        public int SnapshotMinimo { get; set; }
    }
}
