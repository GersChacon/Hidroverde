using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;

namespace Flujo
{
    public class TorresFlujo : ITorresFlujo
    {
        private readonly ITorresDA _torresDA;

        public TorresFlujo(ITorresDA torresDA)
        {
            _torresDA = torresDA;
        }

        public Task<IEnumerable<TorreDto>> Listar()
        {
            return _torresDA.Listar();
        }
    }
}