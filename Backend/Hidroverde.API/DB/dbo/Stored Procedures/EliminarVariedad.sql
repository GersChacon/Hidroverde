
-- Eliminar Variedad
CREATE PROCEDURE [dbo].[EliminarVariedad]
    @variedad_id int
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRANSACTION
        DELETE FROM [dbo].[Variedades]
        WHERE variedad_id = @variedad_id
        
        SELECT @variedad_id AS variedad_id
    COMMIT TRANSACTION
END