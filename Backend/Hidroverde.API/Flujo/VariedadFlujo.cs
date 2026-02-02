using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;

namespace Flujo
{
    public class VariedadFlujo : IVariedadFlujo
    {
        private readonly IVariedadDA _variedadDA;

        public VariedadFlujo(IVariedadDA variedadDA)
        {
            _variedadDA = variedadDA;
        }

        public Task<int> Agregar(VariedadRequest variedad)
        {
            return _variedadDA.Agregar(variedad);
        }

        public Task<int> Editar(int variedadId, VariedadRequest variedad)
        {
            return _variedadDA.Editar(variedadId, variedad);
        }

        public Task<int> Eliminar(int variedadId)
        {
            return _variedadDA.Eliminar(variedadId);
        }

        public Task<IEnumerable<VariedadResponse>> Obtener()
        {
            return _variedadDA.Obtener();
        }

        public Task<VariedadResponse> Obtener(int variedadId)
        {
            return _variedadDA.Obtener(variedadId);
        }
    }
}