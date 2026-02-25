using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;

namespace Flujo
{
    public class TipoClienteFlujo : ITipoClienteFlujo
    {
        private readonly ITipoClienteDA _tipoClienteDA;
        public TipoClienteFlujo(ITipoClienteDA tipoClienteDA) => _tipoClienteDA = tipoClienteDA;

        public Task<int> Agregar(TipoClienteRequest tipoCliente) => _tipoClienteDA.Agregar(tipoCliente);
        public Task<int> Editar(int tipoClienteId, TipoClienteRequest tipoCliente) => _tipoClienteDA.Editar(tipoClienteId, tipoCliente);
        public Task<int> Eliminar(int tipoClienteId) => _tipoClienteDA.Eliminar(tipoClienteId);
        public Task<IEnumerable<TipoClienteResponse>> Obtener() => _tipoClienteDA.Obtener();
        public Task<TipoClienteResponse> Obtener(int tipoClienteId) => _tipoClienteDA.Obtener(tipoClienteId);
    }
}