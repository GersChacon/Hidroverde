CREATE TABLE [dbo].[Plagas] (
    [plaga_id]       INT            IDENTITY (1, 1) NOT NULL,
    [nombre]         NVARCHAR (150) NOT NULL,
    [descripcion]    NVARCHAR (500) NULL,
    [activo]         BIT            CONSTRAINT [DF_Plagas_Activo] DEFAULT ((1)) NOT NULL,
    [fecha_creacion] DATETIME2 (7)  CONSTRAINT [DF_Plagas_FechaCreacion] DEFAULT (sysdatetime()) NOT NULL,
    CONSTRAINT [PK_Plagas] PRIMARY KEY CLUSTERED ([plaga_id] ASC)
);

