
CREATE   PROCEDURE [dbo].[sp_ComprasPlantasDetalle_ObtenerParaMerma]
    @producto_id    INT,
    @proveedor_id   INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        IF @producto_id IS NULL OR @producto_id <= 0
            RAISERROR('producto_id inválido.', 16, 1);

        IF @proveedor_id IS NULL OR @proveedor_id <= 0
            RAISERROR('proveedor_id inválido.', 16, 1);

        ;WITH CompraBase AS
        (
            SELECT TOP 1
                d.compra_detalle_id,
                d.producto_id,
                p.nombre_producto,
                c.proveedor_id,
                pr.nombre AS proveedor_nombre,
                d.cantidad_comprada
            FROM dbo.Compras_Plantas_Detalle d
            INNER JOIN dbo.Compras_Plantas c
                ON d.compra_id = c.compra_id
            INNER JOIN dbo.Productos p
                ON d.producto_id = p.producto_id
            INNER JOIN dbo.Proveedores pr
                ON c.proveedor_id = pr.proveedor_id
            WHERE d.producto_id = @producto_id
              AND c.proveedor_id = @proveedor_id
              AND c.activo = 1
            ORDER BY d.compra_detalle_id DESC
        )
        SELECT
            cb.compra_detalle_id AS compraDetalleId,
            cb.producto_id AS productoId,
            cb.nombre_producto AS nombreProducto,
            cb.proveedor_id AS proveedorId,
            cb.proveedor_nombre AS proveedorNombre,
            cb.cantidad_comprada AS cantidadComprada,
            ISNULL(SUM(m.cantidad_merma), 0) AS cantidadMermaActual,
            cb.cantidad_comprada - ISNULL(SUM(m.cantidad_merma), 0) AS cantidadDisponibleParaMerma
        FROM CompraBase cb
        LEFT JOIN dbo.Compras_Plantas_Merma m
            ON cb.compra_detalle_id = m.compra_detalle_id
        GROUP BY
            cb.compra_detalle_id,
            cb.producto_id,
            cb.nombre_producto,
            cb.proveedor_id,
            cb.proveedor_nombre,
            cb.cantidad_comprada;
    END TRY
    BEGIN CATCH
        DECLARE @msg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@msg, 16, 1);
    END CATCH
END