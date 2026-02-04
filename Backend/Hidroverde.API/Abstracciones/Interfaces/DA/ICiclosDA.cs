using Abstracciones.Modelos;

namespace Abstracciones.Interfaces.DA
{
    public interface ICiclosDA
    {
        Task<IEnumerable<CicloActivoResponse>> ObtenerActivos();
    }
}
