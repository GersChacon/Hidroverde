using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Abstracciones.Modelos.Plagas
{
    public class PlagaRegistrarRequest
    {
        public int PlagaId { get; set; }
        public DateTime FechaHallazgo { get; set; }   // en UI enviar yyyy-MM-dd
        public int? Cantidad { get; set; }
        public string? Comentario { get; set; }
    }
}