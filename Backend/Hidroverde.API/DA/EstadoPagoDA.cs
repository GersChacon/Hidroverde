using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos;
using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DA
{
    public class EstadoPagoDA : IEstadoPagoDA
    {
        private readonly IRepositorioDapper _repositorioDapper;
        private readonly SqlConnection _sqlConnection;

        public EstadoPagoDA(IRepositorioDapper repositorioDapper)
        {
            _repositorioDapper = repositorioDapper;
            _sqlConnection = _repositorioDapper.ObtenerRepositorio();
        }

        public async Task<IEnumerable<EstadoPagoResponse>> Obtener() =>
            await _sqlConnection.QueryAsync<EstadoPagoResponse>("ObtenerEstadosPago", commandType: CommandType.StoredProcedure);

        public async Task<EstadoPagoResponse> Obtener(int estadoPagoId) =>
            await _sqlConnection.QueryFirstOrDefaultAsync<EstadoPagoResponse>(
                "ObtenerEstadoPago", new { estado_pago_id = estadoPagoId }, commandType: CommandType.StoredProcedure);

        public async Task<int> Agregar(EstadoPagoRequest estadoPago) =>
            await _sqlConnection.ExecuteScalarAsync<int>("AgregarEstadoPago",
                new { codigo = estadoPago.Codigo, nombre = estadoPago.Nombre, permite_entrega = estadoPago.PermiteEntrega, color = estadoPago.Color, descripcion = estadoPago.Descripcion, activo = estadoPago.Activo },
                commandType: CommandType.StoredProcedure);

        public async Task<int> Editar(int estadoPagoId, EstadoPagoRequest estadoPago)
        {
            await VerificarExiste(estadoPagoId);
            return await _sqlConnection.ExecuteScalarAsync<int>("EditarEstadoPago",
                new { estado_pago_id = estadoPagoId, codigo = estadoPago.Codigo, nombre = estadoPago.Nombre, permite_entrega = estadoPago.PermiteEntrega, color = estadoPago.Color, descripcion = estadoPago.Descripcion, activo = estadoPago.Activo },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<int> Eliminar(int estadoPagoId)
        {
            await VerificarExiste(estadoPagoId);
            return await _sqlConnection.ExecuteScalarAsync<int>("EliminarEstadoPago", new { estado_pago_id = estadoPagoId }, commandType: CommandType.StoredProcedure);
        }

        private async Task VerificarExiste(int estadoPagoId)
        {
            if (await Obtener(estadoPagoId) == null)
                throw new KeyNotFoundException($"No se encontró el estado de pago con ID {estadoPagoId}");
        }
    }
}