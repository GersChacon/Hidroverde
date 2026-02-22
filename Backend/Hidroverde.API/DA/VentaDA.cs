using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos;
using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DA
{
    public class VentaDA : IVentaDA
    {
        private readonly IRepositorioDapper _repositorioDapper;
        private readonly SqlConnection _sqlConnection;

        public VentaDA(IRepositorioDapper repositorioDapper)
        {
            _repositorioDapper = repositorioDapper;
            _sqlConnection = _repositorioDapper.ObtenerRepositorio();
        }

        public async Task<IEnumerable<VentaResumenResponse>> Obtener() =>
            await _sqlConnection.QueryAsync<VentaResumenResponse>(
                "ObtenerVentas",
                commandType: CommandType.StoredProcedure);

        public async Task<VentaResponse> Obtener(int ventaId)
        {
            // Multi-query: cabecera + detalle en una sola llamada
            using var multi = await _sqlConnection.QueryMultipleAsync(
                "ObtenerVenta",
                new { venta_id = ventaId },
                commandType: CommandType.StoredProcedure);

            var venta = await multi.ReadFirstOrDefaultAsync<VentaResponse>();
            if (venta == null) return null;

            venta.Detalle = (await multi.ReadAsync<DetalleVentaResponse>()).ToList();
            return venta;
        }

        public async Task<int> Crear(VentaRequest venta)
        {
            // Convertimos el detalle a DataTable para enviarlo como TVP
            var tvp = CrearTVPDetalle(venta.Detalle);

            return await _sqlConnection.ExecuteScalarAsync<int>(
                "CrearVenta",
                new
                {
                    cliente_id = venta.ClienteId,
                    direccion_entrega_id = venta.DireccionEntregaId,
                    vendedor_id = venta.VendedorId,
                    estado_venta_id = venta.EstadoVentaId,
                    estado_pago_id = venta.EstadoPagoId,
                    metodo_pago_id = venta.MetodoPagoId,
                    tipo_entrega_id = venta.TipoEntregaId,
                    numero_factura = venta.NumeroFactura,
                    fecha_entrega = venta.FechaEntrega,
                    iva_monto = venta.IvaMonto,
                    notas = venta.Notas,
                    detalle = tvp.AsTableValuedParameter("TVP_DetalleVenta")
                },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<int> CambiarEstado(int ventaId, int estadoVentaId, string? notas)
        {
            await VerificarVentaExiste(ventaId);
            return await _sqlConnection.ExecuteScalarAsync<int>(
                "CambiarEstadoVenta",
                new { venta_id = ventaId, estado_venta_id = estadoVentaId, notas },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<int> ConfirmarPago(int ventaId, int estadoPagoId, int metodoPagoId, string? notas)
        {
            await VerificarVentaExiste(ventaId);
            return await _sqlConnection.ExecuteScalarAsync<int>(
                "ConfirmarPagoVenta",
                new { venta_id = ventaId, estado_pago_id = estadoPagoId, metodo_pago_id = metodoPagoId, notas },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<int> Cancelar(int ventaId, string motivo)
        {
            await VerificarVentaExiste(ventaId);
            return await _sqlConnection.ExecuteScalarAsync<int>(
                "CancelarVenta",
                new { venta_id = ventaId, motivo },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<int> AgregarDetalle(int ventaId, List<DetalleVentaRequest> detalle)
        {
            await VerificarVentaExiste(ventaId);
            var tvp = CrearTVPDetalle(detalle);
            return await _sqlConnection.ExecuteScalarAsync<int>(
                "AgregarDetalleVenta",
                new
                {
                    venta_id = ventaId,
                    detalle = tvp.AsTableValuedParameter("TVP_DetalleVenta")
                },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<int> EliminarDetalle(int ventaId, int detalleId)
        {
            await VerificarVentaExiste(ventaId);
            return await _sqlConnection.ExecuteScalarAsync<int>(
                "EliminarDetalleVenta",
                new { venta_id = ventaId, detalle_id = detalleId },
                commandType: CommandType.StoredProcedure);
        }

        // Convierte la lista de detalle a un DataTable para el TVP
        private DataTable CrearTVPDetalle(List<DetalleVentaRequest> detalle)
        {
            var dt = new DataTable();
            dt.Columns.Add("inventario_id", typeof(int));
            dt.Columns.Add("producto_id", typeof(int));
            dt.Columns.Add("cantidad", typeof(int));
            dt.Columns.Add("precio_unitario", typeof(decimal));
            dt.Columns.Add("descuento_unitario", typeof(decimal));
            dt.Columns.Add("notas", typeof(string));

            foreach (var item in detalle)
                dt.Rows.Add(item.InventarioId, item.ProductoId, item.Cantidad, item.PrecioUnitario, item.DescuentoUnitario, item.Notas ?? (object)DBNull.Value);

            return dt;
        }

        private async Task VerificarVentaExiste(int ventaId)
        {
            var existe = await _sqlConnection.ExecuteScalarAsync<int?>(
                "SELECT venta_id FROM Ventas WHERE venta_id = @ventaId",
                new { ventaId });
            if (existe == null)
                throw new KeyNotFoundException($"No se encontró la venta con ID {ventaId}");
        }
    }
}