(() => {
  const root = document.documentElement;
  const storage = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch {} }
  };
  const system = matchMedia('(prefers-color-scheme: dark)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let preference = storage.get('nioh-studio.theme') || 'system';
  if (!['light', 'dark', 'system'].includes(preference)) preference = 'system';
  const namespace = window.NiohStudio = window.NiohStudio || {};
  let pageReady = false, requestId = 0, viewTransition = null;
  let pendingTransition = Promise.resolve();
  const resolvedTheme = () => preference === 'system' ? (system.matches ? 'dark' : 'light') : preference;
  Object.defineProperty(namespace, 'themeTransitionFinished', {get: () => pendingTransition});
  function applyTheme(theme = resolvedTheme()) {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    const button = document.querySelector('.theme-toggle');
    if (button) {
      button.hidden = false;
      button.setAttribute('aria-pressed', String(theme === 'dark'));
      button.setAttribute('aria-label', namespace.i18n.t(theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'));
      button.title = button.getAttribute('aria-label');
    }
  }
  function dispatchTheme() {
    document.dispatchEvent(new CustomEvent('nioh:themechange', {detail: {preference, theme: root.dataset.theme}}));
  }
  async function animateTheme(theme, id) {
    if (typeof document.startViewTransition === 'function') {
      root.dataset.themeTransition = 'view';
      const transition = document.startViewTransition(() => {
        if (id !== requestId) return;
        applyTheme(theme); dispatchTheme();
      });
      viewTransition = transition;
      // Skipping an interrupted transition can reject ready; it is expected.
      transition.ready.catch(() => {});
      try { await transition.finished; } catch {}
      if (id === requestId) { viewTransition = null; delete root.dataset.themeTransition; }
      return;
    }
    // Static demo components share CSS variables; no image decoding or clones.
    root.dataset.themeTransition = 'colors';
    applyTheme(theme); dispatchTheme();
    await new Promise(resolve => setTimeout(resolve, 260));
    if (id === requestId) delete root.dataset.themeTransition;
  }
  function changeTheme() {
    const id = ++requestId, theme = resolvedTheme();
    viewTransition?.skipTransition(); viewTransition = null;
    delete root.dataset.themeTransition;
    if (!pageReady || reducedMotion.matches || document.visibilityState !== 'visible' || theme === root.dataset.theme) {
      applyTheme(theme); dispatchTheme(); pendingTransition = Promise.resolve(); return;
    }
    pendingTransition = animateTheme(theme, id);
  }
  namespace.setTheme = value => {
    if (!['light', 'dark', 'system'].includes(value)) return false;
    preference = value;
    storage.set('nioh-studio.theme', value);
    changeTheme();
    return true;
  };
  applyTheme();
  document.addEventListener('nioh:localechange', () => applyTheme());
  system.addEventListener('change', () => { if (preference === 'system') changeTheme(); });
  reducedMotion.addEventListener('change', event => { if (event.matches) changeTheme(); });

  function ready() {
    applyTheme();
    pageReady = true;
    namespace.i18n.refresh();
    document.querySelector('.theme-toggle')?.addEventListener('click', () => {
      namespace.setTheme(resolvedTheme() === 'dark' ? 'light' : 'dark');
    });
    const disclosures = [...document.querySelectorAll('.site-header details,.domestic-download')];
    disclosures.forEach(item => item.addEventListener('toggle', () => {
      if (item.open) disclosures.forEach(other => { if (other !== item) other.open = false; });
    }));
    document.addEventListener('click', event => {
      const path = event.composedPath();
      disclosures.forEach(item => { if (item.open && !path.includes(item)) item.open = false; });
    });
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      const open = disclosures.find(item => item.open);
      if (open) { open.open = false; open.querySelector('summary').focus(); }
    });
    document.querySelectorAll('.language-panel [data-locale]').forEach(button => button.addEventListener('click', event => {
      if(button.tagName==='A'&&(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey))return;
      event.preventDefault();
      if (namespace.i18n.setLocale(button.dataset.locale)) button.closest('details').open = false;
    }));
    document.querySelectorAll('[data-copy-download-password]').forEach(control=>control.addEventListener('click', async event => {
      const button = event.currentTarget;
      const password = button.closest('.download-channel').querySelector('[data-download-password]');
      const status = document.querySelector('[data-download-status]');
      try {
        await navigator.clipboard.writeText(password.textContent);
        button.textContent = namespace.i18n.t('已复制');
        status.textContent = namespace.i18n.t('密码已复制');
      } catch {
        const selection = getSelection(), range = document.createRange();
        range.selectNodeContents(password); selection.removeAllRanges(); selection.addRange(range);
        status.textContent = namespace.i18n.t('密码已选中，可以手动复制');
      }
      setTimeout(() => { button.textContent = namespace.i18n.t('复制'); }, 1800);
    }));
    document.querySelector('[data-copy-group]')?.addEventListener('click', async event => {
      const button = event.currentTarget;
      const number = document.querySelector('#qq-number');
      const status = document.querySelector('[data-copy-status]');
      try {
        await navigator.clipboard.writeText(number.textContent);
        button.textContent = namespace.i18n.t('已复制');
        status.textContent = namespace.i18n.t('群号已复制');
      } catch {
        const selection = getSelection(), range = document.createRange();
        range.selectNodeContents(number); selection.removeAllRanges(); selection.addRange(range);
        status.textContent = namespace.i18n.t('群号已选中，可以手动复制');
      }
      setTimeout(() => { button.textContent = namespace.i18n.t('复制'); }, 1800);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, {once: true});
  else ready();
})();
