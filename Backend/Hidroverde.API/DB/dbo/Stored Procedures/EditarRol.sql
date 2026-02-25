
CREATE PROCEDURE [dbo].[EditarRol]
    @rol_id int, @codigo nvarchar(30), @nombre nvarchar(50),
    @nivel_acceso int = NULL, @descripcion nvarchar(max) = NULL, @activo bit = 1
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION
            UPDATE [dbo].[Roles]
            SET [codigo]=@codigo,[nombre]=@nombre,[nivel_acceso]=@nivel_acceso,[descripcion]=@descripcion,[activo]=@activo
            WHERE rol_id=@rol_id
            SELECT @rol_id AS rol_id
        COMMIT TRANSACTION
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION
        THROW
    END CATCH
END