
CREATE PROCEDURE [dbo].[ObtenerRolesxEmpleadoLogin]
    @usuario_sistema nvarchar(50)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT r.rol_id, r.codigo, r.nombre, r.nivel_acceso
    FROM       [dbo].[Roles]        r
    INNER JOIN [dbo].[EmpleadoxRol] exr ON r.rol_id       = exr.rol_id
    INNER JOIN [dbo].[Empleados]    e   ON exr.empleado_id = e.empleado_id
    WHERE e.usuario_sistema = @usuario_sistema
      AND e.activo = 1
END