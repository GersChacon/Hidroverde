CREATE PROCEDURE [dbo].[CrearVenta]
    @cliente_id          INT,
    @direccion_entrega_id INT,
    @vendedor_id         INT,
    @estado_venta_id     INT,
    @estado_pago_id      INT,
    @metodo_pago_id      INT = NULL,
    @tipo_entrega_id     INT,
    @numero_factura      NVARCHAR(100) = NULL,
    @fecha_entrega       DATETIME2(0)  = NULL,
    @iva_monto           DECIMAL(10,2) = 0,
    @notas               NVARCHAR(MAX) = NULL,
    @detalle             TVP_DetalleVenta READONLY
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION

            -- 1. Validar cliente activo
            IF NOT EXISTS (SELECT 1 FROM [dbo].[Clientes] WHERE cliente_id = @cliente_id AND activo = 1)
                THROW 51100, 'Cliente no encontrado o inactivo.', 1;

            -- 2. Validar que la dirección pertenece al cliente
            IF NOT EXISTS (
                SELECT 1 FROM [dbo].[Direcciones_Clientes]
                WHERE direccion_id = @direccion_entrega_id
                  AND cliente_id   = @cliente_id
                  AND activa       = 1
            )
                THROW 51101, 'La dirección no pertenece al cliente o está inactiva.', 1;

            -- 3. Validar stock y productos activos por cada línea
            IF EXISTS (
                SELECT 1
                FROM @detalle d
                INNER JOIN [dbo].[Inventario_Actual] i ON d.inventario_id = i.inventario_id
                WHERE i.cantidad_disponible < d.cantidad
            )
                THROW 51102, 'Stock insuficiente para uno o más productos.', 1;

            IF EXISTS (
                SELECT 1
                FROM @detalle d
                LEFT JOIN [dbo].[Productos] p ON d.producto_id = p.producto_id
                WHERE p.producto_id IS NULL OR p.activo = 0
            )
                THROW 51103, 'Uno o más productos no existen o están inactivos.', 1;

            -- 4. Calcular subtotal desde el detalle
            DECLARE @subtotal DECIMAL(10,2) = (
                SELECT SUM(cantidad * (precio_unitario - descuento_unitario))
                FROM @detalle
            );
            DECLARE @total DECIMAL(10,2) = @subtotal + @iva_monto;

            -- 5. Insertar cabecera de venta
            INSERT INTO [dbo].[Ventas] (
                [cliente_id],[direccion_entrega_id],[vendedor_id],[estado_venta_id],
                [estado_pago_id],[metodo_pago_id],[tipo_entrega_id],[numero_factura],
                [fecha_entrega],[subtotal],[iva_monto],[total],[notas]
            )
            VALUES (
                @cliente_id, @direccion_entrega_id, @vendedor_id, @estado_venta_id,
                @estado_pago_id, @metodo_pago_id, @tipo_entrega_id, @numero_factura,
                @fecha_entrega, @subtotal, @iva_monto, @total, @notas
            );

            DECLARE @venta_id INT = SCOPE_IDENTITY();

            -- 6. Insertar detalle + descontar inventario + registrar movimiento
            DECLARE @inv_id INT, @prod_id INT, @cant INT,
                    @precio DECIMAL(10,2), @desc DECIMAL(10,2), @nota NVARCHAR(MAX);

            DECLARE cur CURSOR LOCAL FAST_FORWARD FOR
                SELECT inventario_id, producto_id, cantidad, precio_unitario, descuento_unitario, notas
                FROM @detalle;

            OPEN cur;
            FETCH NEXT FROM cur INTO @inv_id, @prod_id, @cant, @precio, @desc, @nota;

            WHILE @@FETCH_STATUS = 0
            BEGIN
                -- Insertar línea de detalle
                INSERT INTO [dbo].[Detalle_Ventas]
                    ([venta_id],[inventario_id],[producto_id],[cantidad],[precio_unitario],[descuento_unitario],[notas])
                VALUES
                    (@venta_id, @inv_id, @prod_id, @cant, @precio, @desc, @nota);

                -- Descontar inventario
                UPDATE [dbo].[Inventario_Actual]
                SET cantidad_disponible = cantidad_disponible - @cant
                WHERE inventario_id = @inv_id;

                -- Obtener tipo_movimiento_id para VENTA (ajustar según tus datos)
                DECLARE @tipo_mov_id INT;
                SELECT TOP 1 @tipo_mov_id = tipo_movimiento_id
                FROM [dbo].[Tipos_Movimiento]
                WHERE codigo = 'VENTA' AND activo = 1;

                -- Obtener ubicacion del inventario
                DECLARE @ubicacion_id INT;
                SELECT @ubicacion_id = ubicacion_id FROM [dbo].[Inventario_Actual] WHERE inventario_id = @inv_id;

                -- Registrar movimiento
                INSERT INTO [dbo].[Movimientos_Inventario]
                    ([inventario_id],[producto_id],[tipo_movimiento_id],[ubicacion_origen_id],[cantidad],[motivo],[usuario_id])
                VALUES
                    (@inv_id, @prod_id, @tipo_mov_id, @ubicacion_id, @cant,
                     'Venta #' + CAST(@venta_id AS NVARCHAR), @vendedor_id);

                FETCH NEXT FROM cur INTO @inv_id, @prod_id, @cant, @precio, @desc, @nota;
            END;

            CLOSE cur;
            DEALLOCATE cur;

            SELECT @venta_id AS venta_id;

        COMMIT TRANSACTION
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END