using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;

namespace Flujo
{
    public class ComprasPlantasFlujo : IComprasPlantasFlujo
    {
        private readonly IComprasPlantasDA _da;

        public ComprasPlantasFlujo(IComprasPlantasDA da)
        {
            _da = da;
        }

        public Task<int> RegistrarCompra(CompraPlantaRequest request)
            => _da.RegistrarCompra(request);

        public Task<int> RegistrarDetalle(CompraPlantaDetalleRequest request)
            => _da.RegistrarDetalle(request);

        public Task<int> RegistrarMerma(CompraPlantaMermaRequest request)
            => _da.RegistrarMerma(request);

        public Task<IEnumerable<MargenUtilidadResponse>> ObtenerMargenes()
            => _da.ObtenerMargenes();
    
    public Task<CompraDetalleMermaResponse?> ObtenerDetalleParaMerma(int productoId, int proveedorId)
    => _da.ObtenerDetalleParaMerma(productoId, proveedorId);
    }
}