using Abstracciones.Modelos;

namespace Abstracciones.Interfaces.Flujo
{
    public interface IEstadoPagoFlujo
    {
        Task<IEnumerable<EstadoPagoResponse>> Obtener();
        Task<EstadoPagoResponse> Obtener(int estadoPagoId);
        Task<int> Agregar(EstadoPagoRequest estadoPago);
        Task<int> Editar(int estadoPagoId, EstadoPagoRequest estadoPago);
        Task<int> Eliminar(int estadoPagoId);
    }
}