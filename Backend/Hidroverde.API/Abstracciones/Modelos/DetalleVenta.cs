namespace Abstracciones.Modelos
{
    public class DetalleVentaRequest
    {
        public int InventarioId { get; set; }
        public int ProductoId { get; set; }
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        public decimal DescuentoUnitario { get; set; } // editable por línea
        public string? Notas { get; set; }
    }

    public class DetalleVentaResponse
    {
        public int DetalleId { get; set; }
        public int VentaId { get; set; }
        public int InventarioId { get; set; }
        public int ProductoId { get; set; }
        public string NombreProducto { get; set; }
        public string CodigoProducto { get; set; }
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        public decimal DescuentoUnitario { get; set; }
        public decimal Subtotal { get; set; } // columna calculada en DB
        public string? Notas { get; set; }
    }
}