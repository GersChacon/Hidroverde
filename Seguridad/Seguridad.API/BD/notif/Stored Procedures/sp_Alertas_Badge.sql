CREATE   PROCEDURE [notif].[sp_Alertas_Badge]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT COUNT(*) AS badge_count
    FROM notif.Alerta
    WHERE estado = 'ACTIVA';
END