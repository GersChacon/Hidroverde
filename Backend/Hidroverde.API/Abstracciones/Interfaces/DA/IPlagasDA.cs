using Abstracciones.Modelos.Plagas;

namespace Abstracciones.Interfaces.DA
{
    public interface IPlagasDA
    {
        Task<IEnumerable<PlagaCatalogoDto>> CatalogoListar();
        Task<int> Registrar(int usuarioId, PlagaRegistrarRequest request);
        Task<IEnumerable<PlagaRegistroDto>> Listar(DateTime? fechaDesde, DateTime? fechaHasta, int? plagaId);

        Task<IEnumerable<PlagaGraficaItemDto>> Grafica(
            DateTime? fechaDesde,
            DateTime? fechaHasta,
            int? plagaId,
            string agrupacion);
    }
}