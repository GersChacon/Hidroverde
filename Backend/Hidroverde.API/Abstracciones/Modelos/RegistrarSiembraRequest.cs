using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hidroverde.Abstracciones.Modelos.Ciclos;

public class RegistrarSiembraRequest
{
    public int ProductoId { get; set; }
    public int VariedadId { get; set; }
    public int TorreId { get; set; }

    // Ej: "SIEMBRA"
    public string EstadoCicloCodigo { get; set; } = "SIEMBRA";

    public DateTime FechaSiembra { get; set; }
    public DateTime FechaCosechaEstimada { get; set; }

    public int CantidadPlantas { get; set; }

    public string? LoteSemilla { get; set; }
    public string? Notas { get; set; }
}
