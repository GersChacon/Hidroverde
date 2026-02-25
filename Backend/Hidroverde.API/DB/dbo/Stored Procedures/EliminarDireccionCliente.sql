
CREATE PROCEDURE [dbo].[EliminarDireccionCliente]
    @direccion_id int
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION
            DELETE FROM [dbo].[Direcciones_Clientes] WHERE direccion_id=@direccion_id
            SELECT @direccion_id AS direccion_id
        COMMIT TRANSACTION
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION
        THROW
    END CATCH
END