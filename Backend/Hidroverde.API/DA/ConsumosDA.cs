using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos;
using DA.Repositorios;
using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DA
{
    public class ConsumosDA : IConsumosDA
    {
        private readonly IRepositorioDapper _repositorioDapper;
        private readonly SqlConnection _sqlConnection;

        public ConsumosDA(IRepositorioDapper repositorioDapper)
        {
            _repositorioDapper = repositorioDapper;
            _sqlConnection = _repositorioDapper.ObtenerRepositorio();
        }

        public async Task<long> Registrar(int empleadoId, ConsumoRequest request)
        {
            const string sp = "dbo.sp_Consumo_Registrar";

            var resultado = await _sqlConnection.ExecuteScalarAsync<long>(
                sp,
                new
                {
                    ciclo_id = request.CicloId,
                    tipo_recurso_id = request.TipoRecursoId,
                    cantidad = request.Cantidad,
                    fecha_consumo = request.FechaConsumo,
                    empleado_id = empleadoId,
                    notas = request.Notas
                },
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }

        public async Task<(long consumoId, int versionNo)> Editar(long consumoId, int empleadoId, ConsumoEditRequest request)
        {
            const string sp = "dbo.sp_Consumo_Editar";

            var resultado = await _sqlConnection.QueryFirstOrDefaultAsync<(long consumo_id, int version_no)>(
                sp,
                new
                {
                    consumo_id = consumoId,
                    nueva_cantidad = request.NuevaCantidad,
                    nueva_fecha_consumo = request.NuevaFechaConsumo,
                    empleado_id = empleadoId,
                    notas = request.Notas,
                    motivo_cambio = request.MotivoCambio
                },
                commandType: CommandType.StoredProcedure
            );

            return (resultado.consumo_id, resultado.version_no);
        }

        public async Task<IEnumerable<ConsumoResponse>> Obtener(int? cicloId, DateTime? fechaDesde, DateTime? fechaHasta, int? tipoRecursoId)
        {
            const string sp = "dbo.sp_Consumos_Listar";

            var resultado = await _sqlConnection.QueryAsync<ConsumoResponse>(
                sp,
                new
                {
                    ciclo_id = cicloId,
                    fecha_desde = fechaDesde,
                    fecha_hasta = fechaHasta,
                    tipo_recurso_id = tipoRecursoId
                },
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }

        public async Task<IEnumerable<ConsumoHistorialResponse>> ObtenerHistorial(long consumoId)
        {
            const string sp = "dbo.sp_Consumo_Historial";

            var resultado = await _sqlConnection.QueryAsync<ConsumoHistorialResponse>(
                sp,
                new { consumo_id = consumoId },
                commandType: CommandType.StoredProcedure
            );

            return resultado;
        }

        public async Task<IEnumerable<ConsumoReporteResponse>> ObtenerReporte(int cicloId, DateTime? fechaDesde, DateTime? fechaHasta, string granularidad)
        {
            const string sp = "dbo.sp_Consumos_ReporteComparativo";

            var resultado = await _sqlConnection.QueryAsync<ConsumoReporteResponse>(
                sp,
                new
                {
                    ciclo_id = cicloId,
                    fecha_desde = fechaDesde,
                    fecha_hasta = fechaHasta,
                    granularidad = granularidad
                },
                commandType: CommandType.StoredProcedure
            );

            return resultado;

        }
        public async Task<IEnumerable<ConsumoReporteDiarioResponse>> ObtenerReporteDiario(
            int? cicloId,
            DateTime? fechaDesde,
            DateTime? fechaHasta,
            int? tipoRecursoId)
        {
            const string sp = "dbo.sp_Consumos_ReporteDiario";

            var parametros = new
            {
                ciclo_id = cicloId,
                fecha_desde = fechaDesde?.Date,
                fecha_hasta = fechaHasta?.Date,
                tipo_recurso_id = tipoRecursoId
            };

            return await _sqlConnection.QueryAsync<ConsumoReporteDiarioResponse>(
                sp,
                parametros,
                commandType: System.Data.CommandType.StoredProcedure
            );
        }
    }
}
