CREATE TABLE [dbo].[Ciclo_Checklist] (
    [ciclo_checklist_id] BIGINT         IDENTITY (1, 1) NOT NULL,
    [ciclo_id]           INT            NOT NULL,
    [tarea_id]           INT            NOT NULL,
    [completado]         BIT            CONSTRAINT [DF_Ciclo_Checklist_Completado] DEFAULT ((0)) NOT NULL,
    [completado_por]     INT            NULL,
    [fecha_completado]   DATETIME2 (0)  NULL,
    [observaciones]      NVARCHAR (MAX) NULL,
    [fecha_creacion]     DATETIME2 (0)  CONSTRAINT [DF_Ciclo_Checklist_FechaCreacion] DEFAULT (sysdatetime()) NOT NULL,
    CONSTRAINT [PK_Ciclo_Checklist] PRIMARY KEY CLUSTERED ([ciclo_checklist_id] ASC),
    CONSTRAINT [FK_Ciclo_Checklist_Ciclo] FOREIGN KEY ([ciclo_id]) REFERENCES [dbo].[Ciclos] ([ciclo_id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Ciclo_Checklist_Tarea] FOREIGN KEY ([tarea_id]) REFERENCES [dbo].[Checklist_Tareas] ([tarea_id]),
    CONSTRAINT [FK_Ciclo_Checklist_Empleado] FOREIGN KEY ([completado_por]) REFERENCES [dbo].[Empleados] ([empleado_id])
);

GO
CREATE UNIQUE NONCLUSTERED INDEX [UX_Ciclo_Checklist_Ciclo_Tarea]
    ON [dbo].[Ciclo_Checklist]([ciclo_id] ASC, [tarea_id] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Ciclo_Checklist_Completado]
    ON [dbo].[Ciclo_Checklist]([completado] ASC, [fecha_completado] ASC);