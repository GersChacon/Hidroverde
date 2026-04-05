
CREATE PROCEDURE [dbo].[ObtenerRoles]
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM [dbo].[Roles] ORDER BY nombre
END