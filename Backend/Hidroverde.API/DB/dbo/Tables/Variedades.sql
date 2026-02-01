CREATE TABLE [dbo].[Variedades] (
    [variedad_id]              INT            IDENTITY (1, 1) NOT NULL,
    [categoria_id]             INT            NOT NULL,
    [nombre_variedad]          NVARCHAR (100) NOT NULL,
    [descripcion]              NVARCHAR (MAX) NULL,
    [dias_germinacion]         INT            NOT NULL,
    [dias_cosecha]             INT            NOT NULL,
    [temperatura_minima]       DECIMAL (5, 2) NULL,
    [temperatura_maxima]       DECIMAL (5, 2) NULL,
    [ph_minimo]                DECIMAL (3, 1) NULL,
    [ph_maximo]                DECIMAL (3, 1) NULL,
    [ec_minimo]                DECIMAL (4, 2) NULL,
    [ec_maximo]                DECIMAL (4, 2) NULL,
    [instrucciones_especiales] NVARCHAR (MAX) NULL,
    [activa]                   BIT            CONSTRAINT [DF_Variedades_Activa] DEFAULT ((1)) NOT NULL,
    [fecha_creacion]           DATETIME2 (0)  CONSTRAINT [DF_Variedades_FechaCreacion] DEFAULT (sysdatetime()) NOT NULL,
    CONSTRAINT [PK_Variedades] PRIMARY KEY CLUSTERED ([variedad_id] ASC),
    CONSTRAINT [FK_Variedades_Categoria] FOREIGN KEY ([categoria_id]) REFERENCES [dbo].[Categorias] ([categoria_id])
);


GO
CREATE NONCLUSTERED INDEX [IX_Variedades_CategoriaId]
    ON [dbo].[Variedades]([categoria_id] ASC);

