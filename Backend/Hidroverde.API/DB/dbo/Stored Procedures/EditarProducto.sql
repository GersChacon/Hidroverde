
-- =============================================
-- EDITAR PRODUCTO (sin unidad_id, con peso_gramos)
-- =============================================
CREATE PROCEDURE [dbo].[EditarProducto]
    @producto_id int,
    @codigo nvarchar(30),
    @variedad_id int,
    @nombre_producto nvarchar(200),
    @descripcion nvarchar(max) = NULL,
    @precio_base decimal(10, 2),
    @dias_caducidad int,
    @requiere_refrigeracion bit,
    @imagen_url nvarchar(500) = NULL,
    @activo bit,
    @stock_minimo int = 0,
    @peso_gramos decimal(8, 2)  -- 👈 NUEVO PARÁMETRO
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRANSACTION
        UPDATE [dbo].[Productos]
        SET [codigo] = @codigo,
            [variedad_id] = @variedad_id,
            [nombre_producto] = @nombre_producto,
            [descripcion] = @descripcion,
            [precio_base] = @precio_base,
            [dias_caducidad] = @dias_caducidad,
            [requiere_refrigeracion] = @requiere_refrigeracion,
            [imagen_url] = @imagen_url,
            [activo] = @activo,
            [stock_minimo] = @stock_minimo,
            [peso_gramos] = @peso_gramos  -- 👈 NUEVO CAMPO
        WHERE producto_id = @producto_id
        
        SELECT @producto_id AS producto_id
    COMMIT TRANSACTION
END