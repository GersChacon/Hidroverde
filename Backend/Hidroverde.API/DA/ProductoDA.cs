using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos;
using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;

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

        public async Task<IEnumerable<ProductoResponse>> Obtener()
        {
            var resultado = await _sqlConnection.QueryAsync<ProductoResponse>(
                "ObtenerProductos",
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }

        public async Task<ProductoResponse> Obtener(int productoId)
        {
            var resultado = await _sqlConnection.QueryFirstOrDefaultAsync<ProductoResponse>(
                "ObtenerProducto",
                new { producto_id = productoId },
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }

        public async Task<int> Agregar(ProductoRequest producto)
        {
            var resultado = await _sqlConnection.ExecuteScalarAsync<int>(
                "AgregarProducto",
                new
                {
                    codigo = producto.Codigo,
                    variedad_id = producto.VariedadId,
                    nombre_producto = producto.NombreProducto,
                    descripcion = producto.Descripcion,
                    precio_base = producto.PrecioBase,
                    dias_caducidad = producto.DiasCaducidad,
                    requiere_refrigeracion = producto.RequiereRefrigeracion,
                    imagen_url = producto.ImagenUrl,
                    activo = producto.Activo,
                    stock_minimo = producto.StockMinimo,
                    peso_gramos = producto.PesoGramos
                },
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }

        public async Task<int> Editar(int productoId, ProductoRequest producto)
        {
            await VerificarProductoExiste(productoId);

            var resultado = await _sqlConnection.ExecuteScalarAsync<int>(
                "EditarProducto",
                new
                {
                    producto_id = productoId,
                    codigo = producto.Codigo,
                    variedad_id = producto.VariedadId,
                    nombre_producto = producto.NombreProducto,
                    descripcion = producto.Descripcion,
                    precio_base = producto.PrecioBase,
                    dias_caducidad = producto.DiasCaducidad,
                    requiere_refrigeracion = producto.RequiereRefrigeracion,
                    imagen_url = producto.ImagenUrl,
                    activo = producto.Activo,
                    stock_minimo = producto.StockMinimo,
                    peso_gramos = producto.PesoGramos
                },
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }

        public async Task<int> Eliminar(int productoId)
        {
            await VerificarProductoExiste(productoId);

            var resultado = await _sqlConnection.ExecuteScalarAsync<int>(
                "EliminarProducto",
                new { producto_id = productoId },
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }

        private async Task VerificarProductoExiste(int productoId)
        {
            var producto = await Obtener(productoId);
            if (producto == null)
                throw new KeyNotFoundException($"No se encontró el producto con ID {productoId}");
        }
    }
}