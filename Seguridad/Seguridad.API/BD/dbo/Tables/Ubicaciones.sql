CREATE TABLE [dbo].[Ubicaciones] (
    [ubicacion_id]         INT            IDENTITY (1, 1) NOT NULL,
    [tipo_ubicacion_id]    INT            NOT NULL,
    [codigo_ubicacion]     NVARCHAR (50)  NOT NULL,
    [nombre]               NVARCHAR (100) NOT NULL,
    [descripcion]          NVARCHAR (MAX) NULL,
    [capacidad_maxima]     INT            NULL,
    [temperatura_objetivo] DECIMAL (5, 2) NULL,
    [humedad_objetivo]     DECIMAL (5, 2) NULL,
    [responsable_id]       INT            NULL,
    [activa]               BIT            CONSTRAINT [DF_Ubicaciones_Activa] DEFAULT ((1)) NOT NULL,
    [fecha_creacion]       DATETIME2 (0)  CONSTRAINT [DF_Ubicaciones_FechaCreacion] DEFAULT (sysdatetime()) NOT NULL,
    CONSTRAINT [PK_Ubicaciones] PRIMARY KEY CLUSTERED ([ubicacion_id] ASC),
    CONSTRAINT [FK_Ubicaciones_Resp] FOREIGN KEY ([responsable_id]) REFERENCES [dbo].[Empleados] ([empleado_id]),
    CONSTRAINT [FK_Ubicaciones_Tipo] FOREIGN KEY ([tipo_ubicacion_id]) REFERENCES [dbo].[Tipos_Ubicacion] ([tipo_ubicacion_id]),
    CONSTRAINT [UQ_Ubicaciones_Codigo] UNIQUE NONCLUSTERED ([codigo_ubicacion] ASC)
);


GO
CREATE NONCLUSTERED INDEX [IX_Ubicaciones_RespId]
    ON [dbo].[Ubicaciones]([responsable_id] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_Ubicaciones_TipoId]
    ON [dbo].[Ubicaciones]([tipo_ubicacion_id] ASC);

