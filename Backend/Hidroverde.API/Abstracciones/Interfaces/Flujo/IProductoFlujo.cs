using Abstracciones.Modelos;

namespace Abstracciones.Interfaces.Flujo
{
    public interface IProductoFlujo
    {
        Task<IEnumerable<ProductoResponse>> Obtener();
        Task<ProductoResponse> Obtener(int productoId);
        Task<int> Agregar(ProductoRequest producto);
        Task<int> Editar(int productoId, ProductoRequest producto);
        Task Eliminar(int productoId);
    }
}