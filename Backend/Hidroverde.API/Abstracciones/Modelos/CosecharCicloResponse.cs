using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hidroverde.Abstracciones.Modelos.Ciclos;

public class CosecharCicloResponse
{
    public int InventarioIdCreado { get; set; }
    public string LoteGenerado { get; set; } = string.Empty;
}
