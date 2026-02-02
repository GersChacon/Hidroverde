using Abstracciones.Modelos;

namespace Abstracciones.Interfaces.Flujo
{
    public interface ICategoriaFlujo
    {
        Task<IEnumerable<CategoriaResponse>> Obtener();
        Task<CategoriaResponse> Obtener(int categoriaId);
        Task<int> Agregar(CategoriaRequest categoria);
        Task<int> Editar(int categoriaId, CategoriaRequest categoria);
        Task<int> Eliminar(int categoriaId);
    }
}