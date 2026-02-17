
-- =============================================
-- OBTENER TODOS LOS ESTADOS VENTA
-- =============================================
CREATE PROCEDURE [dbo].[ObtenerEstadosVenta]
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        estado_venta_id,
        codigo,
        nombre,
        orden,
        color,
        permite_modificacion,
        descripcion,
        activo
    FROM [dbo].[Estados_Venta]
    ORDER BY orden, nombre
END