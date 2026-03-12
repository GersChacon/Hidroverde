CREATE PROCEDURE [dbo].[AgregarProducto]
    @codigo nvarchar(30),
    @variedad_id int,
    @unidad_id int,
    @nombre_producto nvarchar(200),
    @descripcion nvarchar(max) = NULL,
    @precio_base decimal(10, 2),
    @dias_caducidad int,
    @requiere_refrigeracion bit = 0,
    @imagen_url nvarchar(500) = NULL,
    @activo bit = 1,
    @stock_minimo int = 0,
    @peso_gramos decimal(8, 2)  -- 👈 NUEVO PARÁMETRO
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRANSACTION
        INSERT INTO [dbo].[Productos] 
        ([codigo], [variedad_id], [nombre_producto], [descripcion], 
         [precio_base], [dias_caducidad], [requiere_refrigeracion], [imagen_url], 
         [activo], [fecha_creacion], [stock_minimo], [peso_gramos])  -- 👈 NUEVA COLUMNA
        VALUES 
        (@codigo, @variedad_id, @nombre_producto, @descripcion, 
         @precio_base, @dias_caducidad, @requiere_refrigeracion, @imagen_url, 
         @activo, GETDATE(), @stock_minimo, @peso_gramos)  -- 👈 NUEVO VALOR
        
        SELECT SCOPE_IDENTITY() AS producto_id
    COMMIT TRANSACTION

    /* ===== Normalización ===== */
    SET @codigo = NULLIF(LTRIM(RTRIM(@codigo)), '');

    IF @nombre_producto IS NULL OR LTRIM(RTRIM(@nombre_producto)) = ''
        THROW 51022, 'NombreProducto es requerido.', 1;

    /* ===== Defaults ===== */
    IF @variedad_id IS NULL OR @variedad_id <= 0
        SET @variedad_id = 1;  -- <-- tu variedad default

    /* ===== Validaciones ===== */
    IF @unidad_id IS NULL OR @unidad_id <= 0
        THROW 51020, 'UnidadId es requerido.', 1;

    IF NOT EXISTS (
        SELECT 1
        FROM dbo.Unidades_Medida
        WHERE unidad_id = @unidad_id AND activo = 1
    )
        THROW 51023, 'UnidadId inválido o inactivo.', 1;

    /* ===== Autogenerar código si no viene ===== */
    IF @codigo IS NULL
    BEGIN
        DECLARE @next int;

        -- Genera PRD-001, PRD-002... basado en el max existente (simple)
        -- OJO: esto puede chocar con alta concurrencia; para Hidroverde en clase suele estar bien.
        SELECT @next = ISNULL(MAX(TRY_CONVERT(int, RIGHT(codigo, 3))), 0) + 1
        FROM dbo.Productos
        WHERE codigo LIKE 'PRD-[0-9][0-9][0-9]';

        SET @codigo = CONCAT('PRD-', RIGHT(CONCAT('000', @next), 3));
    END
    ELSE
    BEGIN
        IF EXISTS (SELECT 1 FROM dbo.Productos WHERE codigo = @codigo)
            THROW 51024, 'Ya existe un producto con ese código.', 1;
    END

    BEGIN TRY
        BEGIN TRANSACTION;

        INSERT INTO dbo.Productos
        (
            codigo, variedad_id, unidad_id, nombre_producto, descripcion,
            precio_base, dias_caducidad, requiere_refrigeracion, imagen_url,
            activo, fecha_creacion, stock_minimo, peso_gramos
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