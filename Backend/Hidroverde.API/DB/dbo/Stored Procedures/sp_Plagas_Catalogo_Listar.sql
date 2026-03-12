CREATE     PROCEDURE [dbo].[sp_Plagas_Catalogo_Listar]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT plaga_id, nombre
    FROM dbo.Plagas
    WHERE activo = 1
    ORDER BY nombre;
END