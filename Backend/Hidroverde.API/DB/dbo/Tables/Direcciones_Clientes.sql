CREATE TABLE [dbo].[Direcciones_Clientes] (
    [direccion_id]      INT            IDENTITY (1, 1) NOT NULL,
    [cliente_id]        INT            NOT NULL,
    [distrito_id]       INT            NOT NULL,
    [alias]             NVARCHAR (100) NULL,
    [direccion_exacta]  NVARCHAR (MAX) NOT NULL,
    [referencia]        NVARCHAR (MAX) NULL,
    [telefono_contacto] NVARCHAR (20)  NULL,
    [activa]            BIT            CONSTRAINT [DF_DirClientes_Activa] DEFAULT ((1)) NOT NULL,
    [fecha_creacion]    DATETIME2 (0)  CONSTRAINT [DF_DirClientes_FechaCreacion] DEFAULT (sysdatetime()) NOT NULL,
    CONSTRAINT [PK_Direcciones_Clientes] PRIMARY KEY CLUSTERED ([direccion_id] ASC),
    CONSTRAINT [FK_DirClientes_Clientes] FOREIGN KEY ([cliente_id]) REFERENCES [dbo].[Clientes] ([cliente_id]) ON DELETE CASCADE,
    CONSTRAINT [FK_DirClientes_Distritos] FOREIGN KEY ([distrito_id]) REFERENCES [dbo].[Distritos] ([distrito_id])
);


GO
CREATE NONCLUSTERED INDEX [IX_DirClientes_ClienteId]
    ON [dbo].[Direcciones_Clientes]([cliente_id] ASC);

