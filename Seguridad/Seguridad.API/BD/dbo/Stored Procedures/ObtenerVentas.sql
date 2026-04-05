CREATE PROCEDURE [dbo].[ObtenerVentas]
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        v.venta_id,
        c.nombre + ISNULL(' ' + c.apellidos, '') AS nombre_cliente,
        ev.nombre AS nombre_estado_venta,
        ev.color  AS color_estado_venta,
        ep.nombre AS nombre_estado_pago,
        v.numero_factura,
        v.fecha_pedido,
        v.fecha_entrega,
        v.total
    FROM [dbo].[Ventas] v
    INNER JOIN [dbo].[Clientes]       c  ON v.cliente_id       = c.cliente_id
    INNER JOIN [dbo].[Estados_Venta]  ev ON v.estado_venta_id  = ev.estado_venta_id
    INNER JOIN [dbo].[Estados_Pago]   ep ON v.estado_pago_id   = ep.estado_pago_id
    ORDER BY v.fecha_pedido DESC
END