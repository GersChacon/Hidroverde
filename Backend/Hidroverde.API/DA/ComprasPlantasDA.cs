using Abstracciones.Interfaces.DA;
using Abstracciones.Modelos;
using Dapper;
using System.Data;

namespace DA
{
    public class ComprasPlantasDA : IComprasPlantasDA
    {
        private readonly IRepositorioDapper _repositorioDapper;
        private readonly IDbConnection _db;

        public ComprasPlantasDA(IRepositorioDapper repositorioDapper)
        {
            _repositorioDapper = repositorioDapper;
            _db = _repositorioDapper.ObtenerRepositorio();
        }

        public async Task<int> RegistrarCompra(CompraPlantaRequest request)
        {
            var result = await _db.QueryFirstAsync<int>(
                "sp_ComprasPlantas_Registrar",
                new
                {
                    proveedor_id = request.ProveedorId,
                    empleado_id = request.EmpleadoId,
                    numero_factura = request.NumeroFactura,
                    fecha_compra = request.FechaCompra,
                    total_factura = request.TotalFactura,
                    observaciones = request.Observaciones
                },
                commandType: CommandType.StoredProcedure
            );

            return result;
        }

        public async Task<int> RegistrarDetalle(CompraPlantaDetalleRequest request)
        {
            var result = await _db.QueryFirstAsync<int>(
                "sp_ComprasPlantasDetalle_Registrar",
                new
                {
                    compra_id = request.CompraId,
                    producto_id = request.ProductoId,
                    unidad_id = request.UnidadId,
                    cantidad_comprada = request.CantidadComprada,
                    costo_total_linea = request.CostoTotalLinea,
                    observaciones = request.Observaciones
                },
                commandType: CommandType.StoredProcedure
            );

            return result;
        }

        public async Task<int> RegistrarMerma(CompraPlantaMermaRequest request)
        {
            var result = await _db.QueryFirstAsync<int>(
                "sp_ComprasPlantasMerma_Registrar",
                new
                {
                    compra_detalle_id = request.CompraDetalleId,
                    empleado_id = request.EmpleadoId,
                    cantidad_merma = request.CantidadMerma,
                    motivo = request.Motivo
                },
                commandType: CommandType.StoredProcedure
            );

            return result;
        }

        public async Task<IEnumerable<MargenUtilidadResponse>> ObtenerMargenes()
        {
            var result = await _db.QueryAsync<MargenUtilidadResponse>(
                "sp_MargenesUtilidad_Listar",
                commandType: CommandType.StoredProcedure
            );

            return result;
        }
    
    public async Task<CompraDetalleMermaResponse?> ObtenerDetalleParaMerma(int productoId, int proveedorId)
        {
            var resultado = await _db.QueryFirstOrDefaultAsync<CompraDetalleMermaResponse>(
                "sp_ComprasPlantasDetalle_ObtenerParaMerma",
                new
                {
                    producto_id = productoId,
                    proveedor_id = proveedorId
                },
                commandType: System.Data.CommandType.StoredProcedure
            );

            return resultado;
        }
    }
}