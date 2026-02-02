using Abstracciones.Modelos;

namespace Abstracciones.Interfaces.DA
{
    public interface IProductoDA
    {
        Task<IEnumerable<ProductoResponse>> Obtener();
        Task<ProductoResponse> Obtener(int productoId);
        Task<int> Agregar(ProductoRequest producto);
        Task<int> Editar(int productoId, ProductoRequest producto);
        Task<int> Eliminar(int productoId);
    }
}