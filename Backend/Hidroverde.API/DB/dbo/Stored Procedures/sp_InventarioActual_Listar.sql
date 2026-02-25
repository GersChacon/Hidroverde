CREATE   PROCEDURE [dbo].[sp_InventarioActual_Listar]
    @ciclo_origen_id INT = NULL,
    @producto_id INT = NULL,
    @lote NVARCHAR(100) = NULL,
    @solo_disponibles BIT = 1
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
    WHERE
        (@ciclo_origen_id IS NULL OR ia.ciclo_origen_id = @ciclo_origen_id)
        AND (@producto_id IS NULL OR ia.producto_id = @producto_id)
        AND (@lote IS NULL OR ia.lote LIKE '%' + @lote + '%')
        AND (@solo_disponibles = 0 OR ia.cantidad_disponible > 0)
    ORDER BY ia.fecha_creacion DESC, ia.inventario_id DESC;
END