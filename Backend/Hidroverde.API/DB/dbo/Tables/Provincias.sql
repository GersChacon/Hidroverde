CREATE TABLE [dbo].[Provincias] (
    [provincia_id] INT           IDENTITY (1, 1) NOT NULL,
    [codigo]       NVARCHAR (3)  NOT NULL,
    [nombre]       NVARCHAR (50) NOT NULL,
    [activo]       BIT           CONSTRAINT [DF_Provincias_Activo] DEFAULT ((1)) NOT NULL,
    CONSTRAINT [PK_Provincias] PRIMARY KEY CLUSTERED ([provincia_id] ASC),
    CONSTRAINT [UQ_Provincias_Codigo] UNIQUE NONCLUSTERED ([codigo] ASC)
);

