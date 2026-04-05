CREATE   PROCEDURE dbo.sp_Torres_Listar
AS
BEGIN
  SET NOCOUNT ON;

  SELECT
    torre_id AS TorreId,
    ubicacion_id AS UbicacionId,
    codigo_torre AS CodigoTorre,
    fila AS Fila,
    tipo_cultivo_id AS TipoCultivoId,
    capacidad_maxima_plantas AS CapacidadMaximaPlantas,
    activo AS Activo
  FROM dbo.Torres
  WHERE activo = 1
  ORDER BY fila, codigo_torre;
END