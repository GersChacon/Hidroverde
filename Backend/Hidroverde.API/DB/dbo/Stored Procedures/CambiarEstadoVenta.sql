CREATE PROCEDURE [dbo].[CambiarEstadoVenta]
    @venta_id       INT,
    @estado_venta_id INT,
    @notas          NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION

            -- Validar que el estado actual permite modificación
            IF NOT EXISTS (
                SELECT 1
                FROM [dbo].[Ventas] v
                INNER JOIN [dbo].[Estados_Venta] ev ON v.estado_venta_id = ev.estado_venta_id
                WHERE v.venta_id = @venta_id AND ev.permite_modificacion = 1
            )
                THROW 51104, 'La venta no permite modificación en su estado actual.', 1;

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