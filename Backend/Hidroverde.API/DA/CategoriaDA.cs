using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos;
using Dapper;
using Microsoft.Data.SqlClient;

namespace DA
{
    public class CategoriaDA : ICategoriaDA
    {
        private readonly IRepositorioDapper _repositorioDapper;
        private readonly SqlConnection _sqlConnection;

        public CategoriaDA(IRepositorioDapper repositorioDapper)
        {
            _repositorioDapper = repositorioDapper;
            _sqlConnection = _repositorioDapper.ObtenerRepositorio();
        }

        public async Task<int> Agregar(CategoriaRequest categoria)
        {
            string query = @"AgregarCategoria";

            var resultadoConsulta = await _sqlConnection.ExecuteScalarAsync<int>(query, new
            {
                tipo_cultivo_id = categoria.TipoCultivoId,
                nombre = categoria.Nombre,
                descripcion = categoria.Descripcion,
                requiere_seguimiento = categoria.RequiereSeguimiento,
                activa = categoria.Activa
            });

            return resultadoConsulta;
        }

        public async Task<int> Editar(int categoriaId, CategoriaRequest categoria)
        {
            await VerificarCategoriaExiste(categoriaId);

            string query = @"EditarCategoria";
            var resultadoConsulta = await _sqlConnection.ExecuteScalarAsync<int>(query, new
            {
                categoria_id = categoriaId,
                tipo_cultivo_id = categoria.TipoCultivoId,
                nombre = categoria.Nombre,
                descripcion = categoria.Descripcion,
                requiere_seguimiento = categoria.RequiereSeguimiento,
                activa = categoria.Activa
            });

            return resultadoConsulta;
        }

        public async Task<int> Eliminar(int categoriaId)
        {
            await VerificarCategoriaExiste(categoriaId);

            string query = @"EliminarCategoria";
            var resultadoConsulta = await _sqlConnection.ExecuteScalarAsync<int>(query, new
            {
                categoria_id = categoriaId
            });

            return resultadoConsulta;
        }

        public async Task<IEnumerable<CategoriaResponse>> Obtener()
        {
            string query = @"ObtenerCategorias";
            var resultadoConsulta = await _sqlConnection.QueryAsync<CategoriaResponse>(query);
            return resultadoConsulta;
        }

        public async Task<CategoriaResponse> Obtener(int categoriaId)
        {
            string query = @"ObtenerCategoria";
            var resultadoConsulta = await _sqlConnection.QueryFirstOrDefaultAsync<CategoriaResponse>(
                query,
                new { categoria_id = categoriaId }
            );

            return resultadoConsulta;
        }

        private async Task VerificarCategoriaExiste(int categoriaId)
        {
            var resultadoConsulta = await Obtener(categoriaId);
            if (resultadoConsulta == null)
                throw new Exception("No se encontró la categoría");
        }
    }
}