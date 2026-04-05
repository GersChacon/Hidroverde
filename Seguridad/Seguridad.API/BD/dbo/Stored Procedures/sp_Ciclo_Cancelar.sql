CREATE   PROCEDURE dbo.sp_Ciclo_Cancelar
  @ciclo_id INT,
  @usuario_id INT,
  @motivo NVARCHAR(MAX) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  -- Validar existe
  IF NOT EXISTS (SELECT 1 FROM dbo.Ciclos WHERE ciclo_id = @ciclo_id)
    THROW 52001, 'Ciclo no existe.', 1;

  -- No permitir cancelar si ya generó inventario (ya cosechado)
  IF EXISTS (SELECT 1 FROM dbo.Inventario_Actual WHERE ciclo_origen_id = @ciclo_id)
    THROW 52002, 'No se puede cancelar: el ciclo ya fue cosechado y generó inventario.', 1;

  DECLARE @estado_cancelado_id INT =
    (SELECT estado_ciclo_id FROM dbo.Estados_Ciclo WHERE codigo = N'CANCELADO' AND activo = 1);

  IF @estado_cancelado_id IS NULL
    THROW 52003, 'No existe el estado CANCELADO en Estados_Ciclo.', 1;

  UPDATE dbo.Ciclos
  SET estado_ciclo_id = @estado_cancelado_id,
      notas = COALESCE(@motivo, notas)
  WHERE ciclo_id = @ciclo_id;

  SELECT @ciclo_id AS ciclo_id_cancelado;
END