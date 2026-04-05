
CREATE PROCEDURE [dbo].[sp_Consumo_Registrar]
    @ciclo_id INT = NULL,
    @tipo_recurso_id INT,
    @cantidad DECIMAL(18,4),
    @fecha_consumo DATETIME2(0),
    @periodicidad_codigo NVARCHAR(20) = N'UNICO',
    @empleado_id INT,
    @notas NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRAN;

        SET @periodicidad_codigo = UPPER(LTRIM(RTRIM(ISNULL(@periodicidad_codigo, N'UNICO'))));

        IF @periodicidad_codigo NOT IN (N'UNICO', N'SEMANAL', N'MENSUAL')
            THROW 51013, 'Periodicidad inválida. Use UNICO, SEMANAL o MENSUAL.', 1;

        IF @cantidad <= 0
            THROW 51014, 'La cantidad debe ser mayor a 0.', 1;

        IF NOT EXISTS (
            SELECT 1
            FROM dbo.Tipos_Recurso
            WHERE tipo_recurso_id = @tipo_recurso_id
              AND activo = 1
        )
            THROW 51011, 'Tipo de recurso inválido o inactivo.', 1;

        IF NOT EXISTS (
            SELECT 1
            FROM dbo.Empleados
            WHERE empleado_id = @empleado_id
              AND activo = 1
        )
            THROW 51012, 'Empleado inválido o inactivo.', 1;

        -- Solo validar ciclo si viene informado
        IF @ciclo_id IS NOT NULL
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM dbo.Ciclos c
                JOIN dbo.Estados_Ciclo ec
                    ON ec.estado_ciclo_id = c.estado_ciclo_id
                WHERE c.ciclo_id = @ciclo_id
                  AND ec.es_activo = 1
            )
                THROW 51010, 'Solo se permiten consumos en ciclos activos.', 1;
        END

        INSERT INTO dbo.Consumos
        (
            ciclo_id,
            tipo_recurso_id,
            periodicidad_codigo,
            creado_por_empleado_id
        )
        VALUES
        (
            @ciclo_id,
            @tipo_recurso_id,
            @periodicidad_codigo,
            @empleado_id
        );

        DECLARE @consumo_id BIGINT = SCOPE_IDENTITY();

        INSERT INTO dbo.Consumo_Version
        (
            consumo_id,
            version_no,
            cantidad,
            fecha_consumo,
            notas,
            es_actual,
            registrado_por_empleado_id,
            motivo_cambio
        )
        VALUES
        (
            @consumo_id,
            1,
            @cantidad,
            @fecha_consumo,
            @notas,
            1,
            @empleado_id,
            N'Registro inicial'
        );

        COMMIT;
        SELECT @consumo_id AS consumo_id;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK;
        THROW;
    END CATCH
END