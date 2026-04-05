
-- SP para actualizar dirección (nuevo)
CREATE   PROCEDURE [dbo].[sp_DireccionCliente_Actualizar]
    @direccion_id INT,
    @codigo_postal NVARCHAR(10),
    @alias NVARCHAR(100) = NULL,
    @direccion_exacta NVARCHAR(MAX),
    @referencia NVARCHAR(MAX) = NULL,
    @telefono_contacto NVARCHAR(20) = NULL,
    @activa BIT
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @codigo_postal NOT LIKE '[0-9][0-9][0-9][0-9][0-9]'
        THROW 51000, 'El código postal debe tener 5 dígitos numéricos', 1;
    
    UPDATE [dbo].[Direcciones_Clientes]
    SET [codigo_postal] = @codigo_postal,
        [alias] = @alias,
        [direccion_exacta] = @direccion_exacta,
        [referencia] = @referencia,
        [telefono_contacto] = @telefono_contacto,
        [activa] = @activa
    WHERE direccion_id = @direccion_id
    
    SELECT @direccion_id AS direccion_id
END