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

  function getPageKind(pathname) {
    return normalizePath(pathname).includes("/chemistry/") ? "chemistry" : "home";
  }

  function getTransitionType(targetUrl) {
    const currentKind = getPageKind(window.location.pathname);
    const targetKind = getPageKind(targetUrl.pathname);

    if (currentKind === targetKind) {
      return null;
    }

    return targetKind === "chemistry" ? "to-chemistry" : "to-home";
  }

  function cleanupEntryClass(className) {
    window.setTimeout(() => {
      document.body.classList.remove(className);
    }, 520);
  }

  const pendingTransition = window.sessionStorage.getItem(STORAGE_KEY);
  if (pendingTransition === "to-chemistry") {
    document.body.classList.add("is-entering-from-home");
    cleanupEntryClass("is-entering-from-home");
  } else if (pendingTransition === "to-home") {
    document.body.classList.add("is-entering-from-chemistry");
    cleanupEntryClass("is-entering-from-chemistry");
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

    const transitionType = getTransitionType(targetUrl);
    if (!transitionType || reduceMotion.matches) {
      return;
    }

    event.preventDefault();
    window.sessionStorage.setItem(STORAGE_KEY, transitionType);

    const leavingClass =
      transitionType === "to-chemistry" ? "is-leaving-to-chemistry" : "is-leaving-to-home";

    document.body.classList.add(leavingClass);

    window.setTimeout(() => {
      window.location.href = targetUrl.href;
    }, 360);
  });
})();
