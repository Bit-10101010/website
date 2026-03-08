# Bit website (C# hostable app)

This repository now includes a C# ASP.NET Core web app that can host the website directly across multiple .NET target frameworks, plus a browser-based Service Control Center GUI (start/stop/restart and activity logs).

## Project structure

- `BitWebsiteApp/Program.cs` - app startup, static file hosting, service-control API routes
- `BitWebsiteApp/wwwroot` - front-end assets (`index.html`, `styles.css`, `script.js`)
- `BitWebsiteApp/BitWebsiteApp.csproj` - multi-targeted .NET web app project file (from `.NET Core 1.0` through `.NET 11.0`)

## Supported target frameworks

- .NET Core 1.0 (`netcoreapp1.0`)
- .NET Core 1.1 (`netcoreapp1.1`)
- .NET Core 2.0 (`netcoreapp2.0`)
- .NET Core 2.1 (`netcoreapp2.1`)
- .NET Core 2.2 (`netcoreapp2.2`)
- .NET Core 3.0 (`netcoreapp3.0`)
- .NET Core 3.1 (`netcoreapp3.1`)
- .NET 5.0 (`net5.0`)
- .NET 6.0 (`net6.0`)
- .NET 7.0 (`net7.0`)
- .NET 8.0 (`net8.0`)
- .NET 9.0 (`net9.0`)
- .NET 10.0 (`net10.0`)
- .NET 11.0 (`net11.0`)

## Run locally

```bash
cd BitWebsiteApp
# Run using your installed SDK / default target
dotnet run

# Or run a specific framework
dotnet run -f netcoreapp1.0
dotnet run -f netcoreapp1.1
dotnet run -f netcoreapp2.0
dotnet run -f netcoreapp2.1
dotnet run -f netcoreapp2.2
dotnet run -f netcoreapp3.0
dotnet run -f netcoreapp3.1
dotnet run -f net5.0
dotnet run -f net6.0
dotnet run -f net7.0
dotnet run -f net8.0
dotnet run -f net9.0
dotnet run -f net10.0
dotnet run -f net11.0
```

Then open <http://localhost:5000> or the HTTPS URL shown in the console.

## API endpoint

- `GET /api/status` returns backend health/status JSON used by the front-end.
- `GET /api/service` returns the current service controller state and recent activity.
- `POST /api/service/start` starts the simulated service.
- `POST /api/service/stop` stops the simulated service.
- `POST /api/service/restart` restarts the simulated service.

## Host with your own C# app

You can:

1. Reference this project in your solution and run it as-is.
2. Or copy the `Program.cs` route/static hosting setup into your existing ASP.NET Core app.
3. Keep the `wwwroot` files to serve the UI and retain `/api/status` for health integration.
