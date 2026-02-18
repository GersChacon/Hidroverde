using Abstracciones.Modelos;

namespace Abstracciones.Interfaces.DA
{
    public interface ITipoEntregaDA
    {
        Task<IEnumerable<TipoEntregaResponse>> Obtener();
        Task<TipoEntregaResponse> Obtener(int tipoEntregaId);
        Task<int> Agregar(TipoEntregaRequest tipoEntrega);
        Task<int> Editar(int tipoEntregaId, TipoEntregaRequest tipoEntrega);
        Task<int> Eliminar(int tipoEntregaId);
    }
}