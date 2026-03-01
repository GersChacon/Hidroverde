CREATE   PROCEDURE dbo.sp_Torres_Disponibilidad_Listar
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH Ocupacion AS (
        SELECT
            c.torre_id,
            SUM(c.cantidad_plantas) AS plantasOcupadas
        FROM dbo.Ciclos c
        WHERE c.fecha_cosecha_real IS NULL   -- ciclos en curso
        GROUP BY c.torre_id
    )
    SELECT
        t.torre_id AS TorreId,
        t.codigo_torre AS CodigoTorre,
        t.fila AS Fila,
        t.capacidad_maxima_plantas AS CapacidadMaximaPlantas,
        ISNULL(o.plantasOcupadas, 0) AS PlantasOcupadas,
        CASE
            WHEN t.capacidad_maxima_plantas - ISNULL(o.plantasOcupadas, 0) < 0 THEN 0
            ELSE (t.capacidad_maxima_plantas - ISNULL(o.plantasOcupadas, 0))
        END AS HuecosDisponibles
    FROM dbo.Torres t
    LEFT JOIN Ocupacion o ON o.torre_id = t.torre_id
    WHERE t.activo = 1
    ORDER BY t.fila, t.codigo_torre;
END