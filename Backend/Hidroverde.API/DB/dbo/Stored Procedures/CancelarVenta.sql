CREATE PROCEDURE [dbo].[CancelarVenta]
    @venta_id INT,
    @motivo   NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION

            -- Validar que no esté ya cancelada
            DECLARE @estado_codigo NVARCHAR(30);
            SELECT @estado_codigo = ev.codigo
            FROM [dbo].[Ventas] v
            INNER JOIN [dbo].[Estados_Venta] ev ON v.estado_venta_id = ev.estado_venta_id
            WHERE v.venta_id = @venta_id;

            IF @estado_codigo = 'CANCELADA'
                THROW 51105, 'La venta ya está cancelada.', 1;

            -- Obtener estado CANCELADA
            DECLARE @estado_cancelada_id INT;
            SELECT @estado_cancelada_id = estado_venta_id
            FROM [dbo].[Estados_Venta] WHERE codigo = 'CANCELADA';

            -- Obtener tipo_movimiento_id para DEVOLUCION
            DECLARE @tipo_mov_id INT;
            SELECT TOP 1 @tipo_mov_id = tipo_movimiento_id
            FROM [dbo].[Tipos_Movimiento] WHERE codigo = 'DEVOLUCION' AND activo = 1;

            -- Devolver stock y registrar movimientos
            DECLARE @inv_id INT, @prod_id INT, @cant INT, @ubicacion_id INT;
            DECLARE @vendedor_id INT;
            SELECT @vendedor_id = vendedor_id FROM [dbo].[Ventas] WHERE venta_id = @venta_id;

            DECLARE cur CURSOR LOCAL FAST_FORWARD FOR
                SELECT inventario_id, producto_id, cantidad
                FROM [dbo].[Detalle_Ventas]
                WHERE venta_id = @venta_id;

            OPEN cur;
            FETCH NEXT FROM cur INTO @inv_id, @prod_id, @cant;

            WHILE @@FETCH_STATUS = 0
            BEGIN
                -- Devolver stock
                UPDATE [dbo].[Inventario_Actual]
                SET cantidad_disponible = cantidad_disponible + @cant
                WHERE inventario_id = @inv_id;

                SELECT @ubicacion_id = ubicacion_id FROM [dbo].[Inventario_Actual] WHERE inventario_id = @inv_id;

                -- Registrar movimiento de devolución
                INSERT INTO [dbo].[Movimientos_Inventario]
                    ([inventario_id],[producto_id],[tipo_movimiento_id],[ubicacion_destino_id],[cantidad],[motivo],[usuario_id])
                VALUES
                    (@inv_id, @prod_id, @tipo_mov_id, @ubicacion_id, @cant,
                     'Cancelacion venta #' + CAST(@venta_id AS NVARCHAR) + ': ' + @motivo,
                     @vendedor_id);

                FETCH NEXT FROM cur INTO @inv_id, @prod_id, @cant;
            END;

            CLOSE cur;
            DEALLOCATE cur;

            -- Cambiar estado de la venta
            UPDATE [dbo].[Ventas]
            SET estado_venta_id = @estado_cancelada_id,
                notas = ISNULL(notas + ' | ', '') + 'Cancelada: ' + @motivo
            WHERE venta_id = @venta_id;

            SELECT @venta_id AS venta_id;

        COMMIT TRANSACTION
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END