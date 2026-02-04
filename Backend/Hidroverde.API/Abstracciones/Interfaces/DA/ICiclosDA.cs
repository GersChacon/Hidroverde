using Abstracciones.Modelos;
using Hidroverde.Abstracciones.Modelos.Ciclos;

namespace Abstracciones.Interfaces.DA
{
    public interface ICiclosDA
    {
        Task<IEnumerable<CicloActivoResponse>> ObtenerActivos();
        Task<int> RegistrarSiembraAsync(RegistrarSiembraRequest request, int responsableId);
    }
}
