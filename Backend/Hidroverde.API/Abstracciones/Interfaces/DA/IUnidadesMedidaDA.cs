using Abstracciones.Modelos;

namespace Abstracciones.Interfaces.DA
{
    public interface IUnidadMedidaDA
    {
        Task<IEnumerable<UnidadMedidaResponse>> Obtener();
        Task<UnidadMedidaResponse> Obtener(int unidadId);
        Task<int> Agregar(UnidadMedidaRequest unidadMedida);
        Task<int> Editar(int unidadId, UnidadMedidaRequest unidadMedida);
        Task<int> Eliminar(int unidadId);
    }
}