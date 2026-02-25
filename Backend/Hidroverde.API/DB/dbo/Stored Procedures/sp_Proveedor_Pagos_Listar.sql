CREATE   PROCEDURE dbo.sp_Proveedor_Pagos_Listar
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        pp.pago_id       AS PagoId,
        pp.proveedor_id  AS ProveedorId,
        p.nombre         AS Nombre,
        pp.monto_pago    AS MontoPago,
        pp.saldo_antes   AS SaldoAntes,
        pp.saldo_despues AS SaldoDespues,
        pp.estado_pago   AS EstadoPago,
        pp.fecha_pago    AS FechaPago,
        pp.usuario_id    AS UsuarioId,
        pp.comentario    AS Comentario
    FROM dbo.Proveedores_Pagos pp
    INNER JOIN dbo.Proveedores p ON p.proveedor_id = pp.proveedor_id
    ORDER BY pp.fecha_pago DESC, pp.pago_id DESC;
END