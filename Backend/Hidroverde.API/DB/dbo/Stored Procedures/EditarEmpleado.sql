
CREATE PROCEDURE [dbo].[EditarEmpleado]
    @empleado_id int, @rol_id int, @cedula nvarchar(20), @nombre nvarchar(100),
    @apellidos nvarchar(100), @telefono nvarchar(20) = NULL, @email nvarchar(100),
    @fecha_nacimiento date = NULL, @fecha_contratacion date,
    @usuario_sistema nvarchar(50) = NULL, @activo bit = 1, @estado nvarchar(20) = 'ACTIVO'
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION
            UPDATE [dbo].[Empleados]
            SET [rol_id]=@rol_id,[cedula]=@cedula,[nombre]=@nombre,[apellidos]=@apellidos,
                [telefono]=@telefono,[email]=@email,[fecha_nacimiento]=@fecha_nacimiento,
                [fecha_contratacion]=@fecha_contratacion,[usuario_sistema]=@usuario_sistema,
                [activo]=@activo,[estado]=@estado
            WHERE empleado_id=@empleado_id
            SELECT @empleado_id AS empleado_id
        COMMIT TRANSACTION
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION
        THROW
    END CATCH
END