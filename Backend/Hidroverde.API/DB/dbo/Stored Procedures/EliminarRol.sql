
CREATE PROCEDURE [dbo].[EliminarRol]
    @rol_id int
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION
            DELETE FROM [dbo].[Roles] WHERE rol_id=@rol_id
            SELECT @rol_id AS rol_id
        COMMIT TRANSACTION
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION
        THROW
    END CATCH
END