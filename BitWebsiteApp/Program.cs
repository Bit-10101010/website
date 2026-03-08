var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGet("/api/status", () => Results.Json(new
{
    name = "Bit Platform API",
    version = "1.0.0",
    status = "ok",
    message = "Backend is running and connected.",
    timestamp = DateTimeOffset.UtcNow
}));

app.MapFallbackToFile("index.html");

app.Run();
