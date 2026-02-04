using Abstracciones.Modelos;

namespace Abstracciones.Interfaces.Flujo
{
    public interface ITiposRecursoFlujo
    {
        Task<IEnumerable<TipoRecursoResponse>> ObtenerActivos();
    }
}
