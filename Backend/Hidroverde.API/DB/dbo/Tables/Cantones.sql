CREATE TABLE [dbo].[Cantones] (
    [canton_id]    INT            IDENTITY (1, 1) NOT NULL,
    [provincia_id] INT            NOT NULL,
    [nombre]       NVARCHAR (100) NOT NULL,
    [activo]       BIT            CONSTRAINT [DF_Cantones_Activo] DEFAULT ((1)) NOT NULL,
    CONSTRAINT [PK_Cantones] PRIMARY KEY CLUSTERED ([canton_id] ASC),
    CONSTRAINT [FK_Cantones_Provincias] FOREIGN KEY ([provincia_id]) REFERENCES [dbo].[Provincias] ([provincia_id])
);


GO
CREATE NONCLUSTERED INDEX [IX_Cantones_ProvinciaId]
    ON [dbo].[Cantones]([provincia_id] ASC);

