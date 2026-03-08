namespace Abstracciones.Modelos
{
    public class VentaRequest
    {
        public int ClienteId { get; set; }
        public int DireccionEntregaId { get; set; }
        public int VendedorId { get; set; }
        public int EstadoVentaId { get; set; }
        public int EstadoPagoId { get; set; }
        public int? MetodoPagoId { get; set; }
        public int TipoEntregaId { get; set; }
        public string? NumeroFactura { get; set; }
        public DateTime? FechaEntrega { get; set; }
        public decimal IvaMonto { get; set; }
        public string? Notas { get; set; }
        public List<DetalleVentaRequest> Detalle { get; set; } = new();
    }

    public class VentaResponse
    {
        public int VentaId { get; set; }
        public int ClienteId { get; set; }
        public string NombreCliente { get; set; }
        public int DireccionEntregaId { get; set; }
        public string DireccionEntrega { get; set; }
        public int VendedorId { get; set; }
        public string NombreVendedor { get; set; }
        public int EstadoVentaId { get; set; }
        public string NombreEstadoVenta { get; set; }
        public string ColorEstadoVenta { get; set; }
        public int EstadoPagoId { get; set; }
        public string NombreEstadoPago { get; set; }
        public int? MetodoPagoId { get; set; }
        public string? NombreMetodoPago { get; set; }
        public int TipoEntregaId { get; set; }
        public string NombreTipoEntrega { get; set; }
        public string CodigoTipoEntrega { get; set; }   // RECOGE / ENVIO / EXPRESS
        public int OrdenEstadoVenta { get; set; }        // para bloquear retroceso en frontend
        public string? NumeroFactura { get; set; }
        public DateTime FechaPedido { get; set; }
        public DateTime? FechaEntrega { get; set; }
        public decimal Subtotal { get; set; }
        public decimal IvaMonto { get; set; }
        public decimal Total { get; set; }
        public string? Notas { get; set; }
        public DateTime FechaCreacion { get; set; }
        public List<DetalleVentaResponse> Detalle { get; set; } = new();
    }

    public class VentaResumenResponse
    {
        public int VentaId { get; set; }
        public string NombreCliente { get; set; }
        public string NombreEstadoVenta { get; set; }
        public string ColorEstadoVenta { get; set; }
        public string NombreEstadoPago { get; set; }
        public string? NumeroFactura { get; set; }
        public DateTime FechaPedido { get; set; }
        public DateTime? FechaEntrega { get; set; }
        public decimal Total { get; set; }
    }

    public class VentaEstadoRequest
    {
        public int EstadoVentaId { get; set; }
        public string? Notas { get; set; }
    }

    public class VentaPagoRequest
    {
        public int EstadoPagoId { get; set; }
        public int MetodoPagoId { get; set; }
        public string? Notas { get; set; }
    }

    public class VentaCancelarRequest
    {
        public string Motivo { get; set; }
    }

    public class VentaAgregarDetalleRequest
    {
        public List<DetalleVentaRequest> Detalle { get; set; } = new();
    }
}