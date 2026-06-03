CREATE   PROCEDURE [dbo].[sp_Monitoreos_Listar]
    @ciclo_id    INT          = NULL,
    @fecha_desde DATETIME2(0) = NULL,
    @fecha_hasta DATETIME2(0) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        m.monitoreo_id             AS MonitoreoId,
        m.ciclo_id                 AS CicloId,
        m.responsable_id           AS ResponsableId,
        e.nombre + ' ' + e.apellidos AS ResponsableNombre,
        m.fecha_registro           AS FechaRegistro,
        m.ph_medido                AS PhMedido,
        m.ec_medido                AS EcMedido,
        m.temperatura_agua         AS TemperaturaAgua,
        m.temperatura_ambiente     AS TemperaturaAmbiente,
        m.humedad_ambiente         AS HumedadAmbiente,
        m.altura_promedio_plantas  AS AlturaPromedioPlantas,
        m.observaciones            AS Observaciones
    FROM dbo.Monitoreos m
    LEFT JOIN dbo.Empleados e ON e.empleado_id = m.responsable_id
    WHERE (@ciclo_id    IS NULL OR m.ciclo_id = @ciclo_id)
      AND (@fecha_desde IS NULL OR m.fecha_registro >= @fecha_desde)
      AND (@fecha_hasta IS NULL OR m.fecha_registro <= @fecha_hasta)
    ORDER BY m.fecha_registro DESC, m.monitoreo_id DESC;
END