
CREATE PROCEDURE [dbo].[ObtenerEmpleado]
    @empleado_id int
AS
BEGIN
    SET NOCOUNT ON;
    SELECT e.*, r.nombre AS nombre_rol
    FROM [dbo].[Empleados] e
    INNER JOIN [dbo].[Roles] r ON e.rol_id = r.rol_id
    WHERE e.empleado_id=@empleado_id
END