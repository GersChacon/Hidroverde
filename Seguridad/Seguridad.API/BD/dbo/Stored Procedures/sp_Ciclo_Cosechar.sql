

CREATE   PROCEDURE [dbo].[sp_Ciclo_Cosechar]
    @ciclo_id INT,
    @ubicacion_id INT,          -- la elige el usuario
    @estado_calidad_codigo NVARCHAR(30), -- OPTIMO/REGULAR/etc
    @usuario_id INT,            -- empleado que hace la acción
    @motivo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRAN;

        -- Validar ciclo
        DECLARE
            @producto_id INT,
            @cantidad_plantas INT,
            @estado_ciclo_actual_id INT,
            @codigo_producto NVARCHAR(30),
            @dias_caducidad INT;

        SELECT
            @producto_id = c.producto_id,
            @cantidad_plantas = c.cantidad_plantas,
            @estado_ciclo_actual_id = c.estado_ciclo_id
        FROM dbo.Ciclos c
        WHERE c.ciclo_id = @ciclo_id;

        IF @producto_id IS NULL
            THROW 51001, 'Ciclo no existe.', 1;

        -- No permitir cosechar dos veces (1 inventario por ciclo)
        IF EXISTS (SELECT 1 FROM dbo.Inventario_Actual WHERE ciclo_origen_id = @ciclo_id)
            THROW 51002, 'Este ciclo ya fue cosechado y ya generó inventario.', 1;

        -- Estado COSECHADO
        DECLARE @estado_cosechado_id INT =
            (SELECT estado_ciclo_id FROM dbo.Estados_Ciclo WHERE codigo = N'COSECHADO' AND activo = 1);

        IF @estado_cosechado_id IS NULL
            THROW 51003, 'No existe el estado COSECHADO en Estados_Ciclo.', 1;

        -- Permitir cosechar aunque esté activo, pero no si ya está cosechado/cancelado
        IF @estado_ciclo_actual_id = @estado_cosechado_id
            THROW 51004, 'El ciclo ya está en estado COSECHADO.', 1;

        -- Calidad
        DECLARE @estado_calidad_id INT =
            (SELECT estado_calidad_id FROM dbo.Estados_Calidad WHERE codigo = @estado_calidad_codigo AND activo = 1);

        IF @estado_calidad_id IS NULL
            THROW 51005, 'Estado de calidad inválido.', 1;

        -- Producto: código y días de caducidad para lote y fecha_caducidad
        SELECT
            @codigo_producto = p.codigo,
            @dias_caducidad = p.dias_caducidad
        FROM dbo.Productos p
        WHERE p.producto_id = @producto_id AND p.activo = 1;

        IF @codigo_producto IS NULL
            THROW 51006, 'Producto inválido o inactivo.', 1;

        -- Generar lote: CODIGO-PRODUCTO-MMDDYY (ej: LEC-001-012926)
        DECLARE @hoy DATE = CAST(SYSDATETIME() AS DATE);
DECLARE @lote NVARCHAR(100) =
    @codigo_producto + N'-' + FORMAT(@hoy, 'MMddyy') + N'-C' + CAST(@ciclo_id AS NVARCHAR(20));

        -- 1) Cerrar ciclo (libera capacidad al dejar de ser activo)
        UPDATE dbo.Ciclos
        SET estado_ciclo_id = @estado_cosechado_id,
            fecha_cosecha_real = @hoy
        WHERE ciclo_id = @ciclo_id;

        -- 2) Crear inventario vendible con lo plantado
        INSERT INTO dbo.Inventario_Actual
        (
            producto_id, ubicacion_id, estado_calidad_id,
            lote, cantidad_disponible,
            fecha_entrada, fecha_caducidad,
            ciclo_origen_id, notas
        )
        VALUES
        (
            @producto_id, @ubicacion_id, @estado_calidad_id,
            @lote, @cantidad_plantas,
            @hoy, DATEADD(DAY, @dias_caducidad, @hoy),
            @ciclo_id, @motivo
        );

        DECLARE @inventario_id INT = SCOPE_IDENTITY();

        -- 3) Registrar movimiento de inventario tipo ENTRADA (cosecha)
        DECLARE @tipo_entrada_id INT =
            (SELECT tipo_movimiento_id FROM dbo.Tipos_Movimiento WHERE codigo = N'ENTRADA' AND activo = 1);

        IF @tipo_entrada_id IS NULL
            THROW 51007, 'No existe tipo movimiento ENTRADA.', 1;

        INSERT INTO dbo.Movimientos_Inventario
        (
            inventario_id, producto_id, tipo_movimiento_id,
            ubicacion_destino_id, cantidad,
            motivo, usuario_id
        )
        VALUES
        (
            @inventario_id, @producto_id, @tipo_entrada_id,
            @ubicacion_id, @cantidad_plantas,
            ISNULL(@motivo, N'Cosecha de ciclo ' + CAST(@ciclo_id AS NVARCHAR(20))),
            @usuario_id
        );

        COMMIT;

        SELECT 
    @inventario_id AS InventarioIdCreado,
    @lote AS LoteGenerado;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        THROW;
    END CATCH
END