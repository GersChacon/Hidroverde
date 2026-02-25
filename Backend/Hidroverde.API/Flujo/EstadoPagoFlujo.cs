using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;

namespace Flujo
{
    public class EstadoPagoFlujo : IEstadoPagoFlujo
    {
        private readonly IEstadoPagoDA _estadoPagoDA;
        public EstadoPagoFlujo(IEstadoPagoDA estadoPagoDA) => _estadoPagoDA = estadoPagoDA;

        public Task<int> Agregar(EstadoPagoRequest estadoPago) => _estadoPagoDA.Agregar(estadoPago);
        public Task<int> Editar(int estadoPagoId, EstadoPagoRequest estadoPago) => _estadoPagoDA.Editar(estadoPagoId, estadoPago);
        public Task<int> Eliminar(int estadoPagoId) => _estadoPagoDA.Eliminar(estadoPagoId);
        public Task<IEnumerable<EstadoPagoResponse>> Obtener() => _estadoPagoDA.Obtener();
        public Task<EstadoPagoResponse> Obtener(int estadoPagoId) => _estadoPagoDA.Obtener(estadoPagoId);
    }
}