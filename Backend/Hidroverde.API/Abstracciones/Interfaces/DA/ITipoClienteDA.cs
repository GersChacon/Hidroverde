using Abstracciones.Modelos;

namespace Abstracciones.Interfaces.DA
{
    public interface ITipoClienteDA
    {
        Task<IEnumerable<TipoClienteResponse>> Obtener();
        Task<TipoClienteResponse> Obtener(int tipoClienteId);
        Task<int> Agregar(TipoClienteRequest tipoCliente);
        Task<int> Editar(int tipoClienteId, TipoClienteRequest tipoCliente);
        Task<int> Eliminar(int tipoClienteId);
    }
}