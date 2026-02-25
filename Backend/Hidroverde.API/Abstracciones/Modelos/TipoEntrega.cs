namespace Abstracciones.Modelos
{
    public class TipoEntregaBase
    {
        public string Codigo { get; set; }
        public string Nombre { get; set; }
        public decimal CostoDefault { get; set; }
        public string? Descripcion { get; set; }
        public bool Activo { get; set; }
    }

    public class TipoEntregaRequest : TipoEntregaBase
    {
    }

    public class TipoEntregaResponse : TipoEntregaBase
    {
        public int TipoEntregaId { get; set; }

        public string CostoFormateado => CostoDefault.ToString("C2");
    }
}