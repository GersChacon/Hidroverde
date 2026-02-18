-- =============================================
-- AGREGAR TIPO ENTREGA
-- =============================================
CREATE PROCEDURE [dbo].[AgregarTipoEntrega]
    @codigo nvarchar(30),
    @nombre nvarchar(50),
    @costo_default decimal(10, 2),
    @descripcion nvarchar(max) = NULL,
    @activo bit = 1
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRANSACTION
        INSERT INTO [dbo].[Tipos_Entrega] 
        ([codigo], [nombre], [costo_default], [descripcion], [activo])
        VALUES 
        (@codigo, @nombre, @costo_default, @descripcion, @activo)
        
        SELECT SCOPE_IDENTITY() AS tipo_entrega_id
    COMMIT TRANSACTION
END