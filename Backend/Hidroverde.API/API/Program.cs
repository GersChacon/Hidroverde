using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Flujo;
using DA;
using DA.Repositorios;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
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


// Después de builder.Services.AddControllers();


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
