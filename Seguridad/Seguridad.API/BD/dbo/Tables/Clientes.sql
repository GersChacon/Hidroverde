CREATE TABLE [dbo].[Clientes] (
    [cliente_id]      INT            IDENTITY (1, 1) NOT NULL,
    [tipo_cliente_id] INT            NOT NULL,
    [cedula_ruc]      NVARCHAR (20)  NULL,
    [nombre]          NVARCHAR (50)  NOT NULL,
    [apellidos]       NVARCHAR (50)  NULL,
    [telefono]        NVARCHAR (20)  NOT NULL,
    [email]           NVARCHAR (100) NOT NULL,
    [fecha_registro]  DATETIME2 (0)  CONSTRAINT [DF_Clientes_FechaRegistro] DEFAULT (sysdatetime()) NOT NULL,
    [notas]           NVARCHAR (MAX) NULL,
    [activo]          BIT            CONSTRAINT [DF_Clientes_Activo] DEFAULT ((1)) NOT NULL,
    [fecha_creacion]  DATETIME2 (0)  CONSTRAINT [DF_Clientes_FechaCreacion] DEFAULT (sysdatetime()) NOT NULL,
    CONSTRAINT [PK_Clientes] PRIMARY KEY CLUSTERED ([cliente_id] ASC),
    CONSTRAINT [FK_Clientes_TiposCliente] FOREIGN KEY ([tipo_cliente_id]) REFERENCES [dbo].[Tipos_Cliente] ([tipo_cliente_id]),
    CONSTRAINT [UQ_Clientes_Cedula] UNIQUE NONCLUSTERED ([cedula_ruc] ASC)
);


GO
CREATE NONCLUSTERED INDEX [IX_Clientes_TipoClienteId]
    ON [dbo].[Clientes]([tipo_cliente_id] ASC);


GO
CREATE UNIQUE NONCLUSTERED INDEX [UX_Clientes_Email]
    ON [dbo].[Clientes]([email] ASC);

