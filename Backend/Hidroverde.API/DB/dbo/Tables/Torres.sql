CREATE TABLE [dbo].[Torres] (
    [torre_id]                    INT            IDENTITY (1, 1) NOT NULL,
    [ubicacion_id]                INT            NOT NULL,
    [codigo_torre]                NVARCHAR (50)  NOT NULL,
    [fila]                        NVARCHAR (3)   NULL,
    [tipo_cultivo_id]             INT            NOT NULL,
    [capacidad_maxima_plantas]    INT            NOT NULL,
    [fecha_instalacion]           DATE           NOT NULL,
    [fecha_ultimo_mantenimiento]  DATE           NULL,
    [fecha_proximo_mantenimiento] DATE           NULL,
    [activo]                      BIT            CONSTRAINT [DF_Torres_Activo] DEFAULT ((1)) NOT NULL,
    [notas]                       NVARCHAR (MAX) NULL,
    [fecha_creacion]              DATETIME2 (0)  CONSTRAINT [DF_Torres_FechaCreacion] DEFAULT (sysdatetime()) NOT NULL,
    CONSTRAINT [PK_Torres] PRIMARY KEY CLUSTERED ([torre_id] ASC),
    CONSTRAINT [FK_Torres_TipoCultivo] FOREIGN KEY ([tipo_cultivo_id]) REFERENCES [dbo].[Tipos_Cultivo] ([tipo_cultivo_id]),
    CONSTRAINT [FK_Torres_Ubicacion] FOREIGN KEY ([ubicacion_id]) REFERENCES [dbo].[Ubicaciones] ([ubicacion_id]),
    CONSTRAINT [UQ_Torres_Codigo] UNIQUE NONCLUSTERED ([codigo_torre] ASC)
);


GO
CREATE NONCLUSTERED INDEX [IX_Torres_UbicacionId]
    ON [dbo].[Torres]([ubicacion_id] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_Torres_TipoCultivoId]
    ON [dbo].[Torres]([tipo_cultivo_id] ASC);

