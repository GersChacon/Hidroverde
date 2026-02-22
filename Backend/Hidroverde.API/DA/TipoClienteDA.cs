using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos;
using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DA
{
    public class TipoClienteDA : ITipoClienteDA
    {
        private readonly IRepositorioDapper _repositorioDapper;
        private readonly SqlConnection _sqlConnection;

        public TipoClienteDA(IRepositorioDapper repositorioDapper)
        {
            _repositorioDapper = repositorioDapper;
            _sqlConnection = _repositorioDapper.ObtenerRepositorio();
        }

        public async Task<IEnumerable<TipoClienteResponse>> Obtener() =>
            await _sqlConnection.QueryAsync<TipoClienteResponse>("ObtenerTiposCliente", commandType: CommandType.StoredProcedure);

        public async Task<TipoClienteResponse> Obtener(int tipoClienteId) =>
            await _sqlConnection.QueryFirstOrDefaultAsync<TipoClienteResponse>(
                "ObtenerTipoCliente", new { tipo_cliente_id = tipoClienteId }, commandType: CommandType.StoredProcedure);

        public async Task<int> Agregar(TipoClienteRequest tipoCliente) =>
            await _sqlConnection.ExecuteScalarAsync<int>("AgregarTipoCliente",
                new { codigo = tipoCliente.Codigo, nombre = tipoCliente.Nombre, descripcion = tipoCliente.Descripcion, descuento_default = tipoCliente.DescuentoDefault, activo = tipoCliente.Activo },
                commandType: CommandType.StoredProcedure);

        public async Task<int> Editar(int tipoClienteId, TipoClienteRequest tipoCliente)
        {
            await VerificarExiste(tipoClienteId);
            return await _sqlConnection.ExecuteScalarAsync<int>("EditarTipoCliente",
                new { tipo_cliente_id = tipoClienteId, codigo = tipoCliente.Codigo, nombre = tipoCliente.Nombre, descripcion = tipoCliente.Descripcion, descuento_default = tipoCliente.DescuentoDefault, activo = tipoCliente.Activo },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<int> Eliminar(int tipoClienteId)
        {
            await VerificarExiste(tipoClienteId);
            return await _sqlConnection.ExecuteScalarAsync<int>("EliminarTipoCliente", new { tipo_cliente_id = tipoClienteId }, commandType: CommandType.StoredProcedure);
        }

        private async Task VerificarExiste(int tipoClienteId)
        {
            if (await Obtener(tipoClienteId) == null)
                throw new KeyNotFoundException($"No se encontró el tipo de cliente con ID {tipoClienteId}");
        }
    }
}