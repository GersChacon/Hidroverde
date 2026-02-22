namespace Abstracciones.Modelos
{
    public class MetodoPagoBase
    {
        public string Codigo { get; set; }
        public string Nombre { get; set; }
        public bool RequiereConfirmacion { get; set; }
        public decimal ComisionPorcentaje { get; set; }
        public bool Activo { get; set; }
    }

    public class MetodoPagoRequest : MetodoPagoBase
    {
    }

    public class MetodoPagoResponse : MetodoPagoBase
    {
        public int MetodoPagoId { get; set; }
    }
}