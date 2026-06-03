CREATE PROCEDURE [dbo].[sp_TipoRecurso_ActualizarCosto]
    @tipo_recurso_id INT,
    @costo_unitario  DECIMAL(18,4)
AS
BEGIN
    SET NOCOUNT ON;

    IF @costo_unitario < 0
        THROW 51030, 'El costo unitario no puede ser negativo.', 1;

    IF NOT EXISTS (SELECT 1 FROM dbo.Tipos_Recurso WHERE tipo_recurso_id = @tipo_recurso_id AND activo = 1)
        THROW 51031, 'Tipo de recurso inválido o inactivo.', 1;

    UPDATE dbo.Tipos_Recurso
    SET costo_unitario = @costo_unitario
    WHERE tipo_recurso_id = @tipo_recurso_id;

    SELECT @tipo_recurso_id AS tipo_recurso_id;
END