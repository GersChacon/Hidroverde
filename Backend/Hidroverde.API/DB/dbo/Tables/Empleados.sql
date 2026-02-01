CREATE TABLE [dbo].[Empleados] (
    [empleado_id]        INT            IDENTITY (1, 1) NOT NULL,
    [rol_id]             INT            NOT NULL,
    [estado_empleado_id] INT            NOT NULL,
    [cedula]             NVARCHAR (20)  NOT NULL,
    [nombre]             NVARCHAR (100) NOT NULL,
    [apellidos]          NVARCHAR (100) NOT NULL,
    [telefono]           NVARCHAR (20)  NULL,
    [email]              NVARCHAR (100) NOT NULL,
    [fecha_nacimiento]   DATE           NULL,
    [fecha_contratacion] DATE           NOT NULL,
    [usuario_sistema]    NVARCHAR (50)  NULL,
    [clave_hash]         NVARCHAR (255) NULL,
    [activo]             BIT            CONSTRAINT [DF_Empleados_Activo] DEFAULT ((1)) NOT NULL,
    [fecha_creacion]     DATETIME2 (0)  CONSTRAINT [DF_Empleados_FechaCreacion] DEFAULT (sysdatetime()) NOT NULL,
    CONSTRAINT [PK_Empleados] PRIMARY KEY CLUSTERED ([empleado_id] ASC),
    CONSTRAINT [FK_Empleados_Estado] FOREIGN KEY ([estado_empleado_id]) REFERENCES [dbo].[Estados_Empleado] ([estado_empleado_id]),
    CONSTRAINT [FK_Empleados_Roles] FOREIGN KEY ([rol_id]) REFERENCES [dbo].[Roles] ([rol_id]),
    CONSTRAINT [UQ_Empleados_Cedula] UNIQUE NONCLUSTERED ([cedula] ASC),
    CONSTRAINT [UQ_Empleados_Email] UNIQUE NONCLUSTERED ([email] ASC),
    CONSTRAINT [UQ_Empleados_Usuario] UNIQUE NONCLUSTERED ([usuario_sistema] ASC)
);


GO
CREATE NONCLUSTERED INDEX [IX_Empleados_RolId]
    ON [dbo].[Empleados]([rol_id] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_Empleados_EstadoId]
    ON [dbo].[Empleados]([estado_empleado_id] ASC);

