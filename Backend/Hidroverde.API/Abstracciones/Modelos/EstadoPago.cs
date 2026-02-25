namespace Abstracciones.Modelos
{
    public class EstadoPagoBase
    {
        public string Codigo { get; set; }
        public string Nombre { get; set; }
        public bool PermiteEntrega { get; set; }
        public string? Color { get; set; }
        public string? Descripcion { get; set; }
        public bool Activo { get; set; }
    }

    public class EstadoPagoRequest : EstadoPagoBase { }

    public class EstadoPagoResponse : EstadoPagoBase
    {
        public int EstadoPagoId { get; set; }
    }
}