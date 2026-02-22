
CREATE PROCEDURE [dbo].[ObtenerTipoCliente]
    @tipo_cliente_id int
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM [dbo].[Tipos_Cliente] WHERE tipo_cliente_id=@tipo_cliente_id
END