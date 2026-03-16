(function () {
  const STORAGE_KEY = "site-page-transition";
  const shell = document.querySelector("[data-transition-shell]");
  const PAGE_ORDER = ["home", "chemistry", "fourierify"];

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
    const path = normalizePath(pathname);

    if (path.includes("/chemistry/")) {
      return "chemistry";
    }
    if (path.includes("/fourierify/")) {
      return "fourierify";
    }
    return "home";
  }

  function pageIndex(kind) {
    const index = PAGE_ORDER.indexOf(kind);
    return index === -1 ? 0 : index;
  }

  function getTransitionDirection(targetUrl) {
    const currentKind = getPageKind(window.location.pathname);
    const targetKind = getPageKind(targetUrl.pathname);

    if (currentKind === targetKind) {
      return null;
    }

    return pageIndex(targetKind) > pageIndex(currentKind) ? "forward" : "backward";
  }

  function cleanupEntryClass(className) {
    window.setTimeout(() => {
      document.body.classList.remove(className);
    }, 520);
  }

  const pendingTransition = window.sessionStorage.getItem(STORAGE_KEY);
  if (pendingTransition === "forward") {
    document.body.classList.add("is-entering-forward");
    cleanupEntryClass("is-entering-forward");
  } else if (pendingTransition === "backward") {
    document.body.classList.add("is-entering-backward");
    cleanupEntryClass("is-entering-backward");
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

    const transitionDirection = getTransitionDirection(targetUrl);
    if (!transitionDirection || reduceMotion.matches) {
      return;
    }

    event.preventDefault();
    window.sessionStorage.setItem(STORAGE_KEY, transitionDirection);

    const leavingClass =
      transitionDirection === "forward" ? "is-leaving-forward" : "is-leaving-backward";
    document.body.classList.add(leavingClass);

    window.setTimeout(() => {
      window.location.href = targetUrl.href;
    }, 360);
  });
})();
