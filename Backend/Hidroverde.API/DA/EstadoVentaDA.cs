using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos;
using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DA
{
    public class EstadoVentaDA : IEstadoVentaDA
    {
        private readonly IRepositorioDapper _repositorioDapper;
        private readonly SqlConnection _sqlConnection;

        public EstadoVentaDA(IRepositorioDapper repositorioDapper)
        {
            _repositorioDapper = repositorioDapper;
            _sqlConnection = _repositorioDapper.ObtenerRepositorio();
        }

        public async Task<IEnumerable<EstadoVentaResponse>> Obtener()
        {
            var resultado = await _sqlConnection.QueryAsync<EstadoVentaResponse>(
                "ObtenerEstadosVenta",
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }

        public async Task<EstadoVentaResponse> Obtener(int estadoVentaId)
        {
            var resultado = await _sqlConnection.QueryFirstOrDefaultAsync<EstadoVentaResponse>(
                "ObtenerEstadoVenta",
                new { estado_venta_id = estadoVentaId },
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }

        public async Task<int> Agregar(EstadoVentaRequest estadoVenta)
        {
            var resultado = await _sqlConnection.ExecuteScalarAsync<int>(
                "AgregarEstadoVenta",
                new
                {
                    codigo = estadoVenta.Codigo,
                    nombre = estadoVenta.Nombre,
                    orden = estadoVenta.Orden,
                    color = estadoVenta.Color,
                    permite_modificacion = estadoVenta.PermiteModificacion,
                    descripcion = estadoVenta.Descripcion,
                    activo = estadoVenta.Activo
                },
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }

        public async Task<int> Editar(int estadoVentaId, EstadoVentaRequest estadoVenta)
        {
            await VerificarEstadoVentaExiste(estadoVentaId);

            var resultado = await _sqlConnection.ExecuteScalarAsync<int>(
                "EditarEstadoVenta",
                new
                {
                    estado_venta_id = estadoVentaId,
                    codigo = estadoVenta.Codigo,
                    nombre = estadoVenta.Nombre,
                    orden = estadoVenta.Orden,
                    color = estadoVenta.Color,
                    permite_modificacion = estadoVenta.PermiteModificacion,
                    descripcion = estadoVenta.Descripcion,
                    activo = estadoVenta.Activo
                },
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }

        public async Task<int> Eliminar(int estadoVentaId)
        {
            await VerificarEstadoVentaExiste(estadoVentaId);

            var resultado = await _sqlConnection.ExecuteScalarAsync<int>(
                "EliminarEstadoVenta",
                new { estado_venta_id = estadoVentaId },
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }

        private async Task VerificarEstadoVentaExiste(int estadoVentaId)
        {
            var estadoVenta = await Obtener(estadoVentaId);
            if (estadoVenta == null)
                throw new KeyNotFoundException($"No se encontró el estado de venta con ID {estadoVentaId}");
        }
    }
}