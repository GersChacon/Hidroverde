
namespace Abstracciones.Modelos
{
    public class VariedadBase
    {
        public int CategoriaId { get; set; }
        public string NombreVariedad { get; set; }
        public string Descripcion { get; set; }
        public int DiasGerminacion { get; set; }
        public int DiasCosecha { get; set; }
        public decimal? TemperaturaMinima { get; set; }
        public decimal? TemperaturaMaxima { get; set; }
        public decimal? PhMinimo { get; set; }
        public decimal? PhMaximo { get; set; }
        public decimal? EcMinimo { get; set; }
        public decimal? EcMaximo { get; set; }
        public string InstruccionesEspeciales { get; set; }
        public bool Activa { get; set; }
    }

    public class VariedadRequest : VariedadBase
    {
    }

    public class VariedadResponse : VariedadBase
    {
        public int VariedadId { get; set; }
        public DateTime FechaCreacion { get; set; }
        public string CategoriaNombre { get; set; }
        public string TipoCultivoNombre { get; set; }
        public int TipoCultivoId { get; set; }
    }
}