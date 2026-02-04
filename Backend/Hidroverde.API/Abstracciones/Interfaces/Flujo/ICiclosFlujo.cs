using Abstracciones.Modelos;
using Hidroverde.Abstracciones.Modelos.Ciclos;

namespace Abstracciones.Interfaces.Flujo
{
    public interface ICiclosFlujo
    {
        Task<IEnumerable<CicloActivoResponse>> ObtenerActivos();
        Task<RegistrarSiembraResponse> RegistrarSiembraAsync(RegistrarSiembraRequest request, int responsableId);
    }
}
