CREATE PROCEDURE [dbo].[CambiarEstadoVenta]
    @venta_id        INT,
    @estado_venta_id INT,
    @notas           NVARCHAR(MAX) = NULL   -- IGNORADO (no se exponen notas)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION

            -- Validar que la venta existe
            IF NOT EXISTS (SELECT 1 FROM [dbo].[Ventas] WHERE venta_id = @venta_id)
                THROW 51104, 'La venta no existe.', 1;

            -- Estado de venta actual (código + orden)
            DECLARE @codigo_actual NVARCHAR(30), @orden_actual INT;
            SELECT @codigo_actual = ev.codigo, @orden_actual = ev.orden
            FROM [dbo].[Ventas] v
            INNER JOIN [dbo].[Estados_Venta] ev ON v.estado_venta_id = ev.estado_venta_id
            WHERE v.venta_id = @venta_id;

            -- Bloquear estados terminales
            IF @codigo_actual IN ('ENTREGADO', 'CANCELADO')
                THROW 51104, 'La venta está en un estado terminal y no puede modificarse.', 1;

            -- COMPUERTA DE PAGO: no se puede avanzar el estado logístico
            -- mientras el pago no esté finalizado (estado de pago con permite_entrega = 1, es decir PAGADO).
            DECLARE @pago_ok BIT;
            SELECT @pago_ok = ep.permite_entrega
            FROM [dbo].[Ventas] v
            INNER JOIN [dbo].[Estados_Pago] ep ON v.estado_pago_id = ep.estado_pago_id
            WHERE v.venta_id = @venta_id;

            IF ISNULL(@pago_ok, 0) = 0
                THROW 51104, 'No se puede avanzar el estado de la venta hasta que el pago esté confirmado como PAGADO.', 1;

            -- Validar que el estado destino exista y esté activo
            IF NOT EXISTS (SELECT 1 FROM [dbo].[Estados_Venta] WHERE estado_venta_id = @estado_venta_id AND activo = 1)
                THROW 51104, 'El estado de venta indicado no es válido.', 1;

            -- Calcular el ÚNICO estado siguiente permitido: el activo, no cancelado,
            -- con el menor orden estrictamente mayor al actual (robusto ante saltos en 'orden').
            DECLARE @orden_siguiente INT;
            SELECT @orden_siguiente = MIN(orden)
            FROM [dbo].[Estados_Venta]
            WHERE activo = 1 AND codigo <> 'CANCELADO' AND orden > @orden_actual;

            IF @orden_siguiente IS NULL
                THROW 51104, 'La venta ya está en el último estado del flujo.', 1;

            DECLARE @orden_nuevo INT;
            SELECT @orden_nuevo = orden FROM [dbo].[Estados_Venta] WHERE estado_venta_id = @estado_venta_id;

            -- No se permite retroceder ni saltar: solo el estado inmediatamente siguiente.
            IF @orden_nuevo <> @orden_siguiente
                THROW 51104, 'Transición inválida: el flujo debe avanzar al estado consecutivo, sin saltar ni retroceder.', 1;

            UPDATE [dbo].[Ventas]
            SET estado_venta_id = @estado_venta_id
            WHERE venta_id = @venta_id;

            SELECT @venta_id AS venta_id;

        COMMIT TRANSACTION
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
