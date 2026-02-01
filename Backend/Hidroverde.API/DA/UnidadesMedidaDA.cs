using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos;
using Dapper;
using Microsoft.Data.SqlClient;

namespace DA
{
    public class UnidadMedidaDA : IUnidadMedidaDA
    {
        private readonly IRepositorioDapper _repositorioDapper;
        private readonly SqlConnection _sqlConnection;

        public UnidadMedidaDA(IRepositorioDapper repositorioDapper)
        {
            _repositorioDapper = repositorioDapper;
            _sqlConnection = _repositorioDapper.ObtenerRepositorio();
        }

        public async Task<int> Agregar(UnidadMedidaRequest unidadMedida)
        {
            string query = @"AgregarUnidadMedida";

            var resultadoConsulta = await _sqlConnection.ExecuteScalarAsync<int>(query, new
            {
                codigo = unidadMedida.Codigo,
                nombre = unidadMedida.Nombre,
                simbolo = unidadMedida.Simbolo,
                tipo = unidadMedida.Tipo,
                activo = unidadMedida.Activo
            });

            return resultadoConsulta;
        }

        public async Task<int> Editar(int unidadId, UnidadMedidaRequest unidadMedida)
        {
            await VerificarUnidadMedidaExiste(unidadId);

            string query = @"EditarUnidadMedida";
            var resultadoConsulta = await _sqlConnection.ExecuteScalarAsync<int>(query, new
            {
                unidad_id = unidadId,
                codigo = unidadMedida.Codigo,
                nombre = unidadMedida.Nombre,
                simbolo = unidadMedida.Simbolo,
                tipo = unidadMedida.Tipo,
                activo = unidadMedida.Activo
            });

            return resultadoConsulta;
        }

        public async Task<int> Eliminar(int unidadId)
        {
            await VerificarUnidadMedidaExiste(unidadId);

            string query = @"EliminarUnidadMedida";
            var resultadoConsulta = await _sqlConnection.ExecuteScalarAsync<int>(query, new
            {
                unidad_id = unidadId
            });

            return resultadoConsulta;
        }

        public async Task<IEnumerable<UnidadMedidaResponse>> Obtener()
        {
            string query = @"ObtenerUnidadesMedida";
            var resultadoConsulta = await _sqlConnection.QueryAsync<UnidadMedidaResponse>(query);
            return resultadoConsulta;
        }

        public async Task<UnidadMedidaResponse> Obtener(int unidadId)
        {
            string query = @"ObtenerUnidadMedida";
            var resultadoConsulta = await _sqlConnection.QueryFirstOrDefaultAsync<UnidadMedidaResponse>(
                query,
                new { unidad_id = unidadId }
            );

            return resultadoConsulta;
        }

        private async Task VerificarUnidadMedidaExiste(int unidadId)
        {
            var resultadoConsultaUnidad = await Obtener(unidadId);
            if (resultadoConsultaUnidad == null)
                throw new Exception("No se encontró la unidad de medida");
        }
    }
}