using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;

namespace Flujo
{
    public class CiclosFlujo : ICiclosFlujo
    {
        private readonly ICiclosDA _ciclosDA;

        public CiclosFlujo(ICiclosDA ciclosDA)
        {
            _ciclosDA = ciclosDA;
        }

        public async Task<IEnumerable<CicloActivoResponse>> ObtenerActivos()
        {
            return await _ciclosDA.ObtenerActivos();
        }
    }
}
