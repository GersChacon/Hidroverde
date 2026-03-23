CREATE TABLE [dbo].[Consumos] (
    [consumo_id]             BIGINT        IDENTITY (1, 1) NOT NULL,
    [ciclo_id]               INT           NULL,
    [tipo_recurso_id]        INT           NOT NULL,
    [activo]                 BIT           CONSTRAINT [DF_Consumos_Activo] DEFAULT ((1)) NOT NULL,
    [fecha_creacion]         DATETIME2 (0) CONSTRAINT [DF_Consumos_Fecha] DEFAULT (sysdatetime()) NOT NULL,
    [creado_por_empleado_id] INT           NOT NULL,
    [periodicidad_codigo]    NVARCHAR (20) CONSTRAINT [DF_Consumos_Periodicidad] DEFAULT ('UNICO') NOT NULL,
    CONSTRAINT [PK_Consumos] PRIMARY KEY CLUSTERED ([consumo_id] ASC),
    CONSTRAINT [FK_Consumos_Ciclos] FOREIGN KEY ([ciclo_id]) REFERENCES [dbo].[Ciclos] ([ciclo_id]),
    CONSTRAINT [FK_Consumos_Empleados] FOREIGN KEY ([creado_por_empleado_id]) REFERENCES [dbo].[Empleados] ([empleado_id]),
    CONSTRAINT [FK_Consumos_TiposRecurso] FOREIGN KEY ([tipo_recurso_id]) REFERENCES [dbo].[Tipos_Recurso] ([tipo_recurso_id])
);




GO
CREATE NONCLUSTERED INDEX [IX_Consumos_Ciclo]
    ON [dbo].[Consumos]([ciclo_id] ASC, [tipo_recurso_id] ASC)
    INCLUDE([activo], [fecha_creacion]);

