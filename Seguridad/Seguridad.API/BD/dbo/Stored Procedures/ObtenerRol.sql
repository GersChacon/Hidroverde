
CREATE PROCEDURE [dbo].[ObtenerRol]
    @rol_id int
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM [dbo].[Roles] WHERE rol_id=@rol_id
END