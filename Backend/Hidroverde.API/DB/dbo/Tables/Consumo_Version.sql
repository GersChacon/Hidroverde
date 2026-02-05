CREATE TABLE [dbo].[Consumo_Version] (
    [consumo_version_id]         BIGINT          IDENTITY (1, 1) NOT NULL,
    [consumo_id]                 BIGINT          NOT NULL,
    [version_no]                 INT             NOT NULL,
    [cantidad]                   DECIMAL (18, 4) NOT NULL,
    [fecha_consumo]              DATETIME2 (0)   NOT NULL,
    [notas]                      NVARCHAR (500)  NULL,
    [es_actual]                  BIT             NOT NULL,
    [fecha_registro]             DATETIME2 (0)   CONSTRAINT [DF_Consumo_Version_Fecha] DEFAULT (sysdatetime()) NOT NULL,
    [registrado_por_empleado_id] INT             NOT NULL,
    [motivo_cambio]              NVARCHAR (200)  NULL,
    CONSTRAINT [PK_Consumo_Version] PRIMARY KEY CLUSTERED ([consumo_version_id] ASC),
    CONSTRAINT [FK_ConsumoVersion_Consumo] FOREIGN KEY ([consumo_id]) REFERENCES [dbo].[Consumos] ([consumo_id]),
    CONSTRAINT [FK_ConsumoVersion_Empleado] FOREIGN KEY ([registrado_por_empleado_id]) REFERENCES [dbo].[Empleados] ([empleado_id])
);


GO
CREATE UNIQUE NONCLUSTERED INDEX [UX_ConsumoVersion_Consumo_Version]
    ON [dbo].[Consumo_Version]([consumo_id] ASC, [version_no] ASC);


GO
CREATE UNIQUE NONCLUSTERED INDEX [UX_ConsumoVersion_Actual]
    ON [dbo].[Consumo_Version]([consumo_id] ASC) WHERE ([es_actual]=(1));


GO
CREATE NONCLUSTERED INDEX [IX_ConsumoVersion_Fecha]
    ON [dbo].[Consumo_Version]([fecha_consumo] ASC)
    INCLUDE([consumo_id], [cantidad], [es_actual], [registrado_por_empleado_id]);

