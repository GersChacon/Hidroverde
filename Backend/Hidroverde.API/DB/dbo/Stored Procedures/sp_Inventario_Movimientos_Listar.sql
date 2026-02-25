CREATE   PROCEDURE [dbo].[sp_Inventario_Movimientos_Listar]
    @inventario_id INT,
    @desde DATETIME2 = NULL,
    @hasta DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        m.movimiento_id         AS MovimientoId,
        m.inventario_id         AS InventarioId,
        m.producto_id           AS ProductoId,
        tm.codigo               AS TipoMovimientoCodigo,
        tm.nombre               AS TipoMovimientoNombre,
        m.ubicacion_origen_id   AS UbicacionOrigenId,
        m.ubicacion_destino_id  AS UbicacionDestinoId,
        m.cantidad              AS Cantidad,
        m.motivo                AS Motivo,
        m.usuario_id            AS UsuarioId,
        m.fecha_movimiento      AS FechaMovimiento
    FROM dbo.Movimientos_Inventario m
    INNER JOIN dbo.Tipos_Movimiento tm
        ON tm.tipo_movimiento_id = m.tipo_movimiento_id
    WHERE
        m.inventario_id = @inventario_id
        AND (@desde IS NULL OR m.fecha_movimiento >= @desde)
        AND (@hasta IS NULL OR m.fecha_movimiento < DATEADD(DAY, 1, @hasta))
    ORDER BY m.fecha_movimiento DESC, m.movimiento_id DESC;
END