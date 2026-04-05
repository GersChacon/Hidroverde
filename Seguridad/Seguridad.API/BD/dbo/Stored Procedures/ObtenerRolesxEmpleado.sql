CREATE PROCEDURE [dbo].[ObtenerRolesxEmpleado]
    @empleado_id int
AS
BEGIN
    SET NOCOUNT ON;
    SELECT r.rol_id, r.codigo, r.nombre, r.nivel_acceso, r.descripcion, r.activo
    FROM       [dbo].[Roles]        r
    INNER JOIN [dbo].[EmpleadoxRol] exr ON r.rol_id      = exr.rol_id
    INNER JOIN [dbo].[Empleados]    e   ON exr.empleado_id = e.empleado_id
    WHERE e.empleado_id = @empleado_id
END