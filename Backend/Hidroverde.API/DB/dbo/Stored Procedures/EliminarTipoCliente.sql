
CREATE PROCEDURE [dbo].[EliminarTipoCliente]
    @tipo_cliente_id int
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION
            DELETE FROM [dbo].[Tipos_Cliente] WHERE tipo_cliente_id=@tipo_cliente_id
            SELECT @tipo_cliente_id AS tipo_cliente_id
        COMMIT TRANSACTION
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION
        THROW
    END CATCH
END