using Abstracciones.Modelos;

namespace Abstracciones.Interfaces.DA
{
    public interface IEstadoVentaDA
    {
        Task<IEnumerable<EstadoVentaResponse>> Obtener();
        Task<EstadoVentaResponse> Obtener(int estadoVentaId);
        Task<int> Agregar(EstadoVentaRequest estadoVenta);
        Task<int> Editar(int estadoVentaId, EstadoVentaRequest estadoVenta);
        Task<int> Eliminar(int estadoVentaId);
    }
}