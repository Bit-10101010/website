const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('#site-nav');
const backendStatus = document.querySelector('#backend-status');

if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    siteNav.classList.toggle('open');
  });
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
  } catch (error) {
    backendStatus.textContent = 'Backend: OFFLINE · Start the app with `dotnet run`.';
    backendStatus.classList.add('is-offline');
  }
}

loadBackendStatus();
