(function () {
  const STORAGE_KEY = "site-page-transition";
  const shell = document.querySelector("[data-transition-shell]");

  if (!shell) {
    return;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function normalizePath(pathname) {
    if (!pathname) {
      return "/";
    }

    return pathname.endsWith("/") ? pathname : `${pathname}/`;
  }

  function cleanupEntryClass(className) {
    window.setTimeout(() => {
      document.body.classList.remove(className);
    }, 520);
  }

  const pendingTransition = window.sessionStorage.getItem(STORAGE_KEY);
  if (pendingTransition === "zoom") {
    document.body.classList.add("is-entering-zoom");
    cleanupEntryClass("is-entering-zoom");
  }
  window.sessionStorage.removeItem(STORAGE_KEY);

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) {
      return;
    }

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      link.target && link.target !== "_self" ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const targetUrl = new URL(link.href, window.location.href);
    if (targetUrl.origin !== window.location.origin) {
      return;
    }

    const samePath = normalizePath(targetUrl.pathname) === normalizePath(window.location.pathname);
    if (samePath) {
      return;
    }

    if (reduceMotion.matches) {
      return;
    }

    event.preventDefault();
    window.sessionStorage.setItem(STORAGE_KEY, "zoom");
    document.body.classList.add("is-leaving-zoom");

    window.setTimeout(() => {
      window.location.href = targetUrl.href;
    }, 360);
  });
})();
