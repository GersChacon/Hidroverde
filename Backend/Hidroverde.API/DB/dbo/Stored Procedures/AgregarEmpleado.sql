CREATE PROCEDURE [dbo].[AgregarEmpleado]
    @rol_id int,
    @cedula nvarchar(20),
    @nombre nvarchar(100),
    @apellidos nvarchar(100),
    @telefono nvarchar(20) = NULL,
    @email nvarchar(100),
    @fecha_nacimiento date = NULL,
    @fecha_contratacion date,
    @usuario_sistema nvarchar(50) = NULL,
    @clave_hash nvarchar(255) = NULL,
    @activo bit = 1,
    @estado nvarchar(20) = 'ACTIVO'
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION
            INSERT INTO [dbo].[Empleados]
                ([cedula],[nombre],[apellidos],[telefono],[email],
                 [fecha_nacimiento],[fecha_contratacion],[usuario_sistema],
                 [clave_hash],[activo],[estado])
            VALUES
                (@cedula,@nombre,@apellidos,@telefono,@email,
                 @fecha_nacimiento,@fecha_contratacion,@usuario_sistema,
                 @clave_hash,@activo,@estado)

            DECLARE @nuevo_id int = SCOPE_IDENTITY()

            INSERT INTO [dbo].[EmpleadoxRol] ([empleado_id], [rol_id])
            VALUES (@nuevo_id, @rol_id)

            SELECT @nuevo_id AS empleado_id
        COMMIT TRANSACTION
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION
        THROW
    END CATCH
END