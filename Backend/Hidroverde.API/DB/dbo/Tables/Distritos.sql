CREATE TABLE [dbo].[Distritos] (
    [distrito_id]   INT            IDENTITY (1, 1) NOT NULL,
    [canton_id]     INT            NOT NULL,
    [codigo_postal] NVARCHAR (10)  NOT NULL,
    [nombre]        NVARCHAR (100) NOT NULL,
    [activo]        BIT            CONSTRAINT [DF_Distritos_Activo] DEFAULT ((1)) NOT NULL,
    CONSTRAINT [PK_Distritos] PRIMARY KEY CLUSTERED ([distrito_id] ASC),
    CONSTRAINT [FK_Distritos_Cantones] FOREIGN KEY ([canton_id]) REFERENCES [dbo].[Cantones] ([canton_id]),
    CONSTRAINT [UQ_Distritos_CodigoPostal] UNIQUE NONCLUSTERED ([codigo_postal] ASC)
);


GO
CREATE NONCLUSTERED INDEX [IX_Distritos_CantonId]
    ON [dbo].[Distritos]([canton_id] ASC);

