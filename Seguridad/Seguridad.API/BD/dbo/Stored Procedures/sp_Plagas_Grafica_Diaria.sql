CREATE     PROCEDURE [dbo].[sp_Plagas_Grafica_Diaria]
    @fecha_desde DATE = NULL,
    @fecha_hasta DATE = NULL,
    @plaga_id INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        r.fecha_hallazgo AS periodo,
        r.plaga_id,
        p.nombre AS plaga_nombre,
        SUM(r.cantidad) AS total_cantidad,
        COUNT(1) AS total_incidencias
    FROM dbo.Plagas_Registro r
    INNER JOIN dbo.Plagas p ON p.plaga_id = r.plaga_id
    WHERE
        (@fecha_desde IS NULL OR r.fecha_hallazgo >= @fecha_desde)
        AND (@fecha_hasta IS NULL OR r.fecha_hallazgo <= @fecha_hasta)
        AND (@plaga_id IS NULL OR r.plaga_id = @plaga_id)
    GROUP BY
        r.fecha_hallazgo,
        r.plaga_id,
        p.nombre
    ORDER BY
        r.fecha_hallazgo ASC,
        p.nombre ASC;
END