using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using DA;
using DA.Repositorios;
using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using DA;
using Flujo;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<IRepositorioDapper, RepositorioDapper>();

builder.Services.AddScoped<ITipoCultivoFlujo, TipoCultivoFlujo>();
builder.Services.AddScoped<ITipoCultivoDA, TipoCultivoDA>();
builder.Services.AddScoped<ICategoriaFlujo, CategoriaFlujo>();
builder.Services.AddScoped<ICategoriaDA, CategoriaDA>();
builder.Services.AddScoped<IVariedadFlujo, VariedadFlujo>();
builder.Services.AddScoped<IVariedadDA, VariedadDA>();
builder.Services.AddScoped<IProductoFlujo, ProductoFlujo>();
builder.Services.AddScoped<IProductoDA, ProductoDA>();
builder.Services.AddScoped<IAlertasDA, AlertasDA>();
builder.Services.AddScoped<IAlertasFlujo, AlertasFlujo>();
builder.Services.AddScoped<IEstadoVentaDA, EstadoVentaDA>();
builder.Services.AddScoped<IEstadoVentaFlujo, EstadoVentaFlujo>();
builder.Services.AddScoped<ITipoEntregaDA, TipoEntregaDA>();
builder.Services.AddScoped<ITipoEntregaFlujo, TipoEntregaFlujo>();

builder.Services.AddScoped<ICiclosDA, CiclosDA>();
builder.Services.AddScoped<ITiposRecursoDA, TiposRecursoDA>();
builder.Services.AddScoped<IConsumosDA, ConsumosDA>();
builder.Services.AddScoped<IConsumosDA, ConsumosDA>();
builder.Services.AddScoped<ICiclosFlujo, CiclosFlujo>();
builder.Services.AddScoped<ITiposRecursoFlujo, TiposRecursoFlujo>();
builder.Services.AddScoped<IInventarioDA, InventarioDA>();
builder.Services.AddScoped<IInventarioFlujo, InventarioFlujo>();
builder.Services.AddScoped<IProveedoresDA, ProveedoresDA>();
builder.Services.AddScoped<IProveedoresFlujo, ProveedoresFlujo>();
builder.Services.AddScoped<IMetodoPagoDA, MetodoPagoDA>();
builder.Services.AddScoped<IMetodoPagoFlujo, MetodoPagoFlujo>();
builder.Services.AddScoped<IRolDA, RolDA>();
builder.Services.AddScoped<IRolFlujo, RolFlujo>();
builder.Services.AddScoped<ITipoClienteDA, TipoClienteDA>();
builder.Services.AddScoped<ITipoClienteFlujo, TipoClienteFlujo>();
builder.Services.AddScoped<IEstadoPagoDA, EstadoPagoDA>();
builder.Services.AddScoped<IEstadoPagoFlujo, EstadoPagoFlujo>();
builder.Services.AddScoped<IEmpleadoDA, EmpleadoDA>();
builder.Services.AddScoped<IEmpleadoFlujo, EmpleadoFlujo>();
builder.Services.AddScoped<IClienteDA, ClienteDA>();
builder.Services.AddScoped<IClienteFlujo, ClienteFlujo>();
builder.Services.AddScoped<IVentaDA, VentaDA>();
builder.Services.AddScoped<IVentaFlujo, VentaFlujo>();
builder.Services.AddScoped<IProveedoresFlujo, ProveedoresFlujo>();

// Después de builder.Services.AddControllers();

Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true; // <-- aquí
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// 👉 IMPORTANTE: archivos estáticos primero
app.UseDefaultFiles(); // permite que / cargue index.html
app.UseStaticFiles();  // habilita wwwroot

app.UseAuthorization();

app.MapControllers();

app.Run();
