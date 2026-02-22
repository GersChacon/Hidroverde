using Abstracciones.Modelos;

namespace Abstracciones.Interfaces.Flujo
{
    public interface IRolFlujo
    {
        Task<IEnumerable<RolResponse>> Obtener();
        Task<RolResponse> Obtener(int rolId);
        Task<int> Agregar(RolRequest rol);
        Task<int> Editar(int rolId, RolRequest rol);
        Task<int> Eliminar(int rolId);
    }
}