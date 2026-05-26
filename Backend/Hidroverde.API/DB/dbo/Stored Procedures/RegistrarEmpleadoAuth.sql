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
    WHERE  email = @email;

    -- FIX: SCOPE_IDENTITY() es NULL tras un UPDATE.
    -- Devolver el empleado_id real de la fila actualizada.
    SELECT empleado_id AS empleado_id
    FROM   [dbo].[Empleados]
    WHERE  email = @email;
END
