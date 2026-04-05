CREATE PROCEDURE [dbo].[ObtenerEmpleadoLogin]
    @usuario_sistema nvarchar(50),
    @email           nvarchar(100)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT empleado_id, usuario_sistema, clave_hash, email
    FROM   [dbo].[Empleados]
    WHERE  (usuario_sistema = @usuario_sistema)
       OR  (email           = @email)
      AND   activo = 1
END