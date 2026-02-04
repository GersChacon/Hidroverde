using Abstracciones.Modelos;

namespace Abstracciones.Interfaces.Flujo
{
    public interface ICiclosFlujo
    {
        Task<IEnumerable<CicloActivoResponse>> ObtenerActivos();
    }
}
