
CREATE PROCEDURE [dbo].[ObtenerEmpleados]
AS
BEGIN
    SET NOCOUNT ON;
    SELECT e.*, r.nombre AS nombre_rol
    FROM [dbo].[Empleados] e
    INNER JOIN [dbo].[Roles] r ON e.rol_id = r.rol_id
    ORDER BY e.nombre
END