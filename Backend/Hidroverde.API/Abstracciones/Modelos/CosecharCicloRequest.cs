using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hidroverde.Abstracciones.Modelos.Ciclos;

public class CosecharCicloRequest
{
    public int UbicacionId { get; set; }
    public string EstadoCalidadCodigo { get; set; } = "OPTIMO"; // ejemplo
    public string? Motivo { get; set; }
}
