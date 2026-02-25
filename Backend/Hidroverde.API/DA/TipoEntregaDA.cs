using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos;
using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DA
{
    public class TipoEntregaDA : ITipoEntregaDA
    {
        private readonly IRepositorioDapper _repositorioDapper;
        private readonly SqlConnection _sqlConnection;

        public TipoEntregaDA(IRepositorioDapper repositorioDapper)
        {
            _repositorioDapper = repositorioDapper;
            _sqlConnection = _repositorioDapper.ObtenerRepositorio();
        }

        public async Task<IEnumerable<TipoEntregaResponse>> Obtener()
        {
            var resultado = await _sqlConnection.QueryAsync<TipoEntregaResponse>(
                "ObtenerTiposEntrega",
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }

        public async Task<TipoEntregaResponse> Obtener(int tipoEntregaId)
        {
            var resultado = await _sqlConnection.QueryFirstOrDefaultAsync<TipoEntregaResponse>(
                "ObtenerTipoEntrega",
                new { tipo_entrega_id = tipoEntregaId },
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }

        public async Task<int> Agregar(TipoEntregaRequest tipoEntrega)
        {
            var resultado = await _sqlConnection.ExecuteScalarAsync<int>(
                "AgregarTipoEntrega",
                new
                {
                    codigo = tipoEntrega.Codigo,
                    nombre = tipoEntrega.Nombre,
                    costo_default = tipoEntrega.CostoDefault,
                    descripcion = tipoEntrega.Descripcion,
                    activo = tipoEntrega.Activo
                },
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }

        public async Task<int> Editar(int tipoEntregaId, TipoEntregaRequest tipoEntrega)
        {
            await VerificarTipoEntregaExiste(tipoEntregaId);

            var resultado = await _sqlConnection.ExecuteScalarAsync<int>(
                "EditarTipoEntrega",
                new
                {
                    tipo_entrega_id = tipoEntregaId,
                    codigo = tipoEntrega.Codigo,
                    nombre = tipoEntrega.Nombre,
                    costo_default = tipoEntrega.CostoDefault,
                    descripcion = tipoEntrega.Descripcion,
                    activo = tipoEntrega.Activo
                },
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }

        public async Task<int> Eliminar(int tipoEntregaId)
        {
            await VerificarTipoEntregaExiste(tipoEntregaId);

            var resultado = await _sqlConnection.ExecuteScalarAsync<int>(
                "EliminarTipoEntrega",
                new { tipo_entrega_id = tipoEntregaId },
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }

        private async Task VerificarTipoEntregaExiste(int tipoEntregaId)
        {
            var tipoEntrega = await Obtener(tipoEntregaId);
            if (tipoEntrega == null)
                throw new KeyNotFoundException($"No se encontró el tipo de entrega con ID {tipoEntregaId}");
        }
    }
}