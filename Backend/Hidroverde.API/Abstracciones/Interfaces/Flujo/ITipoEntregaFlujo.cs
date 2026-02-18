using Abstracciones.Modelos;

namespace Abstracciones.Interfaces.Flujo
{
    public interface ITipoEntregaFlujo
    {
        Task<IEnumerable<TipoEntregaResponse>> Obtener();
        Task<TipoEntregaResponse> Obtener(int tipoEntregaId);
        Task<int> Agregar(TipoEntregaRequest tipoEntrega);
        Task<int> Editar(int tipoEntregaId, TipoEntregaRequest tipoEntrega);
        Task<int> Eliminar(int tipoEntregaId);
    }
}