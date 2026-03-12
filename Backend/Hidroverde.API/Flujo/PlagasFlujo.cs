using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos.Plagas;

namespace Flujo
{
    public class PlagasFlujo : IPlagasFlujo
    {
        private readonly IPlagasDA _da;

        public PlagasFlujo(IPlagasDA da)
        {
            _da = da;
        }

        public Task<IEnumerable<PlagaCatalogoDto>> CatalogoListar()
            => _da.CatalogoListar();

        public Task<int> Registrar(int usuarioId, PlagaRegistrarRequest request)
            => _da.Registrar(usuarioId, request);

        public Task<IEnumerable<PlagaRegistroDto>> Listar(DateTime? fechaDesde, DateTime? fechaHasta, int? plagaId)
            => _da.Listar(fechaDesde, fechaHasta, plagaId);

        public Task<IEnumerable<PlagaGraficaItemDto>> Grafica(DateTime? fechaDesde, DateTime? fechaHasta, int? plagaId, string agrupacion)
            => _da.Grafica(fechaDesde, fechaHasta, plagaId, agrupacion);
    }
}