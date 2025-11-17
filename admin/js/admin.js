function setupUI() {
  // === Elements ===
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileSidebar = document.getElementById('mobileSidebar');
  const mobileBackdrop = document.getElementById('mobileSidebarBackdrop');
  const mobileClose = document.getElementById('mobileSidebarClose');

  // === Mobile Sidebar Open / Close ===
  function openMobileSidebar() {
    mobileSidebar?.classList.remove('hidden');
    mobileSidebar?.classList.remove('-translate-x-full');
    mobileBackdrop?.classList.remove('hidden');
  }

  function closeMobileSidebar() {
    mobileSidebar?.classList.add('hidden');
    mobileSidebar?.classList.add('-translate-x-full');
    mobileBackdrop?.classList.add('hidden');
  }

  mobileToggle?.addEventListener('click', openMobileSidebar);
  mobileClose?.addEventListener('click', closeMobileSidebar);
  mobileBackdrop?.addEventListener('click', closeMobileSidebar);

  // === Profile dropdown toggle ===
  const profileBtn = document.getElementById('profileBtn');
  const profileDropdown = document.getElementById('profileDropdown');

  profileBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    profileDropdown?.classList.toggle('hidden');
  });

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (
      profileBtn &&
      !profileBtn.contains(e.target) &&
      profileDropdown &&
      !profileDropdown.contains(e.target)
    ) {
      profileDropdown.classList.add('hidden');
    }
  });

  // === Highlight Active Sidebar Tab (desktop & mobile) ===
  const allSidebarLinks = document.querySelectorAll(
    '#sidebar .sidebar-link, #mobileSidebar .sidebar-link'
  );

  // Remove any pre-existing active states
  allSidebarLinks.forEach(l => l.classList.remove('active', 'text-blue-700', 'bg-gray-700'));

  allSidebarLinks.forEach(link => {
    link.addEventListener('click', function () {
      // Remove active state from all links
      allSidebarLinks.forEach(l => {
        l.classList.remove('active', 'text-purple-500', 'bg-gray-700');
        l.classList.add('text-white', 'hover:bg-gray-600');
      });

      // Add active state to clicked link
      this.classList.add('active', 'text-purple-500', 'bg-gray-700');
      this.classList.remove('text-white');

      // Save active link for persistence
      localStorage.setItem('activeSidebarLink', this.getAttribute('href'));

      // Close mobile sidebar
      closeMobileSidebar();
    });
  });

  // === Restore active link on reload or URL match ===
  const savedActiveHref = localStorage.getItem('activeSidebarLink');
  let activated = false;

  if (savedActiveHref) {
    allSidebarLinks.forEach(link => {
      if (link.getAttribute('href') === savedActiveHref) {
        link.classList.add('active', 'text-purple-500', 'bg-gray-700');
        link.classList.remove('text-white');
        activated = true;
      }
    });
  }

  // Auto-highlight based on current page URL if nothing saved
  if (!activated) {
    const currentPath = window.location.pathname.split('/').pop(); // e.g. "index.html"
    allSidebarLinks.forEach(link => {
      const linkPath = link.getAttribute('href');
      if (linkPath === currentPath || (linkPath === 'index.html' && currentPath === '')) {
        link.classList.add('active', 'text-purple-500', 'bg-gray-700');
        link.classList.remove('text-white');
      }
    });
  }
}

// Wait until components inserted
document.addEventListener("componentsLoaded", setupUI);

(function () {
  // helper selectors fetched when needed (elements are in DOM)
  function getEls() {
    return {
      btn: document.getElementById('themeToggle'),
      icon: document.getElementById('themeIcon')
    };
  }

  function isDark() {
    return document.documentElement.classList.contains('dark');
  }

  function refreshThemeIcon() {
    const { icon, btn } = getEls();
    if (!icon || !btn) return;

    // Update aria-pressed for screen readers
    btn.setAttribute('aria-pressed', String(isDark()));
    btn.setAttribute('aria-label', isDark() ? 'Switch to light theme' : 'Switch to dark theme');

    // Use simple inline paths for sun / moon
    if (isDark()) {
      // moon icon
      icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
    } else {
      // sun icon
      icon.innerHTML = '<circle cx="12" cy="12" r="4"></circle>' +
        '<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>';
    }
  }

  function applyTheme(theme) {
    try {
      if (theme === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.warn('applyTheme failed', e);
    }
    refreshThemeIcon();
  }

  function initTheme() {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') {
        applyTheme(saved);
        return;
      }
      // fallback to system
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        applyTheme('dark');
      } else {
        applyTheme('light');
      }
    } catch (e) {
      console.warn('initTheme error', e);
    }
  }

  // wire up click
  document.addEventListener('DOMContentLoaded', () => {
    const { btn } = getEls();
    initTheme();
    if (!btn) return;
    btn.addEventListener('click', () => {
      const next = isDark() ? 'light' : 'dark';
      applyTheme(next);
    });
  });

  // keep icon in sync if some other script toggles the class
  new MutationObserver(refreshThemeIcon).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
})();