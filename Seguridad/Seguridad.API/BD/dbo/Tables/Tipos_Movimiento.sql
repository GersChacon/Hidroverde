CREATE TABLE [dbo].[Tipos_Movimiento] (
    [tipo_movimiento_id]    INT            IDENTITY (1, 1) NOT NULL,
    [codigo]                NVARCHAR (30)  NOT NULL,
    [nombre]                NVARCHAR (50)  NOT NULL,
    [afecta_stock]          BIT            NOT NULL,
    [requiere_autorizacion] BIT            CONSTRAINT [DF_Tipos_Movimiento_Aut] DEFAULT ((0)) NOT NULL,
    [descripcion]           NVARCHAR (MAX) NULL,
    [activo]                BIT            CONSTRAINT [DF_Tipos_Movimiento_Activo] DEFAULT ((1)) NOT NULL,
    CONSTRAINT [PK_Tipos_Movimiento] PRIMARY KEY CLUSTERED ([tipo_movimiento_id] ASC),
    CONSTRAINT [UQ_Tipos_Movimiento_Codigo] UNIQUE NONCLUSTERED ([codigo] ASC)
);

