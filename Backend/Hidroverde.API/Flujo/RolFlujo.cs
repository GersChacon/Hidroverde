using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;

namespace Flujo
{
    public class RolFlujo : IRolFlujo
    {
        private readonly IRolDA _rolDA;
        public RolFlujo(IRolDA rolDA) => _rolDA = rolDA;

        public Task<int> Agregar(RolRequest rol) => _rolDA.Agregar(rol);
        public Task<int> Editar(int rolId, RolRequest rol) => _rolDA.Editar(rolId, rol);
        public Task<int> Eliminar(int rolId) => _rolDA.Eliminar(rolId);
        public Task<IEnumerable<RolResponse>> Obtener() => _rolDA.Obtener();
        public Task<RolResponse> Obtener(int rolId) => _rolDA.Obtener(rolId);
    }
}