using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;
using Hidroverde.Abstracciones.Modelos.Ciclos;

namespace Flujo
{
    public class CiclosFlujo : ICiclosFlujo
    {
        private readonly ICiclosDA _ciclosDA;

        public CiclosFlujo(ICiclosDA ciclosDA)
        {
            _ciclosDA = ciclosDA;
        }

        public Task<IEnumerable<CicloActivoResponse>> ObtenerActivos()
            => _ciclosDA.ObtenerActivos();

        public async Task<RegistrarSiembraResponse> RegistrarSiembraAsync(RegistrarSiembraRequest request, int responsableId)
        {
            var cicloId = await _ciclosDA.RegistrarSiembraAsync(request, responsableId);
            return new RegistrarSiembraResponse { CicloIdCreado = cicloId };
        }
        public Task<CosecharCicloResponse> CosecharAsync(int cicloId, CosecharCicloRequest request, int usuarioId)
    => _ciclosDA.CosecharAsync(cicloId, request, usuarioId);

     
        public Task<int> CancelarAsync(int cicloId, int usuarioId, string? motivo)
        => _ciclosDA.CancelarAsync(cicloId, usuarioId, motivo);

        }
}
