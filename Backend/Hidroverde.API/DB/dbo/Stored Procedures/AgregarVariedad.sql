-- Modificar AgregarVariedad con alias
CREATE PROCEDURE [dbo].[AgregarVariedad]
    @categoria_id int,
    @nombre_variedad nvarchar(100),
    @descripcion nvarchar(max) = NULL,
    @dias_germinacion int,
    @dias_cosecha int,
    @temperatura_minima decimal(5, 2) = NULL,
    @temperatura_maxima decimal(5, 2) = NULL,
    @ph_minimo decimal(3, 1) = NULL,
    @ph_maximo decimal(3, 1) = NULL,
    @ec_minimo decimal(4, 2) = NULL,
    @ec_maximo decimal(4, 2) = NULL,
    @instrucciones_especiales nvarchar(max) = NULL,
    @activa bit = 1
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRANSACTION
        INSERT INTO [dbo].[Variedades] 
        ([categoria_id], [nombre_variedad], [descripcion], [dias_germinacion], 
         [dias_cosecha], [temperatura_minima], [temperatura_maxima], [ph_minimo], 
         [ph_maximo], [ec_minimo], [ec_maximo], [instrucciones_especiales], 
         [activa], [fecha_creacion])
        VALUES 
        (@categoria_id, @nombre_variedad, @descripcion, @dias_germinacion, 
         @dias_cosecha, @temperatura_minima, @temperatura_maxima, @ph_minimo, 
         @ph_maximo, @ec_minimo, @ec_maximo, @instrucciones_especiales, 
         @activa, GETDATE())
        
        SELECT SCOPE_IDENTITY() AS VariedadId
    COMMIT TRANSACTION
END