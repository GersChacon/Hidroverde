using Abstracciones.Modelos;

namespace Abstracciones.Interfaces.DA
{
    public interface ITiposRecursoDA
    {
        Task<IEnumerable<TipoRecursoResponse>> ObtenerActivos();
    }
}
