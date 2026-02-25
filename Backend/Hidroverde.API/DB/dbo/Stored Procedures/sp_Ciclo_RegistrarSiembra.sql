CREATE   PROCEDURE [dbo].[sp_Ciclo_RegistrarSiembra]
    @producto_id INT,
    @variedad_id INT,
    @torre_id INT,
    @estado_ciclo_codigo NVARCHAR(30), -- SIEMBRA, por ejemplo
    @fecha_siembra DATE,
    @fecha_cosecha_estimada DATE,
    @cantidad_plantas INT,
    @responsable_id INT,
    @lote_semilla NVARCHAR(100) = NULL,
    @notas NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @cantidad_plantas IS NULL OR @cantidad_plantas <= 0
        THROW 50001, 'La cantidad_plantas debe ser mayor a 0.', 1;

    DECLARE @estado_ciclo_id INT =
        (SELECT estado_ciclo_id FROM dbo.Estados_Ciclo WHERE codigo = @estado_ciclo_codigo AND activo = 1);

    IF @estado_ciclo_id IS NULL
        THROW 50002, 'Estado de ciclo inválido.', 1;

    DECLARE @capacidad INT = (SELECT capacidad_maxima_plantas FROM dbo.Torres WHERE torre_id = @torre_id AND activo = 1);
    IF @capacidad IS NULL
        THROW 50003, 'Torre inválida o inactiva.', 1;

    -- Ocupado actual: suma de ciclos activos
    DECLARE @ocupado INT =
    (
        SELECT ISNULL(SUM(c.cantidad_plantas), 0)
        FROM dbo.Ciclos c
        JOIN dbo.Estados_Ciclo ec ON ec.estado_ciclo_id = c.estado_ciclo_id
        WHERE c.torre_id = @torre_id
          AND ec.es_activo = 1
    );

    IF (@ocupado + @cantidad_plantas) > @capacidad
        THROW 50004, 'No se puede plantar: excede la capacidad de la torre.', 1;

    INSERT INTO dbo.Ciclos
    (
        producto_id, variedad_id, torre_id, estado_ciclo_id,
        fecha_siembra, fecha_cosecha_estimada,
        cantidad_plantas, responsable_id,
        lote_semilla, notas
    )
    VALUES
    (
        @producto_id, @variedad_id, @torre_id, @estado_ciclo_id,
        @fecha_siembra, @fecha_cosecha_estimada,
        @cantidad_plantas, @responsable_id,
        @lote_semilla, @notas
    );

    SELECT CAST(SCOPE_IDENTITY() AS INT) AS ciclo_id_creado;
END