CREATE PROCEDURE [dbo].[ObtenerVenta]
    @venta_id INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Query 1: cabecera
    SELECT
        v.*,
        c.nombre + ISNULL(' ' + c.apellidos, '')   AS nombre_cliente,
        dc.direccion_exacta                          AS direccion_entrega,
        e.nombre + ' ' + e.apellidos                AS nombre_vendedor,
        ev.nombre   AS nombre_estado_venta,
        ev.color    AS color_estado_venta,
        ep.nombre   AS nombre_estado_pago,
        mp.nombre   AS nombre_metodo_pago,
        te.nombre   AS nombre_tipo_entrega
    FROM [dbo].[Ventas] v
    INNER JOIN [dbo].[Clientes]              c  ON v.cliente_id          = c.cliente_id
    INNER JOIN [dbo].[Direcciones_Clientes]  dc ON v.direccion_entrega_id = dc.direccion_id
    INNER JOIN [dbo].[Empleados]             e  ON v.vendedor_id          = e.empleado_id
    INNER JOIN [dbo].[Estados_Venta]         ev ON v.estado_venta_id      = ev.estado_venta_id
    INNER JOIN [dbo].[Estados_Pago]          ep ON v.estado_pago_id       = ep.estado_pago_id
    LEFT  JOIN [dbo].[Metodos_Pago]          mp ON v.metodo_pago_id       = mp.metodo_pago_id
    INNER JOIN [dbo].[Tipos_Entrega]         te ON v.tipo_entrega_id      = te.tipo_entrega_id
    WHERE v.venta_id = @venta_id

    -- Query 2: detalle
    SELECT
        dv.*,
        p.nombre_producto,
        p.codigo AS codigo_producto
    FROM [dbo].[Detalle_Ventas] dv
    INNER JOIN [dbo].[Productos] p ON dv.producto_id = p.producto_id
    WHERE dv.venta_id = @venta_id
END