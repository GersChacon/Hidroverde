
-- Modificar EliminarVariedad con alias
CREATE PROCEDURE [dbo].[EliminarVariedad]
    @variedad_id int
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRANSACTION
        DELETE FROM [dbo].[Variedades]
        WHERE variedad_id = @variedad_id
        
        SELECT @variedad_id AS VariedadId
    COMMIT TRANSACTION
END