
-- OBTENER TODOS
CREATE PROCEDURE [dbo].[ObtenerMetodosPago]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT *
    FROM [dbo].[Metodos_Pago]
    ORDER BY nombre
END