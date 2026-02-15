using Abstracciones.Modelos;
using Hidroverde.Abstracciones.Modelos.Ciclos;

namespace Abstracciones.Interfaces.DA
{
    public interface ICiclosDA
    {
        Task<IEnumerable<CicloActivoResponse>> ObtenerActivos();
        Task<int> RegistrarSiembraAsync(RegistrarSiembraRequest request, int responsableId);
        Task<CosecharCicloResponse> CosecharAsync(int cicloId, CosecharCicloRequest request, int usuarioId);
        Task<int> CancelarAsync(int cicloId, int usuarioId, string? motivo);

    }

}
