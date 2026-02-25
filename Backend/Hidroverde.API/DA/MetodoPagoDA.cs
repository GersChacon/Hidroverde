using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos;
using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DA
{
    public class MetodoPagoDA : IMetodoPagoDA
    {
        private readonly IRepositorioDapper _repositorioDapper;
        private readonly SqlConnection _sqlConnection;

        public MetodoPagoDA(IRepositorioDapper repositorioDapper)
        {
            _repositorioDapper = repositorioDapper;
            _sqlConnection = _repositorioDapper.ObtenerRepositorio();
        }

        public async Task<IEnumerable<MetodoPagoResponse>> Obtener()
        {
            var resultado = await _sqlConnection.QueryAsync<MetodoPagoResponse>(
                "ObtenerMetodosPago",
                commandType: CommandType.StoredProcedure
            );
            return resultado;
        }

        public async Task<MetodoPagoResponse> Obtener(int metodoPagoId)
        {
            var resultado = await _sqlConnection.QueryFirstOrDefaultAsync<MetodoPagoResponse>(
                "ObtenerMetodoPago",
                new { metodo_pago_id = metodoPagoId },
                commandType: CommandType.StoredProcedure
            );
            return resultado;
        }

        public async Task<int> Agregar(MetodoPagoRequest metodoPago)
        {
            var resultado = await _sqlConnection.ExecuteScalarAsync<int>(
                "AgregarMetodoPago",
                new
                {
                    codigo = metodoPago.Codigo,
                    nombre = metodoPago.Nombre,
                    requiere_confirmacion = metodoPago.RequiereConfirmacion,
                    comision_porcentaje = metodoPago.ComisionPorcentaje,
                    activo = metodoPago.Activo
                },
                commandType: CommandType.StoredProcedure
            );
            return resultado;
        }

        public async Task<int> Editar(int metodoPagoId, MetodoPagoRequest metodoPago)
        {
            await VerificarMetodoPagoExiste(metodoPagoId);

            var resultado = await _sqlConnection.ExecuteScalarAsync<int>(
                "EditarMetodoPago",
                new
                {
                    metodo_pago_id = metodoPagoId,
                    codigo = metodoPago.Codigo,
                    nombre = metodoPago.Nombre,
                    requiere_confirmacion = metodoPago.RequiereConfirmacion,
                    comision_porcentaje = metodoPago.ComisionPorcentaje,
                    activo = metodoPago.Activo
                },
                commandType: CommandType.StoredProcedure
            );
            return resultado;
        }

        public async Task<int> Eliminar(int metodoPagoId)
        {
            await VerificarMetodoPagoExiste(metodoPagoId);

            var resultado = await _sqlConnection.ExecuteScalarAsync<int>(
                "EliminarMetodoPago",
                new { metodo_pago_id = metodoPagoId },
                commandType: CommandType.StoredProcedure
            );
            return resultado;
        }

        private async Task VerificarMetodoPagoExiste(int metodoPagoId)
        {
            var metodoPago = await Obtener(metodoPagoId);
            if (metodoPago == null)
                throw new KeyNotFoundException($"No se encontró el método de pago con ID {metodoPagoId}");
        }
    }
}