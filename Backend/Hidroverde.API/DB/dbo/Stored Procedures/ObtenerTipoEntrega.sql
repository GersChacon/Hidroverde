
-- =============================================
-- OBTENER TIPO ENTREGA POR ID
-- =============================================
CREATE PROCEDURE [dbo].[ObtenerTipoEntrega]
    @tipo_entrega_id int
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
    WHERE tipo_entrega_id = @tipo_entrega_id
END