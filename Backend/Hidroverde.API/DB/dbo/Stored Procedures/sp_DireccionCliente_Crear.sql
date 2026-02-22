
-- SP para crear dirección de cliente (actualizado)
CREATE   PROCEDURE [dbo].[sp_DireccionCliente_Crear]
    @cliente_id INT,
    @codigo_postal NVARCHAR(10),
    @alias NVARCHAR(100) = NULL,
    @direccion_exacta NVARCHAR(MAX),
    @referencia NVARCHAR(MAX) = NULL,
    @telefono_contacto NVARCHAR(20) = NULL,
    @activa BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Validar código postal (formato Costa Rica: 5 dígitos)
    IF @codigo_postal NOT LIKE '[0-9][0-9][0-9][0-9][0-9]'
    BEGIN
        RAISERROR('El código postal debe tener 5 dígitos numéricos', 16, 1)
        RETURN
    END
    
    INSERT INTO [dbo].[Direcciones_Clientes] 
        ([cliente_id], [codigo_postal], [alias], [direccion_exacta], 
         [referencia], [telefono_contacto], [activa], [fecha_creacion])
    VALUES 
        (@cliente_id, @codigo_postal, @alias, @direccion_exacta,
         @referencia, @telefono_contacto, @activa, GETDATE())
    
    SELECT SCOPE_IDENTITY() AS direccion_id
END