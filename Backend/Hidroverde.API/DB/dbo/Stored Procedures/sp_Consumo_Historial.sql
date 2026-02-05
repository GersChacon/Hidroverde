CREATE   PROCEDURE [dbo].[sp_Consumo_Historial]
    @consumo_id BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        consumo_version_id          AS ConsumoVersionId,
        consumo_id                  AS ConsumoId,
        version_no                  AS VersionNo,
        cantidad                    AS Cantidad,
        fecha_consumo               AS FechaConsumo,
        notas                       AS Notas,
        es_actual                   AS EsActual,
        fecha_registro              AS FechaRegistro,
        registrado_por_empleado_id  AS RegistradoPorEmpleadoId,
        motivo_cambio               AS MotivoCambio
    FROM dbo.Consumo_Version
    WHERE consumo_id = @consumo_id
    ORDER BY version_no DESC;
END