CREATE TABLE [dbo].[Checklist_Tareas] (
    [tarea_id]          INT            IDENTITY (1, 1) NOT NULL,
    [tipo_cultivo_id]   INT            NULL,
    [orden]             INT            NOT NULL,
    [descripcion]       NVARCHAR (500) NOT NULL,
    [responsable_rol]   NVARCHAR (50)  NULL,
    [es_critica]        BIT            CONSTRAINT [DF_Checklist_Tareas_Critica] DEFAULT ((0)) NOT NULL,
    [activa]            BIT            CONSTRAINT [DF_Checklist_Tareas_Activa] DEFAULT ((1)) NOT NULL,
    [fecha_creacion]    DATETIME2 (0)  CONSTRAINT [DF_Checklist_Tareas_FechaCreacion] DEFAULT (sysdatetime()) NOT NULL,
    CONSTRAINT [PK_Checklist_Tareas] PRIMARY KEY CLUSTERED ([tarea_id] ASC),
    CONSTRAINT [FK_Checklist_Tareas_TipoCultivo] FOREIGN KEY ([tipo_cultivo_id]) REFERENCES [dbo].[Tipos_Cultivo] ([tipo_cultivo_id])
);
GO
CREATE NONCLUSTERED INDEX [IX_Checklist_Tareas_TipoCultivoId]
    ON [dbo].[Checklist_Tareas]([tipo_cultivo_id] ASC) WHERE ([tipo_cultivo_id] IS NOT NULL);