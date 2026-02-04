using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;

namespace Flujo
{
    public class TiposRecursoFlujo : ITiposRecursoFlujo
    {
        private readonly ITiposRecursoDA _tiposRecursoDA;

        public TiposRecursoFlujo(ITiposRecursoDA tiposRecursoDA)
        {
            _tiposRecursoDA = tiposRecursoDA;
        }

        public async Task<IEnumerable<TipoRecursoResponse>> ObtenerActivos()
        {
            return await _tiposRecursoDA.ObtenerActivos();
        }
    }
}
