
-- OBTENER ESTADO VENTA POR ID
CREATE PROCEDURE [dbo].[ObtenerEstadoVenta]
    @estado_venta_id int
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
    WHERE estado_venta_id = @estado_venta_id
END