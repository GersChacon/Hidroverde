namespace Abstracciones.Modelos
{
    public class TorreDto
    {
        public int TorreId { get; set; }
        public int UbicacionId { get; set; }
        public string CodigoTorre { get; set; } = "";
        public string Fila { get; set; } = "";
        public int TipoCultivoId { get; set; }
        public int CapacidadMaximaPlantas { get; set; }
        public bool Activo { get; set; }
        public int PlantasOcupadas { get; set; }
        public int HuecosDisponibles { get; set; }
    }
}