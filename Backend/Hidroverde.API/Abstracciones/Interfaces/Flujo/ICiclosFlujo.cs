using Abstracciones.Modelos;
using Hidroverde.Abstracciones.Modelos.Ciclos;

namespace Abstracciones.Interfaces.Flujo
{
    public interface ICiclosFlujo
    {
        Task<IEnumerable<CicloActivoResponse>> ObtenerActivos();
        Task<RegistrarSiembraResponse> RegistrarSiembraAsync(RegistrarSiembraRequest request, int responsableId);
        Task<CosecharCicloResponse> CosecharAsync(int cicloId, CosecharCicloRequest request, int usuarioId);
        Task<int> CancelarAsync(int cicloId, int usuarioId, string? motivo);


    }
}
