
CREATE   PROCEDURE [dbo].[sp_Venta_Crear]
    @cliente_id INT,
    @direccion_entrega_id INT,
    @vendedor_id INT,
    @estado_venta_codigo NVARCHAR(30) = N'PENDIENTE',
    @estado_pago_codigo NVARCHAR(30) = N'PENDIENTE',
    @metodo_pago_codigo NVARCHAR(30) = NULL,
    @tipo_entrega_codigo NVARCHAR(30) = N'RECOGE',
    @notas NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @estado_venta_id INT = (SELECT estado_venta_id FROM dbo.Estados_Venta WHERE codigo=@estado_venta_codigo AND activo=1);
    IF @estado_venta_id IS NULL THROW 52001, 'Estado de venta inválido.', 1;

    DECLARE @estado_pago_id INT = (SELECT estado_pago_id FROM dbo.Estados_Pago WHERE codigo=@estado_pago_codigo AND activo=1);
    IF @estado_pago_id IS NULL THROW 52002, 'Estado de pago inválido.', 1;

    DECLARE @tipo_entrega_id INT = (SELECT tipo_entrega_id FROM dbo.Tipos_Entrega WHERE codigo=@tipo_entrega_codigo AND activo=1);
    IF @tipo_entrega_id IS NULL THROW 52003, 'Tipo de entrega inválido.', 1;

    DECLARE @metodo_pago_id INT = NULL;
    IF @metodo_pago_codigo IS NOT NULL
    BEGIN
        SET @metodo_pago_id = (SELECT metodo_pago_id FROM dbo.Metodos_Pago WHERE codigo=@metodo_pago_codigo AND activo=1);
        IF @metodo_pago_id IS NULL THROW 52004, 'Método de pago inválido.', 1;
    END

    INSERT INTO dbo.Ventas
    (
        cliente_id, direccion_entrega_id, vendedor_id,
        estado_venta_id, estado_pago_id, metodo_pago_id,
        tipo_entrega_id, notas
    )
    VALUES
    (
        @cliente_id, @direccion_entrega_id, @vendedor_id,
        @estado_venta_id, @estado_pago_id, @metodo_pago_id,
        @tipo_entrega_id, @notas
    );

    SELECT SCOPE_IDENTITY() AS venta_id_creada;
END