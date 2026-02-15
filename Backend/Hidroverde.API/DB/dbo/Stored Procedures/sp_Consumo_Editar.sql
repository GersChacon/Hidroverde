CREATE   PROCEDURE [dbo].[sp_Consumo_Editar]
    @consumo_id BIGINT,
    @nueva_cantidad DECIMAL(18,4),
    @nueva_fecha_consumo DATETIME2(0),
    @empleado_id INT,
    @notas NVARCHAR(500) = NULL,
    @motivo_cambio NVARCHAR(200) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRAN;

        IF NOT EXISTS (SELECT 1 FROM dbo.Consumos WHERE consumo_id=@consumo_id AND activo=1)
            THROW 51020, 'Consumo no existe o está inactivo.', 1;

        IF EXISTS (
            SELECT 1
            FROM dbo.Consumos co
            JOIN dbo.Ciclos c ON c.ciclo_id = co.ciclo_id
            JOIN dbo.Estados_Ciclo ec ON ec.estado_ciclo_id = c.estado_ciclo_id
            WHERE co.consumo_id=@consumo_id AND ec.es_activo=0
        )
            THROW 51021, 'No se permite editar consumos de ciclos inactivos.', 1;

        IF NOT EXISTS (SELECT 1 FROM dbo.Empleados WHERE empleado_id=@empleado_id AND activo=1)
            THROW 51022, 'Empleado inválido o inactivo.', 1;

        DECLARE @next_version INT =
        (
            SELECT ISNULL(MAX(version_no),0) + 1
            FROM dbo.Consumo_Version
            WHERE consumo_id=@consumo_id
        );

        UPDATE dbo.Consumo_Version
        SET es_actual = 0
        WHERE consumo_id=@consumo_id AND es_actual=1;

        INSERT INTO dbo.Consumo_Version(
            consumo_id, version_no, cantidad, fecha_consumo, notas,
            es_actual, registrado_por_empleado_id, motivo_cambio
        )
        VALUES (
            @consumo_id, @next_version, @nueva_cantidad, @nueva_fecha_consumo, @notas,
            1, @empleado_id, @motivo_cambio
        );

        COMMIT;
        SELECT @consumo_id AS consumo_id, @next_version AS version_no;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        THROW;
    END CATCH
END