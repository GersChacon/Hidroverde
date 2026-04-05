CREATE TABLE [dbo].[Tipos_Recurso] (
    [tipo_recurso_id]        INT            IDENTITY (1, 1) NOT NULL,
    [codigo]                 NVARCHAR (30)  NOT NULL,
    [nombre]                 NVARCHAR (100) NOT NULL,
    [categoria]              NVARCHAR (30)  NOT NULL,
    [unidad]                 NVARCHAR (20)  NOT NULL,
    [activo]                 BIT            CONSTRAINT [DF_Tipos_Recurso_Activo] DEFAULT ((1)) NOT NULL,
    [fecha_creacion]         DATETIME2 (0)  CONSTRAINT [DF_Tipos_Recurso_Fecha] DEFAULT (sysdatetime()) NOT NULL,
    [creado_por_empleado_id] INT            NULL,
    CONSTRAINT [PK_Tipos_Recurso] PRIMARY KEY CLUSTERED ([tipo_recurso_id] ASC),
    CONSTRAINT [FK_Tipos_Recurso_Empleado] FOREIGN KEY ([creado_por_empleado_id]) REFERENCES [dbo].[Empleados] ([empleado_id])
);


GO
CREATE NONCLUSTERED INDEX [IX_Tipos_Recurso_Activo]
    ON [dbo].[Tipos_Recurso]([activo] ASC)
    INCLUDE([nombre], [categoria], [unidad]);


GO
CREATE UNIQUE NONCLUSTERED INDEX [UX_Tipos_Recurso_Codigo]
    ON [dbo].[Tipos_Recurso]([codigo] ASC);

