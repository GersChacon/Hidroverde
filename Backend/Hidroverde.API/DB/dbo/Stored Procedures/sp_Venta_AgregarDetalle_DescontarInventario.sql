

CREATE   PROCEDURE [dbo].[sp_Venta_AgregarDetalle_DescontarInventario]
    @venta_id INT,
    @inventario_id INT,
    @cantidad INT,
    @precio_unitario DECIMAL(10,2),
    @descuento_unitario DECIMAL(10,2) = 0.00,
    @usuario_id INT,
    @motivo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @cantidad IS NULL OR @cantidad <= 0
        THROW 53001, 'La cantidad debe ser mayor a 0.', 1;

    IF @precio_unitario IS NULL OR @precio_unitario < 0
        THROW 53002, 'El precio_unitario no puede ser negativo.', 1;

    IF @descuento_unitario IS NULL OR @descuento_unitario < 0
        THROW 53003, 'El descuento_unitario no puede ser negativo.', 1;

    IF @descuento_unitario > @precio_unitario
        THROW 53004, 'El descuento_unitario no puede ser mayor al precio_unitario.', 1;

    BEGIN TRY
        BEGIN TRAN;

        -- Validar venta existe
        IF NOT EXISTS (SELECT 1 FROM dbo.Ventas WHERE venta_id = @venta_id)
            THROW 53005, 'La venta no existe.', 1;

        -- Tomar inventario y bloquear fila para evitar doble descuento concurrente
        DECLARE @producto_id INT, @ubicacion_id INT, @stock INT;

        SELECT
            @producto_id = ia.producto_id,
            @ubicacion_id = ia.ubicacion_id,
            @stock = ia.cantidad_disponible
        FROM dbo.Inventario_Actual ia WITH (UPDLOCK, ROWLOCK)
        WHERE ia.inventario_id = @inventario_id;

        IF @producto_id IS NULL
            THROW 53006, 'Inventario no existe.', 1;

        IF @stock < @cantidad
            THROW 53007, 'Stock insuficiente para completar la salida.', 1;

        -- Descontar inventario
        UPDATE dbo.Inventario_Actual
        SET cantidad_disponible = cantidad_disponible - @cantidad
        WHERE inventario_id = @inventario_id;

        -- Insertar detalle
        INSERT INTO dbo.Detalle_Ventas
        (
            venta_id, inventario_id, producto_id,
            cantidad, precio_unitario, descuento_unitario
        )
        VALUES
        (
            @venta_id, @inventario_id, @producto_id,
            @cantidad, @precio_unitario, @descuento_unitario
        );

        DECLARE @detalle_id INT = SCOPE_IDENTITY();

        -- Movimiento SALIDA
        DECLARE @tipo_salida_id INT =
            (SELECT tipo_movimiento_id FROM dbo.Tipos_Movimiento WHERE codigo = N'SALIDA' AND activo = 1);

        IF @tipo_salida_id IS NULL
            THROW 53008, 'No existe tipo movimiento SALIDA.', 1;

        INSERT INTO dbo.Movimientos_Inventario
        (
            inventario_id, producto_id, tipo_movimiento_id,
            ubicacion_origen_id, cantidad,
            motivo, usuario_id
        )
        VALUES
        (
            @inventario_id, @producto_id, @tipo_salida_id,
            @ubicacion_id, @cantidad,
            ISNULL(@motivo, N'Salida por venta ' + CAST(@venta_id AS NVARCHAR(20))),
            @usuario_id
        );

        -- Recalcular totales del encabezado (simple)
        DECLARE @subtotal DECIMAL(10,2) =
        (
            SELECT ISNULL(SUM(CAST(subtotal AS DECIMAL(10,2))), 0.00)
            FROM dbo.Detalle_Ventas
            WHERE venta_id = @venta_id
        );

        -- IVA desde config si existe, si no 13
        DECLARE @iva_porcentaje DECIMAL(10,2) = 13.00;
        SELECT @iva_porcentaje = TRY_CAST(valor AS DECIMAL(10,2))
        FROM dbo.Config_Sistema
        WHERE clave = N'iva_porcentaje' AND activo = 1;

        DECLARE @iva_monto DECIMAL(10,2) = ROUND(@subtotal * (@iva_porcentaje/100.0), 2);
        DECLARE @total DECIMAL(10,2) = @subtotal + @iva_monto;

        UPDATE dbo.Ventas
        SET subtotal = @subtotal,
            iva_monto = @iva_monto,
            total = @total
        WHERE venta_id = @venta_id;

        COMMIT;

        SELECT
            @detalle_id AS detalle_id_creado,
            @subtotal AS venta_subtotal,
            @iva_monto AS venta_iva,
            @total AS venta_total;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        THROW;
    END CATCH
END