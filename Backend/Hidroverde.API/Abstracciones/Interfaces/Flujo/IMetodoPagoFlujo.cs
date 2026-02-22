using Abstracciones.Modelos;

namespace Abstracciones.Interfaces.Flujo
{
    public interface IMetodoPagoFlujo
    {
        Task<IEnumerable<MetodoPagoResponse>> Obtener();
        Task<MetodoPagoResponse> Obtener(int metodoPagoId);
        Task<int> Agregar(MetodoPagoRequest metodoPago);
        Task<int> Editar(int metodoPagoId, MetodoPagoRequest metodoPago);
        Task<int> Eliminar(int metodoPagoId);
    }
}