
CREATE PROCEDURE [dbo].[EliminarEstadoPago]
    @estado_pago_id int
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION
            DELETE FROM [dbo].[Estados_Pago] WHERE estado_pago_id=@estado_pago_id
            SELECT @estado_pago_id AS estado_pago_id
        COMMIT TRANSACTION
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION
        THROW
    END CATCH
END