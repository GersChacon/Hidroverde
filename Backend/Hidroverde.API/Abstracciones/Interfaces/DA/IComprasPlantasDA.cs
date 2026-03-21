using Abstracciones.Modelos;

namespace Abstracciones.Interfaces.DA
{
    public interface IComprasPlantasDA
    {
        Task<int> RegistrarCompra(CompraPlantaRequest request);
        Task<int> RegistrarDetalle(CompraPlantaDetalleRequest request);
        Task<int> RegistrarMerma(CompraPlantaMermaRequest request);
        Task<IEnumerable<MargenUtilidadResponse>> ObtenerMargenes();
        Task<CompraDetalleMermaResponse?> ObtenerDetalleParaMerma(int productoId, int proveedorId);
    }
}