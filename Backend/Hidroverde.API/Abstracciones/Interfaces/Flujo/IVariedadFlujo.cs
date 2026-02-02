using Abstracciones.Modelos;

namespace Abstracciones.Interfaces.Flujo
{
    public interface IVariedadFlujo
    {
        Task<IEnumerable<VariedadResponse>> Obtener();
        Task<VariedadResponse> Obtener(int variedadId);
        Task<int> Agregar(VariedadRequest variedad);
        Task<int> Editar(int variedadId, VariedadRequest variedad);
        Task<int> Eliminar(int variedadId);
    }
}