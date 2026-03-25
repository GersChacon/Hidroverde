CREATE PROCEDURE [dbo].[sp_ComprasPlantas_Registrar]
    @proveedor_id       INT,
    @empleado_id        INT,
    @numero_factura     NVARCHAR(50) = NULL,
    @fecha_compra       DATETIME2(0) = NULL,
    @total_factura      DECIMAL(18,2),
    @observaciones      NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        /* =========================
           Validaciones básicas
           ========================= */
        IF @proveedor_id IS NULL OR @proveedor_id <= 0
        BEGIN
            RAISERROR('El proveedor_id es obligatorio.', 16, 1);
            RETURN;
        END

        IF @empleado_id IS NULL OR @empleado_id <= 0
        BEGIN
            RAISERROR('El empleado_id es obligatorio.', 16, 1);
            RETURN;
        END

        IF @total_factura IS NULL OR @total_factura <= 0
        BEGIN
            RAISERROR('El total_factura debe ser mayor a 0.', 16, 1);
            RETURN;
        END

        IF NOT EXISTS
        (
            SELECT 1
            FROM [dbo].[Proveedores]
            WHERE [proveedor_id] = @proveedor_id
              AND [activo] = 1
        )
        BEGIN
            RAISERROR('El proveedor indicado no existe o está inactivo.', 16, 1);
            RETURN;
        END

        IF NOT EXISTS
        (
            SELECT 1
            FROM [dbo].[Empleados]
            WHERE [empleado_id] = @empleado_id
              AND [activo] = 1
        )
        BEGIN
            RAISERROR('El empleado indicado no existe o está inactivo.', 16, 1);
            RETURN;
        END

        IF @fecha_compra IS NULL
        BEGIN
            SET @fecha_compra = SYSDATETIME();
        END

        /* =========================
           Inserción
           ========================= */
        INSERT INTO [dbo].[Compras_Plantas]
        (
            [proveedor_id],
            [empleado_id],
            [numero_factura],
            [fecha_compra],
            [total_factura],
            [observaciones]
        )
        VALUES
        (
            @proveedor_id,
            @empleado_id,
            @numero_factura,
            @fecha_compra,
            @total_factura,
            @observaciones
        );

        /* =========================
           Respuesta
           ========================= */
        SELECT
            CAST(SCOPE_IDENTITY() AS INT) AS compra_id;
    END TRY
    BEGIN CATCH
        DECLARE @mensaje NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@mensaje, 16, 1);
    END CATCH
END