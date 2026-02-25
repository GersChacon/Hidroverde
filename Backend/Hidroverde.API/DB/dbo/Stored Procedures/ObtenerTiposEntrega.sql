
-- OBTENER TODOS LOS TIPOS ENTREGA
CREATE PROCEDURE [dbo].[ObtenerTiposEntrega]
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        tipo_entrega_id,
        codigo,
        nombre,
        costo_default,
        descripcion,
        activo
    FROM [dbo].[Tipos_Entrega]
    ORDER BY nombre
END