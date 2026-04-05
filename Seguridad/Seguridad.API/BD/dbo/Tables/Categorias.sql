CREATE TABLE [dbo].[Categorias] (
    [categoria_id]         INT            IDENTITY (1, 1) NOT NULL,
    [tipo_cultivo_id]      INT            NOT NULL,
    [nombre]               NVARCHAR (100) NOT NULL,
    [descripcion]          NVARCHAR (MAX) NULL,
    [requiere_seguimiento] BIT            CONSTRAINT [DF_Categorias_Seg] DEFAULT ((0)) NOT NULL,
    [activa]               BIT            CONSTRAINT [DF_Categorias_Activa] DEFAULT ((1)) NOT NULL,
    [fecha_creacion]       DATETIME2 (0)  CONSTRAINT [DF_Categorias_FechaCreacion] DEFAULT (sysdatetime()) NOT NULL,
    CONSTRAINT [PK_Categorias] PRIMARY KEY CLUSTERED ([categoria_id] ASC),
    CONSTRAINT [FK_Categorias_TipoCultivo] FOREIGN KEY ([tipo_cultivo_id]) REFERENCES [dbo].[Tipos_Cultivo] ([tipo_cultivo_id])
);


GO
CREATE NONCLUSTERED INDEX [IX_Categorias_TipoCultivoId]
    ON [dbo].[Categorias]([tipo_cultivo_id] ASC);

