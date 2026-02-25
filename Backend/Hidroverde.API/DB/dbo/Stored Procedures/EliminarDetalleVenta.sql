CREATE PROCEDURE [dbo].[EliminarDetalleVenta]
    @venta_id   INT,
    @detalle_id INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION

            -- Validar que permite modificación
            IF NOT EXISTS (
                SELECT 1
                FROM [dbo].[Ventas] v
                INNER JOIN [dbo].[Estados_Venta] ev ON v.estado_venta_id = ev.estado_venta_id
                WHERE v.venta_id = @venta_id AND ev.permite_modificacion = 1
            )
                THROW 51104, 'La venta no permite modificación en su estado actual.', 1;

            -- No se puede dejar la venta sin productos
            IF (SELECT COUNT(*) FROM [dbo].[Detalle_Ventas] WHERE venta_id = @venta_id) <= 1
                THROW 51106, 'No se puede eliminar el ultimo producto de la venta.', 1;

            -- Recuperar datos del detalle antes de eliminar
            DECLARE @inv_id INT, @prod_id INT, @cant INT, @ubicacion_id INT, @vendedor_id INT;

            SELECT @inv_id = inventario_id, @prod_id = producto_id, @cant = cantidad
            FROM [dbo].[Detalle_Ventas]
            WHERE detalle_id = @detalle_id AND venta_id = @venta_id;

            SELECT @vendedor_id = vendedor_id FROM [dbo].[Ventas] WHERE venta_id = @venta_id;
            SELECT @ubicacion_id = ubicacion_id FROM [dbo].[Inventario_Actual] WHERE inventario_id = @inv_id;

            -- Eliminar línea
            DELETE FROM [dbo].[Detalle_Ventas]
            WHERE detalle_id = @detalle_id AND venta_id = @venta_id;

            -- Devolver stock
            UPDATE [dbo].[Inventario_Actual]
            SET cantidad_disponible = cantidad_disponible + @cant
            WHERE inventario_id = @inv_id;

            -- Registrar movimiento de devolución parcial
            DECLARE @tipo_mov_id INT;
            SELECT TOP 1 @tipo_mov_id = tipo_movimiento_id
            FROM [dbo].[Tipos_Movimiento] WHERE codigo = 'DEVOLUCION' AND activo = 1;

            INSERT INTO [dbo].[Movimientos_Inventario]
                ([inventario_id],[producto_id],[tipo_movimiento_id],[ubicacion_destino_id],[cantidad],[motivo],[usuario_id])
            VALUES
                (@inv_id, @prod_id, @tipo_mov_id, @ubicacion_id, @cant,
                 'Linea eliminada de venta #' + CAST(@venta_id AS NVARCHAR), @vendedor_id);

            -- Recalcular totales
            UPDATE [dbo].[Ventas]
            SET subtotal = (
                    SELECT SUM(cantidad * (precio_unitario - descuento_unitario))
                    FROM [dbo].[Detalle_Ventas] WHERE venta_id = @venta_id
                ),
                total = subtotal + iva_monto
            WHERE venta_id = @venta_id;

            SELECT @detalle_id AS detalle_id;

        COMMIT TRANSACTION
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END