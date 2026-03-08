# Bit website (C# hostable app)

This repository now includes a C# ASP.NET Core web app that can host the website directly.

## Project structure

- `BitWebsiteApp/Program.cs` - app startup, static file hosting, and API routes
- `BitWebsiteApp/wwwroot` - front-end assets (`index.html`, `styles.css`, `script.js`)
- `BitWebsiteApp/BitWebsiteApp.csproj` - .NET web app project file

## Run locally

```bash
cd BitWebsiteApp
dotnet run
```

Then open <http://localhost:5000> or the HTTPS URL shown in the console.

## API endpoint

- `GET /api/status` returns backend health/status JSON used by the front-end.

## Host with your own C# app

You can:

1. Reference this project in your solution and run it as-is.
2. Or copy the `Program.cs` route/static hosting setup into your existing ASP.NET Core app.
3. Keep the `wwwroot` files to serve the UI and retain `/api/status` for health integration.
