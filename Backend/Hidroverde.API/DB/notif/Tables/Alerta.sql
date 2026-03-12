CREATE TABLE [notif].[Alerta] (
    [alerta_id]           INT            IDENTITY (1, 1) NOT NULL,
    [tipo_alerta]         VARCHAR (30)   NOT NULL,
    [producto_id]         INT            NOT NULL,
    [estado]              VARCHAR (15)   NOT NULL,
    [fecha_creacion]      DATETIME2 (0)  CONSTRAINT [DF_Alerta_FechaCreacion] DEFAULT (sysdatetime()) NOT NULL,
    [fecha_aceptada]      DATETIME2 (0)  NULL,
    [usuario_acepta_id]   INT            NULL,
    [mensaje]             NVARCHAR (400) NOT NULL,
    [snapshot_disponible] INT            NOT NULL,
    [snapshot_minimo]     INT            NOT NULL,
    [rearmado_en]         DATETIME2 (0)  NULL,
    CONSTRAINT [PK_Alerta] PRIMARY KEY CLUSTERED ([alerta_id] ASC),
    CONSTRAINT [CK_Alerta_Estado] CHECK ([estado]='ACEPTADA' OR [estado]='ACTIVA'),
    CONSTRAINT [CK_Alerta_Tipo] CHECK ([tipo_alerta]='STOCK_BAJO'),
    CONSTRAINT [FK_Alerta_Empleados_Acepta] FOREIGN KEY ([usuario_acepta_id]) REFERENCES [dbo].[Empleados] ([empleado_id]),
    CONSTRAINT [FK_Alerta_Productos] FOREIGN KEY ([producto_id]) REFERENCES [dbo].[Productos] ([producto_id]) ON DELETE CASCADE
);




GO
CREATE UNIQUE NONCLUSTERED INDEX [UX_Alerta_TipoProducto_Activa]
    ON [notif].[Alerta]([tipo_alerta] ASC, [producto_id] ASC) WHERE ([estado]='ACTIVA');

