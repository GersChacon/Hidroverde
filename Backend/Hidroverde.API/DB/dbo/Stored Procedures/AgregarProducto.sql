CREATE   PROCEDURE [dbo].[AgregarProducto]
    @codigo nvarchar(30),
    @variedad_id int,
    @unidad_id int,                 -- ✅ NUEVO
    @nombre_producto nvarchar(200),
    @descripcion nvarchar(max) = NULL,
    @precio_base decimal(10, 2),
    @dias_caducidad int,
    @requiere_refrigeracion bit = 0,
    @imagen_url nvarchar(500) = NULL,
    @activo bit = 1,
    @stock_minimo int = 0,
    @peso_gramos decimal(8, 2)
AS
BEGIN
    SET NOCOUNT ON;

    -- Validaciones mínimas (evitan 500 feos)
    IF @unidad_id IS NULL OR @unidad_id <= 0
        THROW 51020, 'UnidadId es requerido.', 1;

    IF @variedad_id IS NULL OR @variedad_id <= 0
        THROW 51021, 'VariedadId es requerido.', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        INSERT INTO [dbo].[Productos]
        (
            [codigo], [variedad_id], [unidad_id], [nombre_producto], [descripcion],
            [precio_base], [dias_caducidad], [requiere_refrigeracion], [imagen_url],
            [activo], [fecha_creacion], [stock_minimo], [peso_gramos]
        )
        VALUES
        (
            @codigo, @variedad_id, @unidad_id, @nombre_producto, @descripcion,
            @precio_base, @dias_caducidad, @requiere_refrigeracion, @imagen_url,
            @activo, GETDATE(), @stock_minimo, @peso_gramos
        );

        SELECT CAST(SCOPE_IDENTITY() AS int) AS producto_id;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        THROW;
    END CATCH
END