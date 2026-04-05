CREATE TABLE [dbo].[Plagas_Registro] (
    [registro_id]    INT            IDENTITY (1, 1) NOT NULL,
    [plaga_id]       INT            NOT NULL,
    [fecha_hallazgo] DATE           NOT NULL,
    [cantidad]       INT            NOT NULL,
    [comentario]     NVARCHAR (500) NULL,
    [empleado_id]    INT            NOT NULL,
    [fecha_registro] DATETIME2 (7)  CONSTRAINT [DF_PlagasRegistro_Fecha] DEFAULT (sysdatetime()) NOT NULL,
    CONSTRAINT [PK_Plagas_Registro] PRIMARY KEY CLUSTERED ([registro_id] ASC),
    CONSTRAINT [FK_PlagasRegistro_Empleados] FOREIGN KEY ([empleado_id]) REFERENCES [dbo].[Empleados] ([empleado_id]),
    CONSTRAINT [FK_PlagasRegistro_Plagas] FOREIGN KEY ([plaga_id]) REFERENCES [dbo].[Plagas] ([plaga_id])
);


GO
CREATE NONCLUSTERED INDEX [IX_PlagasRegistro_Plagas]
    ON [dbo].[Plagas_Registro]([plaga_id] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_PlagasRegistro_FechaHallazgo]
    ON [dbo].[Plagas_Registro]([fecha_hallazgo] ASC);

