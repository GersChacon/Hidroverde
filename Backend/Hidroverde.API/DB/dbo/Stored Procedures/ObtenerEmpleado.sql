
CREATE PROCEDURE [dbo].[ObtenerEmpleado]
    @empleado_id int
AS
BEGIN
    SET NOCOUNT ON;
    SELECT e.*,
           r.rol_id,
           r.nombre AS nombre_rol,
           r.codigo AS codigo_rol
    FROM [dbo].[Empleados] e
    INNER JOIN [dbo].[EmpleadoxRol] exr ON e.empleado_id = exr.empleado_id
    INNER JOIN [dbo].[Roles]        r   ON exr.rol_id    = r.rol_id
    WHERE e.empleado_id = @empleado_id
END