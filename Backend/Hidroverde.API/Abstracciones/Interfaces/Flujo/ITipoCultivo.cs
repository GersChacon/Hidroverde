using Abstracciones.Modelos;

namespace Abstracciones.Interfaces.Flujo
{
    public interface ITipoCultivoFlujo
    {
        Task<IEnumerable<TipoCultivoResponse>> Obtener();
        Task<TipoCultivoResponse> Obtener(int tipoCultivoId);
        Task<int> Agregar(TipoCultivoRequest tipoCultivo);
        Task<int> Editar(int tipoCultivoId, TipoCultivoRequest tipoCultivo);
        Task<int> Eliminar(int tipoCultivoId);
    }
}