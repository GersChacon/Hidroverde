using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;

namespace Flujo
{
    public class ProductoFlujo : IProductoFlujo
    {
        private readonly IProductoDA _productoDA;

        public ProductoFlujo(IProductoDA productoDA)
        {
            _productoDA = productoDA;
        }

        public Task<int> Agregar(ProductoRequest producto)
        {
            return _productoDA.Agregar(producto);
        }

        public Task<int> Editar(int productoId, ProductoRequest producto)
        {
            return _productoDA.Editar(productoId, producto);
        }

        public Task<int> Eliminar(int productoId)
        {
            return _productoDA.Eliminar(productoId);
        }

        public Task<IEnumerable<ProductoResponse>> Obtener()
        {
            return _productoDA.Obtener();
        }

        public Task<ProductoResponse> Obtener(int productoId)
        {
            return _productoDA.Obtener(productoId);
        }
    }
}