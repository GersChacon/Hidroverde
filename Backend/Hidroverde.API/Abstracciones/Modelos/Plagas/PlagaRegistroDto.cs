using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Abstracciones.Modelos.Plagas
{
    public class PlagaRegistroDto
    {
        public int RegistroId { get; set; }
        public int PlagaId { get; set; }
        public string PlagaNombre { get; set; } = string.Empty;
        public DateTime FechaHallazgo { get; set; }
        public int Cantidad { get; set; }
        public string? Comentario { get; set; }
        public int UsuarioId { get; set; }
        public DateTime FechaRegistro { get; set; }
    }
}