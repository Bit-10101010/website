const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('#site-nav');
const backendStatus = document.querySelector('#backend-status');

const serviceName = document.querySelector('#service-name');
const serviceState = document.querySelector('#service-state');
const serviceLastAction = document.querySelector('#service-last-action');
const serviceUptime = document.querySelector('#service-uptime');
const serviceRestarts = document.querySelector('#service-restarts');
const serviceTasks = document.querySelector('#service-tasks');
const serviceLog = document.querySelector('#service-log');
const consoleFeedback = document.querySelector('#console-feedback');

const startButton = document.querySelector('#start-service');
const stopButton = document.querySelector('#stop-service');
const restartButton = document.querySelector('#restart-service');
const refreshButton = document.querySelector('#refresh-service');

if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    siteNav.classList.toggle('open');
  });
}

function formatUptime(seconds) {
  if (!Number.isFinite(seconds)) {
    return '0s';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  return `${remainingSeconds}s`;
}

function renderServiceState(data) {
  if (!data) {
    return;
  }

  serviceName.textContent = data.name ?? 'Bit Worker Service';
  serviceLastAction.textContent = data.lastAction ?? '—';
  serviceUptime.textContent = formatUptime(data.uptimeSeconds ?? 0);
  serviceRestarts.textContent = String(data.restartCount ?? 0);
  serviceTasks.textContent = String(data.tasksProcessed ?? 0);

  const normalizedStatus = (data.status ?? 'unknown').toLowerCase();
  serviceState.textContent = normalizedStatus;
  serviceState.className = 'status-pill';

  if (normalizedStatus === 'running') {
    serviceState.classList.add('status-pill--running');
  } else if (normalizedStatus === 'stopped') {
    serviceState.classList.add('status-pill--stopped');
  } else {
    serviceState.classList.add('status-pill--unknown');
  }

  const logs = Array.isArray(data.logs) ? data.logs : [];
  serviceLog.innerHTML = '';
  if (!logs.length) {
    const li = document.createElement('li');
    li.textContent = 'No activity yet.';
    serviceLog.appendChild(li);
    return;
  }

  logs.forEach((entry) => {
    const li = document.createElement('li');
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    li.textContent = `[${timestamp}] ${entry.message}`;
    serviceLog.appendChild(li);
  });
}

async function fetchServiceState() {
  const response = await fetch('/api/service');
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

async function postServiceAction(action) {
  const response = await fetch(`/api/service/${action}`, {
    method: 'POST'
  });

  if (!response.ok) {
    throw new Error(`Action ${action} failed with status ${response.status}`);
  }

  return response.json();
}

async function loadBackendStatus() {
  if (!backendStatus) {
    return;
  }

  try {
    const response = await fetch('/api/status');

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();

    backendStatus.textContent = `Backend: ${data.status.toUpperCase()} · ${data.message}`;
    backendStatus.classList.add('is-online');

    if (data.service) {
      renderServiceState(data.service);
    }
  } catch (error) {
    backendStatus.textContent = 'Backend: OFFLINE · Start the app with `dotnet run`.';
    backendStatus.classList.add('is-offline');
  }
}

async function refreshService() {
  try {
    const data = await fetchServiceState();
    renderServiceState(data);
    consoleFeedback.textContent = 'Service state refreshed.';
  } catch (error) {
    consoleFeedback.textContent = 'Could not refresh service state.';
  }
}

async function runAction(action, successMessage) {
  try {
    const data = await postServiceAction(action);
    renderServiceState(data);
    consoleFeedback.textContent = successMessage;
  } catch (error) {
    consoleFeedback.textContent = `Action failed: ${action}.`;
  }
}

startButton?.addEventListener('click', () => runAction('start', 'Service started.'));
stopButton?.addEventListener('click', () => runAction('stop', 'Service stopped.'));
restartButton?.addEventListener('click', () => runAction('restart', 'Service restarted.'));
refreshButton?.addEventListener('click', refreshService);

loadBackendStatus();
refreshService();
