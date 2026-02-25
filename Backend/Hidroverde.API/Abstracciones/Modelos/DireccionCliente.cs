namespace Abstracciones.Modelos
{
    public class DireccionClienteBase
    {
        public int ClienteId { get; set; }
        public string? Alias { get; set; }
        public string DireccionExacta { get; set; }
        public string? Referencia { get; set; }
        public string? TelefonoContacto { get; set; }
        public bool Activa { get; set; }
        public string CodigoPostal { get; set; }
    }

    public class DireccionClienteRequest : DireccionClienteBase { }

    public class DireccionClienteResponse : DireccionClienteBase
    {
        public int DireccionId { get; set; }
        public DateTime FechaCreacion { get; set; }
        public string NombreCliente { get; set; }
    }
}