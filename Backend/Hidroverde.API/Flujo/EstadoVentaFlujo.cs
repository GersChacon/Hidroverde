using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;

namespace Flujo
{
    public class EstadoVentaFlujo : IEstadoVentaFlujo
    {
        private readonly IEstadoVentaDA _estadoVentaDA;

        public EstadoVentaFlujo(IEstadoVentaDA estadoVentaDA)
        {
            _estadoVentaDA = estadoVentaDA;
        }

        public Task<int> Agregar(EstadoVentaRequest estadoVenta)
        {
            return _estadoVentaDA.Agregar(estadoVenta);
        }

        public Task<int> Editar(int estadoVentaId, EstadoVentaRequest estadoVenta)
        {
            return _estadoVentaDA.Editar(estadoVentaId, estadoVenta);
        }

        public Task<int> Eliminar(int estadoVentaId)
        {
            return _estadoVentaDA.Eliminar(estadoVentaId);
        }

        public Task<IEnumerable<EstadoVentaResponse>> Obtener()
        {
            return _estadoVentaDA.Obtener();
        }

        public Task<EstadoVentaResponse> Obtener(int estadoVentaId)
        {
            return _estadoVentaDA.Obtener(estadoVentaId);
        }
    }
}