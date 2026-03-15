namespace Abstracciones.Modelos
{


    public class ProductoRequest : ProductoBase
    {
    }

    public class ProductoBase
    {
        public string Codigo { get; set; } = string.Empty;
        public int VariedadId { get; set; }
        public string NombreProducto { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public decimal PrecioBase { get; set; }
        public int DiasCaducidad { get; set; }
        public bool RequiereRefrigeracion { get; set; }
        public string? ImagenUrl { get; set; }
        public bool Activo { get; set; }
        public int? StockMinimo { get; set; }
        public decimal PesoGramos { get; set; }
    }

    public class ProductoResponse : ProductoBase
    {
        public int ProductoId { get; set; }
        public DateTime FechaCreacion { get; set; }
        public string NombreVariedad { get; set; } = string.Empty;
        public int DiasGerminacion { get; set; }
        public int DiasCosecha { get; set; }
        public string CategoriaNombre { get; set; } = string.Empty;
        public string TipoCultivoNombre { get; set; } = string.Empty;
        public decimal PrecioPorKilo => PesoGramos > 0 ? PrecioBase / (PesoGramos / 1000m) : 0;
        public string PesoFormateado => PesoGramos >= 1000
            ? $"{PesoGramos / 1000:0.##} kg"
            : $"{PesoGramos:0} g";
    }
}