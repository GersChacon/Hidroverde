
namespace Abstracciones.Modelos
{
    public class CategoriaBase
    {
        public int TipoCultivoId { get; set; }
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
        public bool RequiereSeguimiento { get; set; }
        public bool Activa { get; set; }
    }

    public class CategoriaRequest : CategoriaBase
    {
    }

    public class CategoriaResponse : CategoriaBase
    {
        public int CategoriaId { get; set; }
        public DateTime FechaCreacion { get; set; }
        public string TipoCultivoNombre { get; set; }
    }
}