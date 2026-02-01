CREATE TABLE [dbo].[Metodos_Pago] (
    [metodo_pago_id]        INT            IDENTITY (1, 1) NOT NULL,
    [codigo]                NVARCHAR (30)  NOT NULL,
    [nombre]                NVARCHAR (50)  NOT NULL,
    [requiere_confirmacion] BIT            CONSTRAINT [DF_Metodos_Pago_Conf] DEFAULT ((0)) NOT NULL,
    [comision_porcentaje]   DECIMAL (5, 2) CONSTRAINT [DF_Metodos_Pago_Com] DEFAULT ((0.00)) NOT NULL,
    [activo]                BIT            CONSTRAINT [DF_Metodos_Pago_Activo] DEFAULT ((1)) NOT NULL,
    CONSTRAINT [PK_Metodos_Pago] PRIMARY KEY CLUSTERED ([metodo_pago_id] ASC),
    CONSTRAINT [UQ_Metodos_Pago_Codigo] UNIQUE NONCLUSTERED ([codigo] ASC)
);

