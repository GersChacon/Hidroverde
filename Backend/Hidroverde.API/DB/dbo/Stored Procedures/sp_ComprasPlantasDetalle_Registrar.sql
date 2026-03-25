CREATE PROCEDURE [dbo].[sp_ComprasPlantasDetalle_Registrar]
    @compra_id                 INT,
    @producto_id               INT,
    @unidad_id                 INT,
    @cantidad_comprada         DECIMAL(18,2),
    @costo_total_linea         DECIMAL(18,2),
    @observaciones             NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        /* Validaciones */
        IF @compra_id IS NULL OR @compra_id <= 0
            RAISERROR('compra_id inválido.',16,1);

        IF @producto_id IS NULL OR @producto_id <= 0
            RAISERROR('producto_id inválido.',16,1);

        IF @unidad_id IS NULL OR @unidad_id <= 0
            RAISERROR('unidad_id inválido.',16,1);

        IF @cantidad_comprada IS NULL OR @cantidad_comprada <= 0
            RAISERROR('cantidad_comprada debe ser mayor a 0.',16,1);

        IF @costo_total_linea IS NULL OR @costo_total_linea <= 0
            RAISERROR('costo_total_linea debe ser mayor a 0.',16,1);

        IF NOT EXISTS (SELECT 1 FROM dbo.Compras_Plantas WHERE compra_id = @compra_id AND activo = 1)
            RAISERROR('La compra no existe o está inactiva.',16,1);

        IF NOT EXISTS (SELECT 1 FROM dbo.Productos WHERE producto_id = @producto_id AND activo = 1)
            RAISERROR('El producto no existe o está inactivo.',16,1);

        IF NOT EXISTS (SELECT 1 FROM dbo.Unidades_Medida WHERE unidad_id = @unidad_id AND activo = 1)
            RAISERROR('La unidad no existe o está inactiva.',16,1);

        /* Cálculo */
        DECLARE @costo_unitario DECIMAL(18,4);
        SET @costo_unitario = @costo_total_linea / @cantidad_comprada;

        /* Inserción */
        INSERT INTO dbo.Compras_Plantas_Detalle
        (
            compra_id,
            producto_id,
            unidad_id,
            cantidad_comprada,
            costo_total_linea,
            costo_unitario_calculado,
            observaciones
        )
        VALUES
        (
            @compra_id,
            @producto_id,
            @unidad_id,
            @cantidad_comprada,
            @costo_total_linea,
            @costo_unitario,
            @observaciones
        );

        /* Respuesta */
        SELECT CAST(SCOPE_IDENTITY() AS INT) AS compra_detalle_id;
    END TRY
    BEGIN CATCH
        DECLARE @msg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@msg,16,1);
    END CATCH
END