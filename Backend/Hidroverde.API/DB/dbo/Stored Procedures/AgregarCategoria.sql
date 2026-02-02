-- Modificar AgregarCategoria con alias
CREATE PROCEDURE [dbo].[AgregarCategoria]
    @tipo_cultivo_id int,
    @nombre nvarchar(100),
    @descripcion nvarchar(max) = NULL,
    @requiere_seguimiento bit = 0,
    @activa bit = 1
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRANSACTION
        INSERT INTO [dbo].[Categorias] 
        ([tipo_cultivo_id], [nombre], [descripcion], 
         [requiere_seguimiento], [activa], [fecha_creacion])
        VALUES 
        (@tipo_cultivo_id, @nombre, @descripcion, 
         @requiere_seguimiento, @activa, GETDATE())
        
        SELECT SCOPE_IDENTITY() AS CategoriaId
    COMMIT TRANSACTION
END