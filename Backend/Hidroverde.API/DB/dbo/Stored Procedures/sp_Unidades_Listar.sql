CREATE   PROCEDURE dbo.sp_Unidades_Listar
AS
BEGIN
  SET NOCOUNT ON;

  SELECT
    unidad_id AS UnidadId,
    codigo    AS Codigo,
    nombre    AS Nombre
  FROM dbo.Unidades_Medida
  WHERE activo = 1
  ORDER BY nombre;
END