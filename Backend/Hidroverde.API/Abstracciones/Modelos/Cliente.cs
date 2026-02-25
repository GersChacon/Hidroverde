namespace Abstracciones.Modelos
{
    public class ClienteBase
    {
        public int TipoClienteId { get; set; }
        public string? CedulaRuc { get; set; }
        public string Nombre { get; set; }
        public string? Apellidos { get; set; }
        public string Telefono { get; set; }
        public string Email { get; set; }
        public string? Notas { get; set; }
        public bool Activo { get; set; }
    }

    public class ClienteRequest : ClienteBase { }

    public class ClienteResponse : ClienteBase
    {
        public int ClienteId { get; set; }
        public DateTime FechaRegistro { get; set; }
        public DateTime FechaCreacion { get; set; }
        public string NombreTipoCliente { get; set; }
        public decimal DescuentoDefault { get; set; }
    }
}