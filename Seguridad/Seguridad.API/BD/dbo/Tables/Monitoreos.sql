CREATE TABLE [dbo].[Monitoreos] (
    [monitoreo_id]            INT            IDENTITY (1, 1) NOT NULL,
    [ciclo_id]                INT            NOT NULL,
    [responsable_id]          INT            NOT NULL,
    [fecha_registro]          DATETIME2 (0)  CONSTRAINT [DF_Monitoreos_Fecha] DEFAULT (sysdatetime()) NOT NULL,
    [ph_medido]               DECIMAL (3, 1) NULL,
    [ec_medido]               DECIMAL (4, 2) NULL,
    [temperatura_agua]        DECIMAL (5, 2) NULL,
    [temperatura_ambiente]    DECIMAL (5, 2) NULL,
    [humedad_ambiente]        DECIMAL (5, 2) NULL,
    [altura_promedio_plantas] DECIMAL (5, 2) NULL,
    [observaciones]           NVARCHAR (MAX) NULL,
    CONSTRAINT [PK_Monitoreos] PRIMARY KEY CLUSTERED ([monitoreo_id] ASC),
    CONSTRAINT [FK_Monitoreos_Ciclo] FOREIGN KEY ([ciclo_id]) REFERENCES [dbo].[Ciclos] ([ciclo_id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Monitoreos_Resp] FOREIGN KEY ([responsable_id]) REFERENCES [dbo].[Empleados] ([empleado_id])
);


GO
CREATE NONCLUSTERED INDEX [IX_Monitoreos_CicloId]
    ON [dbo].[Monitoreos]([ciclo_id] ASC);

