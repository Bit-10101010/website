var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

var serviceLock = new object();
var serviceState = new ServiceState(
    Name: "Bit Worker Service",
    Status: "stopped",
    LastAction: "initialized",
    LastUpdated: DateTimeOffset.UtcNow,
    StartedAt: null,
    RestartCount: 0,
    TasksProcessed: 0);
var serviceLog = new List<ServiceLogEntry>
{
    new(DateTimeOffset.UtcNow, "system", "Service controller initialized.")
};

ServiceSnapshot Snapshot()
{
    lock (serviceLock)
    {
        return CreateSnapshot(serviceState, serviceLog);
    }
}

ServiceSnapshot UpdateService(string action)
{
    lock (serviceLock)
    {
        var now = DateTimeOffset.UtcNow;

        serviceState = action switch
        {
            "start" when serviceState.Status == "running" => serviceState with
            {
                LastAction = "start_skipped",
                LastUpdated = now
            },
            "start" => serviceState with
            {
                Status = "running",
                LastAction = "start",
                LastUpdated = now,
                StartedAt = now,
                TasksProcessed = serviceState.TasksProcessed + 3
            },
            "stop" when serviceState.Status == "stopped" => serviceState with
            {
                LastAction = "stop_skipped",
                LastUpdated = now
            },
            "stop" => serviceState with
            {
                Status = "stopped",
                LastAction = "stop",
                LastUpdated = now,
                StartedAt = null
            },
            "restart" => serviceState with
            {
                Status = "running",
                LastAction = "restart",
                LastUpdated = now,
                StartedAt = now,
                RestartCount = serviceState.RestartCount + 1,
                TasksProcessed = serviceState.TasksProcessed + 5
            },
            _ => serviceState with
            {
                LastAction = "noop",
                LastUpdated = now
            }
        };

        serviceLog.Insert(0, new ServiceLogEntry(now, action, BuildLogMessage(serviceState.LastAction)));
        if (serviceLog.Count > 25)
        {
            serviceLog.RemoveRange(25, serviceLog.Count - 25);
        }

        return CreateSnapshot(serviceState, serviceLog);
    }
}

app.MapGet("/api/status", () =>
{
    var snapshot = Snapshot();

    return Results.Json(new
    {
        name = "Bit Platform API",
        version = "1.1.0",
        status = "ok",
        message = "Backend is running and service controls are available.",
        timestamp = DateTimeOffset.UtcNow,
        service = snapshot
    });
});

app.MapGet("/api/service", () => Results.Json(Snapshot()));
app.MapPost("/api/service/start", () => Results.Json(UpdateService("start")));
app.MapPost("/api/service/stop", () => Results.Json(UpdateService("stop")));
app.MapPost("/api/service/restart", () => Results.Json(UpdateService("restart")));

app.MapFallbackToFile("index.html");

app.Run();

static ServiceSnapshot CreateSnapshot(ServiceState state, IReadOnlyList<ServiceLogEntry> logs)
{
    var uptimeSeconds = state.StartedAt is null
        ? 0
        : (int)Math.Max(0, (DateTimeOffset.UtcNow - state.StartedAt.Value).TotalSeconds);

    return new ServiceSnapshot(
        state.Name,
        state.Status,
        state.LastAction,
        state.LastUpdated,
        state.StartedAt,
        uptimeSeconds,
        state.RestartCount,
        state.TasksProcessed,
        logs.Take(10).ToArray());
}

static string BuildLogMessage(string actionResult) => actionResult switch
{
    "start" => "Service started.",
    "start_skipped" => "Start requested while service was already running.",
    "stop" => "Service stopped.",
    "stop_skipped" => "Stop requested while service was already stopped.",
    "restart" => "Service restarted.",
    _ => "No operation executed."
};

internal sealed record ServiceState(
    string Name,
    string Status,
    string LastAction,
    DateTimeOffset LastUpdated,
    DateTimeOffset? StartedAt,
    int RestartCount,
    int TasksProcessed);

internal sealed record ServiceSnapshot(
    string Name,
    string Status,
    string LastAction,
    DateTimeOffset LastUpdated,
    DateTimeOffset? StartedAt,
    int UptimeSeconds,
    int RestartCount,
    int TasksProcessed,
    IReadOnlyList<ServiceLogEntry> Logs);

internal sealed record ServiceLogEntry(DateTimeOffset Timestamp, string Action, string Message);
