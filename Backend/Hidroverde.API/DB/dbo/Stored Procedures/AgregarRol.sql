-- =============================================
-- ROLES
-- =============================================
CREATE PROCEDURE [dbo].[AgregarRol]
    @codigo nvarchar(30), @nombre nvarchar(50),
    @nivel_acceso int = NULL, @descripcion nvarchar(max) = NULL, @activo bit = 1
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION
            INSERT INTO [dbo].[Roles] ([codigo],[nombre],[nivel_acceso],[descripcion],[activo])
            VALUES (@codigo,@nombre,@nivel_acceso,@descripcion,@activo)
            SELECT SCOPE_IDENTITY() AS rol_id
        COMMIT TRANSACTION
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION
        THROW
    END CATCH
END