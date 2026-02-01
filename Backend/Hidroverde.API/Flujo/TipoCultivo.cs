using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;

namespace Flujo
{
    public class TipoCultivoFlujo : ITipoCultivoFlujo
    {
        private readonly ITipoCultivoDA _tipoCultivoDA;

        public TipoCultivoFlujo(ITipoCultivoDA tipoCultivoDA)
        {
            _tipoCultivoDA = tipoCultivoDA;
        }

        public Task<int> Agregar(TipoCultivoRequest tipoCultivo)
        {
            return _tipoCultivoDA.Agregar(tipoCultivo);
        }

        public Task<int> Editar(int tipoCultivoId, TipoCultivoRequest tipoCultivo)
        {
            return _tipoCultivoDA.Editar(tipoCultivoId, tipoCultivo);
        }

        public Task<int> Eliminar(int tipoCultivoId)
        {
            return _tipoCultivoDA.Eliminar(tipoCultivoId);
        }

        public Task<IEnumerable<TipoCultivoResponse>> Obtener()
        {
            return _tipoCultivoDA.Obtener();
        }

        public Task<TipoCultivoResponse> Obtener(int tipoCultivoId)
        {
            return _tipoCultivoDA.Obtener(tipoCultivoId);
        }
    }
}