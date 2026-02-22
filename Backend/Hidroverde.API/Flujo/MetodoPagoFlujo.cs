using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;

namespace Flujo
{
    public class MetodoPagoFlujo : IMetodoPagoFlujo
    {
        private readonly IMetodoPagoDA _metodoPagoDA;

        public MetodoPagoFlujo(IMetodoPagoDA metodoPagoDA)
        {
            _metodoPagoDA = metodoPagoDA;
        }

        public Task<int> Agregar(MetodoPagoRequest metodoPago) =>
            _metodoPagoDA.Agregar(metodoPago);

        public Task<int> Editar(int metodoPagoId, MetodoPagoRequest metodoPago) =>
            _metodoPagoDA.Editar(metodoPagoId, metodoPago);

        public Task<int> Eliminar(int metodoPagoId) =>
            _metodoPagoDA.Eliminar(metodoPagoId);

        public Task<IEnumerable<MetodoPagoResponse>> Obtener() =>
            _metodoPagoDA.Obtener();

        public Task<MetodoPagoResponse> Obtener(int metodoPagoId) =>
            _metodoPagoDA.Obtener(metodoPagoId);
    }
}