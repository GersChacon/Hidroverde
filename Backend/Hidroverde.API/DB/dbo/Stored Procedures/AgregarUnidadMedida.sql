CREATE PROCEDURE [dbo].[AgregarUnidadMedida]
    @codigo nvarchar(20),
    @nombre nvarchar(50),
    @simbolo nvarchar(10) = NULL,
    @tipo nvarchar(30) = NULL,
    @activo bit = 1
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRANSACTION
        INSERT INTO [dbo].[Unidades_Medida] 
        ([codigo], [nombre], [simbolo], [tipo], [activo])
        VALUES 
        (@codigo, @nombre, @simbolo, @tipo, @activo)
        
        SELECT SCOPE_IDENTITY() AS unidad_id
    COMMIT TRANSACTION
END