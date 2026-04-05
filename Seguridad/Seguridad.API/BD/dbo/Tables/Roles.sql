CREATE TABLE [dbo].[Roles] (
    [rol_id]       INT            IDENTITY (1, 1) NOT NULL,
    [codigo]       NVARCHAR (30)  NOT NULL,
    [nombre]       NVARCHAR (50)  NOT NULL,
    [nivel_acceso] INT            NULL,
    [descripcion]  NVARCHAR (MAX) NULL,
    [activo]       BIT            CONSTRAINT [DF_Roles_Activo] DEFAULT ((1)) NOT NULL,
    CONSTRAINT [PK_Roles] PRIMARY KEY CLUSTERED ([rol_id] ASC),
    CONSTRAINT [UQ_Roles_Codigo] UNIQUE NONCLUSTERED ([codigo] ASC)
);

