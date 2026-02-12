using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Flujo;
using DA;
using DA.Repositorios;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<IRepositorioDapper, RepositorioDapper>();

builder.Services.AddScoped<IUnidadMedidaDA, UnidadMedidaDA>();
builder.Services.AddScoped<IUnidadMedidaFlujo, UnidadMedidaFlujo>();
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
builder.Services.AddScoped<IRepositorioDapper, RepositorioDapper>();

builder.Services.AddScoped<ICiclosDA, CiclosDA>();
builder.Services.AddScoped<ITiposRecursoDA, TiposRecursoDA>();
builder.Services.AddScoped<IConsumosDA, ConsumosDA>();
builder.Services.AddScoped<IConsumosDA, ConsumosDA>();

builder.Services.AddScoped<ICiclosFlujo, CiclosFlujo>();
builder.Services.AddScoped<ITiposRecursoFlujo, TiposRecursoFlujo>();
builder.Services.AddScoped<IConsumosFlujo, ConsumosFlujo>();

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
