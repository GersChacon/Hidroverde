using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;

namespace Flujo
{
    public class InventarioFlujo : IInventarioFlujo
    {
        private readonly IInventarioDA _da;

        public InventarioFlujo(IInventarioDA da) => _da = da;

        public Task<IEnumerable<InventarioActualResponse>> ListarActual(
    int? cicloOrigenId,
    int? productoId,
    string? productoNombre,
    string? lote,
    DateTime? desde,
    DateTime? hasta,
    bool soloDisponibles
)
    => _da.ListarActual(cicloOrigenId, productoId, productoNombre, lote, desde, hasta, soloDisponibles);

        public Task<InventarioActualResponse?> ObtenerActualPorId(int inventarioId)
        => _da.ObtenerActualPorId(inventarioId);
    
    public Task<IEnumerable<MovimientoInventarioResponse>> ListarMovimientos(
    int inventarioId,
    DateTime? desde,
    DateTime? hasta
)
    => _da.ListarMovimientos(inventarioId, desde, hasta);

    }
}