
namespace Abstracciones.Modelos
{
    public class UnidadMedidaBase
    {
        public string Codigo { get; set; }
        public string Nombre { get; set; }
        public string Simbolo { get; set; }
        public string Tipo { get; set; }
        public bool Activo { get; set; }
    }

    public class UnidadMedidaRequest : UnidadMedidaBase
    {
    }

    public class UnidadMedidaResponse : UnidadMedidaBase
    {
        public int UnidadId { get; set; }
    }
}