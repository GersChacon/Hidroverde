
-- Modificar EditarVariedad con alias
CREATE PROCEDURE [dbo].[EditarVariedad]
    @variedad_id int,
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
    @activa bit
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRANSACTION
        UPDATE [dbo].[Variedades]
        SET [categoria_id] = @categoria_id,
            [nombre_variedad] = @nombre_variedad,
            [descripcion] = @descripcion,
            [dias_germinacion] = @dias_germinacion,
            [dias_cosecha] = @dias_cosecha,
            [temperatura_minima] = @temperatura_minima,
            [temperatura_maxima] = @temperatura_maxima,
            [ph_minimo] = @ph_minimo,
            [ph_maximo] = @ph_maximo,
            [ec_minimo] = @ec_minimo,
            [ec_maximo] = @ec_maximo,
            [instrucciones_especiales] = @instrucciones_especiales,
            [activa] = @activa
        WHERE variedad_id = @variedad_id
        
        SELECT @variedad_id AS VariedadId
    COMMIT TRANSACTION
END