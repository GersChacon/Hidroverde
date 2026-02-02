
-- Modificar EditarCategoria con alias
CREATE PROCEDURE [dbo].[EditarCategoria]
    @categoria_id int,
    @tipo_cultivo_id int,
    @nombre nvarchar(100),
    @descripcion nvarchar(max) = NULL,
    @requiere_seguimiento bit,
    @activa bit
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRANSACTION
        UPDATE [dbo].[Categorias]
        SET [tipo_cultivo_id] = @tipo_cultivo_id,
            [nombre] = @nombre,
            [descripcion] = @descripcion,
            [requiere_seguimiento] = @requiere_seguimiento,
            [activa] = @activa
        WHERE categoria_id = @categoria_id
        
        SELECT @categoria_id AS CategoriaId
    COMMIT TRANSACTION
END