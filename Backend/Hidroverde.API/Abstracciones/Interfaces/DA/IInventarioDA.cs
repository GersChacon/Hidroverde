using Abstracciones.Modelos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Abstracciones.Interfaces.DA
{
    public interface IInventarioDA
    {
        Task<IEnumerable<InventarioActualResponse>> ListarActual(
            int? cicloOrigenId,
            int? productoId,
            string? lote,
            bool soloDisponibles
        );
        Task<InventarioActualResponse?> ObtenerActualPorId(int inventarioId);
        Task<IEnumerable<MovimientoInventarioResponse>> ListarMovimientos(
             int inventarioId,
             DateTime? desde,
             DateTime? hasta);

    }
}