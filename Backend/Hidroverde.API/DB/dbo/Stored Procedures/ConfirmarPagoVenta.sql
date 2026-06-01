CREATE PROCEDURE [dbo].[ConfirmarPagoVenta]
    @venta_id       INT,
    @estado_pago_id INT,
    @metodo_pago_id INT = NULL,            -- solo se usa si la venta aún no tiene método (no se sobreescribe)
    @notas          NVARCHAR(MAX) = NULL   -- IGNORADO (no se exponen notas)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION

            IF NOT EXISTS (SELECT 1 FROM [dbo].[Ventas] WHERE venta_id = @venta_id)
                THROW 51110, 'La venta no existe.', 1;

            -- Estado de pago ACTUAL
            DECLARE @cod_actual NVARCHAR(30), @pago_actual_ok BIT;
            SELECT @cod_actual = ep.codigo, @pago_actual_ok = ep.permite_entrega
            FROM [dbo].[Ventas] v
            INNER JOIN [dbo].[Estados_Pago] ep ON v.estado_pago_id = ep.estado_pago_id
            WHERE v.venta_id = @venta_id;

            -- Estados de pago TERMINALES: pagado (permite_entrega=1), anulado y vencido. No admiten cambios.
            IF ISNULL(@pago_actual_ok, 0) = 1
                THROW 51110, 'El pago ya está confirmado como PAGADO y no puede modificarse.', 1;
            IF @cod_actual IN ('ANULADO', 'VENCIDO')
                THROW 51110, 'El pago está en un estado terminal (anulado/vencido) y no puede modificarse.', 1;

            -- Estado de pago DESTINO
            IF NOT EXISTS (SELECT 1 FROM [dbo].[Estados_Pago] WHERE estado_pago_id = @estado_pago_id AND activo = 1)
                THROW 51110, 'El estado de pago indicado no es válido.', 1;

            DECLARE @cod_destino NVARCHAR(30), @destino_ok BIT;
            SELECT @cod_destino = codigo, @destino_ok = permite_entrega
            FROM [dbo].[Estados_Pago] WHERE estado_pago_id = @estado_pago_id;

            -- Actualizar estado de pago. El método de pago se fija al crear la venta:
            -- aquí solo se completa si estuviera vacío, nunca se reemplaza.
            UPDATE [dbo].[Ventas]
            SET estado_pago_id = @estado_pago_id,
                metodo_pago_id = COALESCE(metodo_pago_id, @metodo_pago_id)
            WHERE venta_id = @venta_id;

            -- CASO A: pago confirmado (PAGADO) -> generar número de factura si no existe.
            IF @destino_ok = 1
            BEGIN
                UPDATE [dbo].[Ventas]
                SET numero_factura = 'FAC-' + CAST(YEAR(SYSDATETIME()) AS NVARCHAR(4)) + '-'
                                     + RIGHT('000000' + CAST(@venta_id AS NVARCHAR(10)), 6)
                WHERE venta_id = @venta_id AND numero_factura IS NULL;
            END

            -- CASO B: pago anulado o vencido -> cancelar la venta y devolver el inventario.
            IF @cod_destino IN ('ANULADO', 'VENCIDO')
            BEGIN
                DECLARE @estado_cancelado_id INT;
                SELECT @estado_cancelado_id = estado_venta_id FROM [dbo].[Estados_Venta] WHERE codigo = 'CANCELADO';

                DECLARE @venta_estado NVARCHAR(30);
                SELECT @venta_estado = ev.codigo
                FROM [dbo].[Ventas] v
                INNER JOIN [dbo].[Estados_Venta] ev ON v.estado_venta_id = ev.estado_venta_id
                WHERE v.venta_id = @venta_id;

                IF @estado_cancelado_id IS NOT NULL AND @venta_estado <> 'CANCELADO'
                BEGIN
                    DECLARE @tipo_mov_id INT;
                    SELECT TOP 1 @tipo_mov_id = tipo_movimiento_id
                    FROM [dbo].[Tipos_Movimiento] WHERE codigo = 'DEVOLUCION' AND activo = 1;

                    DECLARE @vendedor_id INT;
                    SELECT @vendedor_id = vendedor_id FROM [dbo].[Ventas] WHERE venta_id = @venta_id;

                    DECLARE @inv_id INT, @prod_id INT, @cant INT, @ubic_id INT;
                    DECLARE cur CURSOR LOCAL FAST_FORWARD FOR
                        SELECT inventario_id, producto_id, cantidad FROM [dbo].[Detalle_Ventas] WHERE venta_id = @venta_id;
                    OPEN cur;
                    FETCH NEXT FROM cur INTO @inv_id, @prod_id, @cant;
                    WHILE @@FETCH_STATUS = 0
                    BEGIN
                        UPDATE [dbo].[Inventario_Actual]
                        SET cantidad_disponible = cantidad_disponible + @cant
                        WHERE inventario_id = @inv_id;

                        SELECT @ubic_id = ubicacion_id FROM [dbo].[Inventario_Actual] WHERE inventario_id = @inv_id;

                        IF @tipo_mov_id IS NOT NULL
                            INSERT INTO [dbo].[Movimientos_Inventario]
                                ([inventario_id],[producto_id],[tipo_movimiento_id],[ubicacion_destino_id],[cantidad],[motivo],[usuario_id])
                            VALUES
                                (@inv_id, @prod_id, @tipo_mov_id, @ubic_id, @cant,
                                 'Pago ' + @cod_destino + ' venta #' + CAST(@venta_id AS NVARCHAR), @vendedor_id);

                        FETCH NEXT FROM cur INTO @inv_id, @prod_id, @cant;
                    END;
                    CLOSE cur; DEALLOCATE cur;

                    UPDATE [dbo].[Ventas] SET estado_venta_id = @estado_cancelado_id WHERE venta_id = @venta_id;
                END
            END

            SELECT @venta_id AS venta_id;

        COMMIT TRANSACTION
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
