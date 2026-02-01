using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;

namespace Flujo
{
    public class UnidadMedidaFlujo : IUnidadMedidaFlujo
    {
        private readonly IUnidadMedidaDA _unidadMedidaDA;

        public UnidadMedidaFlujo(IUnidadMedidaDA unidadMedidaDA)
        {
            _unidadMedidaDA = unidadMedidaDA;
        }

        public Task<int> Agregar(UnidadMedidaRequest unidadMedida)
        {
            return _unidadMedidaDA.Agregar(unidadMedida);
        }

        public Task<int> Editar(int unidadId, UnidadMedidaRequest unidadMedida)
        {
            return _unidadMedidaDA.Editar(unidadId, unidadMedida);
        }

        public Task<int> Eliminar(int unidadId)
        {
            return _unidadMedidaDA.Eliminar(unidadId);
        }

        public Task<IEnumerable<UnidadMedidaResponse>> Obtener()
        {
            return _unidadMedidaDA.Obtener();
        }

        public Task<UnidadMedidaResponse> Obtener(int unidadId)
        {
            return _unidadMedidaDA.Obtener(unidadId);
        }
    }
}