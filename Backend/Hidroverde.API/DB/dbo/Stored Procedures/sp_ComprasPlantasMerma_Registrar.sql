CREATE PROCEDURE [dbo].[sp_ComprasPlantasMerma_Registrar]
    @compra_detalle_id     INT,
    @empleado_id           INT,
    @cantidad_merma        DECIMAL(18,2),
    @motivo                NVARCHAR(300) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        /* Validaciones */
        IF @compra_detalle_id IS NULL OR @compra_detalle_id <= 0
            RAISERROR('compra_detalle_id inválido.',16,1);

        IF @empleado_id IS NULL OR @empleado_id <= 0
            RAISERROR('empleado_id inválido.',16,1);

        IF @cantidad_merma IS NULL OR @cantidad_merma <= 0
            RAISERROR('cantidad_merma debe ser mayor a 0.',16,1);

        IF NOT EXISTS (
            SELECT 1 
            FROM dbo.Compras_Plantas_Detalle 
            WHERE compra_detalle_id = @compra_detalle_id
        )
            RAISERROR('El detalle de compra no existe.',16,1);

        IF NOT EXISTS (
            SELECT 1 
            FROM dbo.Empleados 
            WHERE empleado_id = @empleado_id AND activo = 1
        )
            RAISERROR('El empleado no existe o está inactivo.',16,1);

        /* Validación de merma no mayor a lo comprado */
        DECLARE @cantidad_comprada DECIMAL(18,2);
        DECLARE @merma_actual DECIMAL(18,2);

        SELECT 
            @cantidad_comprada = cantidad_comprada
        FROM dbo.Compras_Plantas_Detalle
        WHERE compra_detalle_id = @compra_detalle_id;

        SELECT 
            @merma_actual = ISNULL(SUM(cantidad_merma),0)
        FROM dbo.Compras_Plantas_Merma
        WHERE compra_detalle_id = @compra_detalle_id;

        IF (@cantidad_merma + @merma_actual) > @cantidad_comprada
            RAISERROR('La merma total no puede superar la cantidad comprada.',16,1);

        /* Inserción */
        INSERT INTO dbo.Compras_Plantas_Merma
        (
            compra_detalle_id,
            empleado_id,
            cantidad_merma,
            motivo
        )
        VALUES
        (
            @compra_detalle_id,
            @empleado_id,
            @cantidad_merma,
            @motivo
        );

        /* Respuesta */
        SELECT CAST(SCOPE_IDENTITY() AS INT) AS merma_id;

    END TRY
    BEGIN CATCH
        DECLARE @msg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@msg,16,1);
    END CATCH
END