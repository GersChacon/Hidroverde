CREATE TABLE [dbo].[Proveedores] (
    [proveedor_id]   INT            IDENTITY (1, 1) NOT NULL,
    [nombre]         NVARCHAR (150) NOT NULL,
    [descripcion]    NVARCHAR (500) NULL,
    [correo]         NVARCHAR (254) NULL,
    [telefono]       NVARCHAR (30)  NULL,
    [activo]         BIT            CONSTRAINT [DF_Proveedores_activo] DEFAULT ((1)) NOT NULL,
    [fecha_creacion] DATETIME2 (0)  CONSTRAINT [DF_Proveedores_fecha] DEFAULT (sysdatetime()) NOT NULL,
    PRIMARY KEY CLUSTERED ([proveedor_id] ASC)
);


GO
CREATE UNIQUE NONCLUSTERED INDEX [UX_Proveedores_nombre]
    ON [dbo].[Proveedores]([nombre] ASC);

