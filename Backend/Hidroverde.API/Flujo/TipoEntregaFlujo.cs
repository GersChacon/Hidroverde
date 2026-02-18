using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;

namespace Flujo
{
    public class TipoEntregaFlujo : ITipoEntregaFlujo
    {
        private readonly ITipoEntregaDA _tipoEntregaDA;

        public TipoEntregaFlujo(ITipoEntregaDA tipoEntregaDA)
        {
            _tipoEntregaDA = tipoEntregaDA;
        }

        public Task<int> Agregar(TipoEntregaRequest tipoEntrega)
        {
            return _tipoEntregaDA.Agregar(tipoEntrega);
        }

        public Task<int> Editar(int tipoEntregaId, TipoEntregaRequest tipoEntrega)
        {
            return _tipoEntregaDA.Editar(tipoEntregaId, tipoEntrega);
        }

        public Task<int> Eliminar(int tipoEntregaId)
        {
            return _tipoEntregaDA.Eliminar(tipoEntregaId);
        }

        public Task<IEnumerable<TipoEntregaResponse>> Obtener()
        {
            return _tipoEntregaDA.Obtener();
        }

        public Task<TipoEntregaResponse> Obtener(int tipoEntregaId)
        {
            return _tipoEntregaDA.Obtener(tipoEntregaId);
        }
    }
}