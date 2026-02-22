
CREATE PROCEDURE [dbo].[CambiarEstadoEmpleado]
    @empleado_id int, @estado nvarchar(20)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION
            UPDATE [dbo].[Empleados] SET [estado]=@estado WHERE empleado_id=@empleado_id
            SELECT @empleado_id AS empleado_id
        COMMIT TRANSACTION
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION
        THROW
    END CATCH
END