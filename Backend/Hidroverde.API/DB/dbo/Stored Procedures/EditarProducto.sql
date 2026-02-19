CREATE   PROCEDURE [dbo].[EditarProducto]
    @producto_id int,
    @codigo nvarchar(30),
    @variedad_id int,
    @unidad_id int,                 -- ✅ NUEVO
    @nombre_producto nvarchar(200),
    @descripcion nvarchar(max) = NULL,
    @precio_base decimal(10, 2),
    @dias_caducidad int,
    @requiere_refrigeracion bit,
    @imagen_url nvarchar(500) = NULL,
    @activo bit,
    @stock_minimo int = 0,
    @peso_gramos decimal(8, 2)
AS
BEGIN
    SET NOCOUNT ON;

    IF @producto_id IS NULL OR @producto_id <= 0
        THROW 51030, 'ProductoId inválido.', 1;

    IF @unidad_id IS NULL OR @unidad_id <= 0
        THROW 51020, 'UnidadId es requerido.', 1;

    IF @variedad_id IS NULL OR @variedad_id <= 0
        THROW 51021, 'VariedadId es requerido.', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        UPDATE [dbo].[Productos]
        SET [codigo] = @codigo,
            [variedad_id] = @variedad_id,
            [unidad_id] = @unidad_id,              -- ✅ FIX
            [nombre_producto] = @nombre_producto,
            [descripcion] = @descripcion,
            [precio_base] = @precio_base,
            [dias_caducidad] = @dias_caducidad,
            [requiere_refrigeracion] = @requiere_refrigeracion,
            [imagen_url] = @imagen_url,
            [activo] = @activo,
            [stock_minimo] = @stock_minimo,
            [peso_gramos] = @peso_gramos
        WHERE producto_id = @producto_id;

        IF @@ROWCOUNT = 0
            THROW 51031, 'Producto no existe.', 1;

        SELECT @producto_id AS producto_id;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        THROW;
    END CATCH
END