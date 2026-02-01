
-- Obtener Producto Completo con Joins
CREATE PROCEDURE [dbo].[ObtenerProducto]
    @producto_id int
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        p.*,
        v.nombre_variedad,
        v.dias_germinacion,
        v.dias_cosecha,
        c.nombre AS categoria_nombre,
        tc.nombre AS tipo_cultivo_nombre,
        u.nombre AS unidad_nombre,
        u.simbolo AS unidad_simbolo
    FROM [dbo].[Productos] p
    INNER JOIN [dbo].[Variedades] v ON p.variedad_id = v.variedad_id
    INNER JOIN [dbo].[Categorias] c ON v.categoria_id = c.categoria_id
    INNER JOIN [dbo].[Tipos_Cultivo] tc ON c.tipo_cultivo_id = tc.tipo_cultivo_id
    INNER JOIN [dbo].[Unidades_Medida] u ON p.unidad_id = u.unidad_id
    WHERE p.producto_id = @producto_id
END