CREATE PROCEDURE [dbo].[sp_Consumo_Eliminar]
    @consumo_id BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.Consumos WHERE consumo_id = @consumo_id AND activo = 1)
        THROW 51040, 'Consumo no existe o ya está inactivo.', 1;

    -- Borrado lógico: se conserva el registro y todas sus versiones para auditoría.
    UPDATE dbo.Consumos
    SET activo = 0
    WHERE consumo_id = @consumo_id;

    SELECT @consumo_id AS consumo_id;
END