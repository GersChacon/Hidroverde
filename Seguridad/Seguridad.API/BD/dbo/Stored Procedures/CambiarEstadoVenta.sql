
CREATE PROCEDURE [dbo].[CambiarEstadoVenta]
    @venta_id        INT,
    @estado_venta_id INT,
    @notas           NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION

            -- Validar que la venta existe
            IF NOT EXISTS (SELECT 1 FROM [dbo].[Ventas] WHERE venta_id = @venta_id)
                THROW 51104, 'La venta no existe.', 1;

            -- Obtener estado actual
            DECLARE @codigo_actual NVARCHAR(30);
            SELECT @codigo_actual = ev.codigo
            FROM [dbo].[Ventas] v
            INNER JOIN [dbo].[Estados_Venta] ev ON v.estado_venta_id = ev.estado_venta_id
            WHERE v.venta_id = @venta_id;

            -- Bloquear sólo estados terminales (ENTREGADO y CANCELADO no se pueden mover)
            IF @codigo_actual IN ('ENTREGADO', 'CANCELADO')
                THROW 51104, 'La venta está en un estado terminal y no puede modificarse.', 1;

            -- Validar que el nuevo estado existe y está activo
            IF NOT EXISTS (SELECT 1 FROM [dbo].[Estados_Venta] WHERE estado_venta_id = @estado_venta_id AND activo = 1)
                THROW 51104, 'El estado de venta indicado no es válido.', 1;

            -- Validar que no se retroceda (el nuevo estado debe tener orden >= al actual)
            DECLARE @orden_actual INT, @orden_nuevo INT;
            SELECT @orden_actual = ev.orden
            FROM [dbo].[Ventas] v
            INNER JOIN [dbo].[Estados_Venta] ev ON v.estado_venta_id = ev.estado_venta_id
            WHERE v.venta_id = @venta_id;

            SELECT @orden_nuevo = orden FROM [dbo].[Estados_Venta] WHERE estado_venta_id = @estado_venta_id;

            IF @orden_nuevo < @orden_actual
                THROW 51104, 'No se puede retroceder el estado de una venta.', 1;

            UPDATE [dbo].[Ventas]
            SET estado_venta_id = @estado_venta_id,
                notas = ISNULL(@notas, notas)
            WHERE venta_id = @venta_id;

            SELECT @venta_id AS venta_id;

        COMMIT TRANSACTION
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END