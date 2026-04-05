CREATE PROCEDURE [dbo].[RegistrarEmpleadoAuth]
    @usuario_sistema nvarchar(50),
    @clave_hash      nvarchar(255),
    @email           nvarchar(100)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[Empleados]
    SET    usuario_sistema = @usuario_sistema,
           clave_hash      = @clave_hash,
           email           = @email
    WHERE  email = @email
    SELECT SCOPE_IDENTITY() AS empleado_id
END