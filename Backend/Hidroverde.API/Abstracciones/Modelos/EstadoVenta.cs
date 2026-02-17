namespace Abstracciones.Modelos
{
    public class EstadoVentaBase
    {
        public string Codigo { get; set; }
        public string Nombre { get; set; }
        public int? Orden { get; set; }
        public string? Color { get; set; }
        public bool PermiteModificacion { get; set; }
        public string? Descripcion { get; set; }
        public bool Activo { get; set; }
    }

    public class EstadoVentaRequest : EstadoVentaBase
    {
    }

    public class EstadoVentaResponse : EstadoVentaBase
    {
        public int EstadoVentaId { get; set; }
    }
}