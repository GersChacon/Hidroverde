CREATE PROCEDURE [dbo].[AgregarDetalleVenta]
    @venta_id INT,
    @detalle  TVP_DetalleVenta READONLY
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

            -- Validar stock
            IF EXISTS (
                SELECT 1
                FROM @detalle d
                INNER JOIN [dbo].[Inventario_Actual] i ON d.inventario_id = i.inventario_id
                WHERE i.cantidad_disponible < d.cantidad
            )
                THROW 51102, 'Stock insuficiente para uno o más productos.', 1;

            DECLARE @vendedor_id INT;
            SELECT @vendedor_id = vendedor_id FROM [dbo].[Ventas] WHERE venta_id = @venta_id;

            DECLARE @tipo_mov_id INT;
            SELECT TOP 1 @tipo_mov_id = tipo_movimiento_id
            FROM [dbo].[Tipos_Movimiento] WHERE codigo = 'VENTA' AND activo = 1;

            DECLARE @inv_id INT, @prod_id INT, @cant INT,
                    @precio DECIMAL(10,2), @desc DECIMAL(10,2), @nota NVARCHAR(MAX), @ubicacion_id INT;

            DECLARE cur CURSOR LOCAL FAST_FORWARD FOR
                SELECT inventario_id, producto_id, cantidad, precio_unitario, descuento_unitario, notas
                FROM @detalle;

            OPEN cur;
            FETCH NEXT FROM cur INTO @inv_id, @prod_id, @cant, @precio, @desc, @nota;

            WHILE @@FETCH_STATUS = 0
            BEGIN
                INSERT INTO [dbo].[Detalle_Ventas]
                    ([venta_id],[inventario_id],[producto_id],[cantidad],[precio_unitario],[descuento_unitario],[notas])
                VALUES (@venta_id, @inv_id, @prod_id, @cant, @precio, @desc, @nota);

                UPDATE [dbo].[Inventario_Actual]
                SET cantidad_disponible = cantidad_disponible - @cant
                WHERE inventario_id = @inv_id;

                SELECT @ubicacion_id = ubicacion_id FROM [dbo].[Inventario_Actual] WHERE inventario_id = @inv_id;

                INSERT INTO [dbo].[Movimientos_Inventario]
                    ([inventario_id],[producto_id],[tipo_movimiento_id],[ubicacion_origen_id],[cantidad],[motivo],[usuario_id])
                VALUES
                    (@inv_id, @prod_id, @tipo_mov_id, @ubicacion_id, @cant,
                     'Detalle agregado venta #' + CAST(@venta_id AS NVARCHAR), @vendedor_id);

                FETCH NEXT FROM cur INTO @inv_id, @prod_id, @cant, @precio, @desc, @nota;
            END;

            CLOSE cur;
            DEALLOCATE cur;

            -- Recalcular totales
            UPDATE [dbo].[Ventas]
            SET subtotal = (
                    SELECT SUM(cantidad * (precio_unitario - descuento_unitario))
                    FROM [dbo].[Detalle_Ventas] WHERE venta_id = @venta_id
                ),
                total = subtotal + iva_monto
            WHERE venta_id = @venta_id;

            SELECT @venta_id AS venta_id;

        COMMIT TRANSACTION
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END