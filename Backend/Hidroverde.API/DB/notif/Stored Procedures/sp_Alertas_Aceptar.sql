
CREATE   PROCEDURE [notif].[sp_Alertas_Aceptar]
    @alerta_id INT,
    @empleado_id INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE notif.Alerta
    SET
        estado = 'ACEPTADA',
        fecha_aceptada = SYSDATETIME(),
        usuario_acepta_id = @empleado_id
    WHERE alerta_id = @alerta_id
      AND estado = 'ACTIVA';

    /* Resultado explícito para API */
    SELECT
        @@ROWCOUNT AS filas_afectadas,
        @alerta_id AS alerta_id,
        @empleado_id AS empleado_id;
END