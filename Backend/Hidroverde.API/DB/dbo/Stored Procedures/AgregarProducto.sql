CREATE PROCEDURE [dbo].[AgregarProducto]
    @codigo nvarchar(30),
    @variedad_id int,
    @nombre_producto nvarchar(200),
    @descripcion nvarchar(max) = NULL,
    @precio_base decimal(10, 2),
    @dias_caducidad int,
    @requiere_refrigeracion bit = 0,
    @imagen_url nvarchar(500) = NULL,
    @activo bit = 1,
    @stock_minimo int = 0,
    @peso_gramos decimal(8, 2)  -- 👈 NUEVO PARÁMETRO
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRANSACTION
        INSERT INTO [dbo].[Productos] 
        ([codigo], [variedad_id], [nombre_producto], [descripcion], 
         [precio_base], [dias_caducidad], [requiere_refrigeracion], [imagen_url], 
         [activo], [fecha_creacion], [stock_minimo], [peso_gramos])  -- 👈 NUEVA COLUMNA
        VALUES 
        (@codigo, @variedad_id, @nombre_producto, @descripcion, 
         @precio_base, @dias_caducidad, @requiere_refrigeracion, @imagen_url, 
         @activo, GETDATE(), @stock_minimo, @peso_gramos)  -- 👈 NUEVO VALOR
        
        SELECT SCOPE_IDENTITY() AS producto_id
    COMMIT TRANSACTION
END