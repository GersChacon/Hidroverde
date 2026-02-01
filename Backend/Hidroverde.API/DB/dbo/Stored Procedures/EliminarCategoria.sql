
-- Eliminar Categoria
CREATE PROCEDURE [dbo].[EliminarCategoria]
    @categoria_id int
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRANSACTION
        DELETE FROM [dbo].[Categorias]
        WHERE categoria_id = @categoria_id
        
        SELECT @categoria_id AS categoria_id
    COMMIT TRANSACTION
END