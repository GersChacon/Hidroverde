CREATE TABLE [dbo].[Evidencias] (
    [evidencia_id]       BIGINT         IDENTITY (1, 1) NOT NULL,
    [ciclo_checklist_id] BIGINT         NOT NULL,               -- Relación con la tarea completada
    [nombre_archivo]     NVARCHAR (255) NOT NULL,
    [ruta_archivo]       NVARCHAR (500) NOT NULL,
    [tipo_contenido]     NVARCHAR (100) NULL,                   -- MIME type
    [tamano_bytes]       INT            NULL,
    [notas]              NVARCHAR (500) NULL,
    [subido_por]         INT            NOT NULL,
    [fecha_subida]       DATETIME2 (0)  CONSTRAINT [DF_Evidencias_FechaSubida] DEFAULT (sysdatetime()) NOT NULL,
    CONSTRAINT [PK_Evidencias] PRIMARY KEY CLUSTERED ([evidencia_id] ASC),
    CONSTRAINT [FK_Evidencias_CicloChecklist] FOREIGN KEY ([ciclo_checklist_id]) REFERENCES [dbo].[Ciclo_Checklist] ([ciclo_checklist_id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Evidencias_Empleado] FOREIGN KEY ([subido_por]) REFERENCES [dbo].[Empleados] ([empleado_id])
);

GO
CREATE NONCLUSTERED INDEX [IX_Evidencias_CicloChecklistId]
    ON [dbo].[Evidencias]([ciclo_checklist_id] ASC);