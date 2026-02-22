namespace Abstracciones.Modelos
{
    public class TipoClienteBase
    {
        public string Codigo { get; set; }
        public string Nombre { get; set; }
        public string? Descripcion { get; set; }
        public decimal DescuentoDefault { get; set; }
        public bool Activo { get; set; }
    }

    public class TipoClienteRequest : TipoClienteBase { }

    public class TipoClienteResponse : TipoClienteBase
    {
        public int TipoClienteId { get; set; }
    }
}