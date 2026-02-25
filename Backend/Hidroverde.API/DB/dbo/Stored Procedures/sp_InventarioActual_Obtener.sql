CREATE   PROCEDURE [dbo].[sp_InventarioActual_Obtener]
    @inventario_id INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ia.inventario_id       AS InventarioId,
        ia.producto_id         AS ProductoId,
        ia.ubicacion_id        AS UbicacionId,
        ia.estado_calidad_id   AS EstadoCalidadId,
        ia.lote                AS Lote,
        ia.cantidad_disponible AS CantidadDisponible,
        ia.fecha_entrada       AS FechaEntrada,
        ia.fecha_caducidad     AS FechaCaducidad,
        ia.ciclo_origen_id     AS CicloOrigenId,
        ia.notas               AS Notas,
        ia.fecha_creacion      AS FechaCreacion,
        p.codigo               AS ProductoCodigo,
        p.nombre_producto      AS ProductoNombre
    FROM dbo.Inventario_Actual ia
    INNER JOIN dbo.Productos p ON p.producto_id = ia.producto_id
    WHERE ia.inventario_id = @inventario_id;
END