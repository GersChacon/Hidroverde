CREATE PROCEDURE [dbo].[ConfirmarPagoVenta]
    @venta_id       INT,
    @estado_pago_id INT,
    @metodo_pago_id INT,
    @notas          NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION

            UPDATE [dbo].[Ventas]
            SET estado_pago_id = @estado_pago_id,
                metodo_pago_id = @metodo_pago_id,
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