using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos;
using Dapper;
using Microsoft.Data.SqlClient;

namespace DA
{
    public class TipoCultivoDA : ITipoCultivoDA
    {
        private readonly IRepositorioDapper _repositorioDapper;
        private readonly SqlConnection _sqlConnection;

        public TipoCultivoDA(IRepositorioDapper repositorioDapper)
        {
            _repositorioDapper = repositorioDapper;
            _sqlConnection = _repositorioDapper.ObtenerRepositorio();
        }

        public async Task<int> Agregar(TipoCultivoRequest tipoCultivo)
        {
            string query = @"AgregarTipoCultivo";

            var resultadoConsulta = await _sqlConnection.ExecuteScalarAsync<int>(query, new
            {
                codigo = tipoCultivo.Codigo,
                nombre = tipoCultivo.Nombre,
                descripcion = tipoCultivo.Descripcion,
                requisitos = tipoCultivo.Requisitos,
                activo = tipoCultivo.Activo
            });

            return resultadoConsulta;
        }

        public async Task<int> Editar(int tipoCultivoId, TipoCultivoRequest tipoCultivo)
        {
            await VerificarTipoCultivoExiste(tipoCultivoId);

            string query = @"EditarTipoCultivo";
            var resultadoConsulta = await _sqlConnection.ExecuteScalarAsync<int>(query, new
            {
                tipo_cultivo_id = tipoCultivoId,
                codigo = tipoCultivo.Codigo,
                nombre = tipoCultivo.Nombre,
                descripcion = tipoCultivo.Descripcion,
                requisitos = tipoCultivo.Requisitos,
                activo = tipoCultivo.Activo
            });

            return resultadoConsulta;
        }

        public async Task<int> Eliminar(int tipoCultivoId)
        {
            await VerificarTipoCultivoExiste(tipoCultivoId);

            string query = @"EliminarTipoCultivo";
            var resultadoConsulta = await _sqlConnection.ExecuteScalarAsync<int>(query, new
            {
                tipo_cultivo_id = tipoCultivoId
            });

            return resultadoConsulta;
        }

        public async Task<IEnumerable<TipoCultivoResponse>> Obtener()
        {
            string query = @"ObtenerTiposCultivo";
            var resultadoConsulta = await _sqlConnection.QueryAsync<TipoCultivoResponse>(query);
            return resultadoConsulta;
        }

        public async Task<TipoCultivoResponse> Obtener(int tipoCultivoId)
        {
            string query = @"ObtenerTipoCultivo";
            var resultadoConsulta = await _sqlConnection.QueryFirstOrDefaultAsync<TipoCultivoResponse>(
                query,
                new { tipo_cultivo_id = tipoCultivoId }
            );

            return resultadoConsulta;
        }

        private async Task VerificarTipoCultivoExiste(int tipoCultivoId)
        {
            var resultadoConsulta = await Obtener(tipoCultivoId);
            if (resultadoConsulta == null)
                throw new Exception("No se encontró el tipo de cultivo");
        }
    }
}