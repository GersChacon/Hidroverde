CREATE     PROCEDURE [dbo].[sp_Plagas_Grafica]
    @fecha_desde DATE = NULL,
    @fecha_hasta DATE = NULL,
    @plaga_id INT = NULL,
    @agrupacion NVARCHAR(10) = 'DIA'  -- DIA | MES | ANIO
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        CASE 
            WHEN @agrupacion = 'ANIO'
                THEN DATEFROMPARTS(YEAR(r.fecha_hallazgo), 1, 1)

            WHEN @agrupacion = 'MES'
                THEN DATEFROMPARTS(YEAR(r.fecha_hallazgo), MONTH(r.fecha_hallazgo), 1)

            ELSE r.fecha_hallazgo
        END AS periodo,

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
        CASE 
            WHEN @agrupacion = 'ANIO'
                THEN DATEFROMPARTS(YEAR(r.fecha_hallazgo), 1, 1)

            WHEN @agrupacion = 'MES'
                THEN DATEFROMPARTS(YEAR(r.fecha_hallazgo), MONTH(r.fecha_hallazgo), 1)

            ELSE r.fecha_hallazgo
        END,
        r.plaga_id,
        p.nombre

    ORDER BY periodo ASC;
END