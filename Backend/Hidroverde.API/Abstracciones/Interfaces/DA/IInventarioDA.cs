using Abstracciones.Modelos;

namespace Abstracciones.Interfaces.DA
{
    public interface IInventarioDA
    {
        Task<IEnumerable<InventarioActualResponse>> ListarActual(
            int? cicloOrigenId,
            int? productoId,
            string? productoNombre,
            string? lote,
            DateTime? desde,
            DateTime? hasta,
            bool soloDisponibles
        );

        Task<InventarioActualResponse?> ObtenerActualPorId(int inventarioId);

        Task<IEnumerable<MovimientoInventarioResponse>> ListarMovimientos(
            int inventarioId,
            DateTime? desde,
            DateTime? hasta
        );
    }
}