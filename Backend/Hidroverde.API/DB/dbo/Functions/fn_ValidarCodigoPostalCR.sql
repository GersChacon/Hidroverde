

-- =============================================
-- PARTE 5: FUNCIÓN DE UTILIDAD PARA VALIDAR CÓDIGO POSTAL
-- =============================================

CREATE   FUNCTION [dbo].[fn_ValidarCodigoPostalCR]
(
    @codigo_postal NVARCHAR(10)
)
RETURNS BIT
AS
BEGIN
    DECLARE @resultado BIT = 0
    
    -- Formato Costa Rica: 5 dígitos (10101, 20102, etc)
    IF @codigo_postal LIKE '[0-9][0-9][0-9][0-9][0-9]'
        SET @resultado = 1
    
    RETURN @resultado
END