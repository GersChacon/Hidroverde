using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos;
using Dapper;
using Microsoft.Data.SqlClient;

namespace DA
{
    public class ProductoDA : IProductoDA
    {
        private readonly IRepositorioDapper _repositorioDapper;
        private readonly SqlConnection _sqlConnection;

        public ProductoDA(IRepositorioDapper repositorioDapper)
        {
            _repositorioDapper = repositorioDapper;
            _sqlConnection = _repositorioDapper.ObtenerRepositorio();
        }

        public async Task<int> Agregar(ProductoRequest producto)
        {
            string query = @"AgregarProducto";

            var resultadoConsulta = await _sqlConnection.ExecuteScalarAsync<int>(query, new
            {
                codigo = producto.Codigo,
                variedad_id = producto.VariedadId,
                unidad_id = producto.UnidadId,
                nombre_producto = producto.NombreProducto,
                descripcion = producto.Descripcion,
                precio_base = producto.PrecioBase,
                dias_caducidad = producto.DiasCaducidad,
                requiere_refrigeracion = producto.RequiereRefrigeracion,
                imagen_url = producto.ImagenUrl,
                activo = producto.Activo,
                stock_minimo = producto.StockMinimo
            });

            return resultadoConsulta;
        }

        public async Task<int> Editar(int productoId, ProductoRequest producto)
        {
            await VerificarProductoExiste(productoId);

            string query = @"EditarProducto";
            var resultadoConsulta = await _sqlConnection.ExecuteScalarAsync<int>(query, new
            {
                producto_id = productoId,
                codigo = producto.Codigo,
                variedad_id = producto.VariedadId,
                unidad_id = producto.UnidadId,
                nombre_producto = producto.NombreProducto,
                descripcion = producto.Descripcion,
                precio_base = producto.PrecioBase,
                dias_caducidad = producto.DiasCaducidad,
                requiere_refrigeracion = producto.RequiereRefrigeracion,
                imagen_url = producto.ImagenUrl,
                activo = producto.Activo,
                stock_minimo = producto.StockMinimo
            });

            return resultadoConsulta;
        }

        public async Task<int> Eliminar(int productoId)
        {
            await VerificarProductoExiste(productoId);

            string query = @"EliminarProducto";
            var resultadoConsulta = await _sqlConnection.ExecuteScalarAsync<int>(query, new
            {
                producto_id = productoId
            });

            return resultadoConsulta;
        }

        public async Task<IEnumerable<ProductoResponse>> Obtener()
        {
            string query = @"ObtenerProductos";
            var resultadoConsulta = await _sqlConnection.QueryAsync<ProductoResponse>(query);
            return resultadoConsulta;
        }

        public async Task<ProductoResponse> Obtener(int productoId)
        {
            string query = @"ObtenerProducto";
            var resultadoConsulta = await _sqlConnection.QueryFirstOrDefaultAsync<ProductoResponse>(
                query,
                new { producto_id = productoId }
            );

            return resultadoConsulta;
        }

        private async Task VerificarProductoExiste(int productoId)
        {
            var resultadoConsulta = await Obtener(productoId);
            if (resultadoConsulta == null)
                throw new Exception("No se encontró el producto");
        }
    }
}