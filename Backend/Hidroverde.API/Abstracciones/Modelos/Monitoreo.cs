namespace Abstracciones.Modelos
{
    public class MonitoreoRegistrarRequest
    {
        public int CicloId { get; set; }
        public decimal? PhMedido { get; set; }
        public decimal? EcMedido { get; set; }
        public decimal? TemperaturaAgua { get; set; }
        public decimal? TemperaturaAmbiente { get; set; }
        public decimal? HumedadAmbiente { get; set; }
        public decimal? AlturaPromedioPlantas { get; set; }
        public string? Observaciones { get; set; }
    }

    public class MonitoreoResponse
    {
        public int MonitoreoId { get; set; }
        public int CicloId { get; set; }
        public int ResponsableId { get; set; }
        public string? ResponsableNombre { get; set; }
        public DateTime FechaRegistro { get; set; }
        public decimal? PhMedido { get; set; }
        public decimal? EcMedido { get; set; }
        public decimal? TemperaturaAgua { get; set; }
        public decimal? TemperaturaAmbiente { get; set; }
        public decimal? HumedadAmbiente { get; set; }
        public decimal? AlturaPromedioPlantas { get; set; }
        public string? Observaciones { get; set; }
    }
}
