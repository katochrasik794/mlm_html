// ===============================
// PAGE FETCHING (Router)
// ===============================
const pageContent = document.getElementById('pageContent');
const navBtns = Array.from(document.querySelectorAll('.nav-link'));
let currentController = null;
const pageCache = new Map();

if (!pageContent) {
  throw new Error('#pageContent element not found. Cannot initialize router.');
}

async function fetchPageFragment(name, signal) {
  const url = `pages/${name}.html`;

  if (pageCache.has(url)) return pageCache.get(url);

  const res = await fetch(url, { headers: { 'X-Requested-With': 'fetch' }, signal });
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  const html = await res.text();
  pageCache.set(url, html);
  return html;
}

async function showPage(name, push = true) {
  const normalized = String(name || 'dashboard');

  if (currentController) {
    currentController.abort();
    currentController = null;
  }

  currentController = new AbortController();
  const { signal } = currentController;

  pageContent.setAttribute('aria-busy', 'true');
  pageContent.innerHTML = `<div class="text-slate-500 dark:text-slate-400">Loading ${escapeHtml(normalized)}…</div>`;
  pageContent.focus();

  try {
    const html = await fetchPageFragment(normalized, signal);
    if (signal.aborted) return;

    pageContent.innerHTML = html;
    pageContent.setAttribute('aria-busy', 'false');
    pageContent.focus();
    setActiveNav(normalized);

    const desiredHash = `#${normalized}`;
    if (push && history && history.pushState && location.hash !== desiredHash) {
      history.pushState({ page: normalized }, '', desiredHash);
    }
  } catch (err) {
    if (err.name === 'AbortError') return;

    console.error(err);
    pageContent.setAttribute('aria-busy', 'false');
    pageContent.innerHTML = `
      <div class="text-red-500">
        Could not load the page. Check the console and ensure the server is running.
        <div class="mt-2">
          <button id="retryBtn" class="px-3 py-1 rounded bg-violet-600 text-white hover:bg-violet-700">
            Retry
          </button>
        </div>
      </div>`;
    document.getElementById('retryBtn')?.addEventListener('click', () => showPage(normalized, push));
  } finally {
    currentController = null;
  }
}

function setActiveNav(name) {
  navBtns.forEach((btn) => {
    const matches = btn.dataset.page === name;
    btn.classList.toggle('active', matches);
    btn.classList.toggle('text-white', matches);
    btn.classList.toggle('bg-violet-600', matches);
    if (matches) {
      btn.setAttribute('aria-current', 'true');
    } else {
      btn.removeAttribute('aria-current');
    }
  });
}

navBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const page = btn.dataset.page;
    if (page) showPage(page, true);
  });

  btn.addEventListener('keydown', (e) => {
    if (['Enter', ' ', 'Spacebar'].includes(e.key)) {
      e.preventDefault();
      btn.click();
    }
  });
});

window.addEventListener('popstate', (ev) => {
  const page = (ev.state && ev.state.page) || location.hash.replace('#', '') || 'dashboard';
  showPage(page, false);
});

const initial = location.hash.replace('#', '') || 'dashboard';
showPage(initial, false);

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[m]);
}

// ===============================
// THEME TOGGLE FIXED
// ===============================
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

// Initialize theme on page load
(function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (savedTheme === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    // default is dark
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }
  refreshThemeIcon();
})();

function refreshThemeIcon() {
  if (!themeIcon) return;
  const isDark = document.documentElement.classList.contains('dark');
  themeIcon.innerHTML = isDark
    ? `<circle cx="12" cy="12" r="5"></circle>
       <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>`
    : `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    refreshThemeIcon();
  });
}

// Keep icon updated if class changes elsewhere
new MutationObserver(refreshThemeIcon).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['class'],
});


// ===============================
// DROPDOWN MENUS
// ===============================
document.querySelectorAll('[data-dropdown]').forEach((button) => {
  button.addEventListener('click', () => {
    const submenu = button.nextElementSibling;
    const arrow = button.querySelector('.dropdown-arrow');
    if (!submenu) return;

    submenu.classList.toggle('hidden');
    arrow?.classList.toggle('rotate-180');
  });
});

// ===============================


// ===============================
// SIDEBAR TOGGLE (Optional)
// ===============================
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('sidebarToggle');
const toggleIcon = document.getElementById('toggleIcon');

if (toggleBtn && sidebar) {
  toggleBtn.addEventListener('click', () => {
    const expanded = sidebar.classList.toggle('sidebar-expanded');

    if (expanded) {
      sidebar.style.width = '16rem'; // expanded
      if (toggleIcon)
        toggleIcon.innerHTML =
          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6" />'; // minus
    } else {
      sidebar.style.width = '4rem'; // collapsed
      if (toggleIcon)
        toggleIcon.innerHTML =
          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />'; // plus
    }
  });
}
