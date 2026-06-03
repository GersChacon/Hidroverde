CREATE PROCEDURE [dbo].[sp_Monitoreo_Registrar]
    @ciclo_id                INT,
    @responsable_id          INT,
    @ph_medido               DECIMAL(3,1)  = NULL,
    @ec_medido               DECIMAL(4,2)  = NULL,
    @temperatura_agua        DECIMAL(5,2)  = NULL,
    @temperatura_ambiente    DECIMAL(5,2)  = NULL,
    @humedad_ambiente        DECIMAL(5,2)  = NULL,
    @altura_promedio_plantas DECIMAL(5,2)  = NULL,
    @observaciones           NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.Ciclos WHERE ciclo_id = @ciclo_id)
        THROW 51050, 'El ciclo no existe.', 1;

    IF NOT EXISTS (SELECT 1 FROM dbo.Empleados WHERE empleado_id = @responsable_id AND activo = 1)
        THROW 51051, 'El responsable no existe o está inactivo.', 1;

    IF @ph_medido IS NOT NULL AND (@ph_medido < 0 OR @ph_medido > 14)
        THROW 51052, 'El pH debe estar entre 0 y 14.', 1;

    IF @humedad_ambiente IS NOT NULL AND (@humedad_ambiente < 0 OR @humedad_ambiente > 100)
        THROW 51053, 'La humedad ambiente debe estar entre 0 y 100.', 1;

    INSERT INTO dbo.Monitoreos (
        ciclo_id, responsable_id, ph_medido, ec_medido,
        temperatura_agua, temperatura_ambiente, humedad_ambiente,
        altura_promedio_plantas, observaciones
    )
    VALUES (
        @ciclo_id, @responsable_id, @ph_medido, @ec_medido,
        @temperatura_agua, @temperatura_ambiente, @humedad_ambiente,
        @altura_promedio_plantas, @observaciones
    );

    SELECT SCOPE_IDENTITY() AS monitoreo_id;
END