(() => {
  "use strict";

  const FORMAL_SITE_ORIGIN = "https://www.codeforpeople.cn";
  const FORMAL_INTRO_URL = `${FORMAL_SITE_ORIGIN}/neighbors`;
  const FEEDBACK_API_URL = `${FORMAL_SITE_ORIGIN}/api/public/critique-form`;
  const MOBILE_NAVIGATION_QUERY = "(max-width: 860px)";
  const NAVIGATION_ID = "public-shell-navigation";
  const FEEDBACK_PARAMETER_NAMES = Object.freeze(["prototype", "step", "source"]);
  const SAFE_STATE_PARAMETER_NAMES = Object.freeze(["step", "scenario", "variant", "view"]);
  const SAFE_STATE_VALUE = /^[a-z0-9_-]{1,64}$/i;

  const SITE_NAVIGATION = Object.freeze([
    ["近邻互助组", FORMAL_INTRO_URL],
    ["为什么做", `${FORMAL_SITE_ORIGIN}/manifesto`],
    ["如何选题", `${FORMAL_SITE_ORIGIN}/wam`],
    ["如何约束", `${FORMAL_SITE_ORIGIN}/license`],
  ]);

  const PROTOTYPE_IDS = Object.freeze({
    "/": "prototype-map",
    "/neighbors/": "neighbors-index",
    "/neighbors/prototype-customer/": "neighbors-customer",
    "/neighbors/prototype-implementation/": "neighbors-implementation",
    "/街坊味/": "kith-index",
    "/街坊味/prototype-customer/": "kith-customer",
    "/街坊味/prototype-implementation/": "kith-implementation",
    "/街坊味/prototype-implementation/prototype-customer/": "kith-implementation-customer",
    "/街坊味/prototype-implementation/prototype-taozi/": "kith-implementation-taozi",
    "/楼道回收提醒/": "stairwell-recycling",
  });

  function normalizedPathname() {
    let pathname = window.location.pathname;
    try {
      pathname = decodeURIComponent(pathname);
    } catch {
      // Keep the browser-provided pathname; known published routes are valid UTF-8.
    }
    pathname = pathname.replace(/\/index\.html$/, "/");
    return pathname.endsWith("/") ? pathname : `${pathname}/`;
  }

  function currentPrototypeId() {
    return PROTOTYPE_IDS[normalizedPathname()] || "unknown-public-prototype";
  }

  function safeStateEntries() {
    const current = new URL(window.location.href);
    return SAFE_STATE_PARAMETER_NAMES.flatMap((name) => {
      const value = current.searchParams.get(name);
      return value && SAFE_STATE_VALUE.test(value) ? [[name, value]] : [];
    });
  }

  function currentStep() {
    const entries = safeStateEntries();
    if (!entries.length) return "page";
    return entries.map(([name, value]) => (name === "step" ? value : `${name}-${value}`)).join("_");
  }

  function safeSourceUrl() {
    const source = new URL(window.location.pathname, window.location.origin);
    for (const [name, value] of safeStateEntries()) {
      source.searchParams.set(name, value);
    }
    return source.href;
  }

  function buildFeedbackUrl(configuredUrl) {
    const feedbackUrl = new URL(configuredUrl);
    feedbackUrl.searchParams.set("prototype", currentPrototypeId());
    feedbackUrl.searchParams.set("step", currentStep());
    feedbackUrl.searchParams.set("source", safeSourceUrl());
    return feedbackUrl.href;
  }

  function navigationElement(className, label) {
    const navigation = document.createElement("nav");
    navigation.className = className;
    navigation.setAttribute("aria-label", label);
    for (const [itemLabel, href] of SITE_NAVIGATION) {
      const link = document.createElement("a");
      link.href = href;
      link.textContent = itemLabel;
      link.target = "_blank";
      link.rel = "noreferrer";
      if (href === FORMAL_INTRO_URL && normalizedPathname() !== "/") {
        link.setAttribute("aria-current", "page");
      }
      navigation.append(link);
    }
    return navigation;
  }

  function installNavigation(frame) {
    const header = frame.querySelector(".public-shell-header");
    if (!header || frame.querySelector(".public-shell-navigation")) return;

    const navigation = navigationElement("public-shell-navigation", "主导航");
    navigation.id = NAVIGATION_ID;

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "public-shell-navigation-toggle";
    toggle.textContent = "导航";
    toggle.setAttribute("aria-controls", NAVIGATION_ID);

    const mobileNavigation = window.matchMedia(MOBILE_NAVIGATION_QUERY);
    const setNavigationExpanded = (expanded, restoreFocus = false) => {
      const isExpanded = mobileNavigation.matches ? expanded : true;
      navigation.hidden = !isExpanded;
      toggle.hidden = !mobileNavigation.matches;
      toggle.setAttribute("aria-expanded", String(isExpanded));
      toggle.setAttribute("aria-label", isExpanded ? "收起主导航" : "展开主导航");
      if (restoreFocus && mobileNavigation.matches) toggle.focus();
    };

    toggle.addEventListener("click", () => {
      setNavigationExpanded(toggle.getAttribute("aria-expanded") !== "true");
    });
    navigation.addEventListener("click", (event) => {
      if (mobileNavigation.matches && event.target.closest?.("a")) {
        setNavigationExpanded(false, true);
      }
    });
    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        mobileNavigation.matches &&
        toggle.getAttribute("aria-expanded") === "true"
      ) {
        setNavigationExpanded(false, true);
      }
    });
    mobileNavigation.addEventListener("change", () => setNavigationExpanded(false));

    header.append(toggle);
    header.insertAdjacentElement("afterend", navigation);
    setNavigationExpanded(false);
  }

  function installFooter(frame) {
    if (frame.querySelector(".public-shell-footer")) return;
    const footer = document.createElement("footer");
    footer.className = "public-shell-footer";

    const copy = document.createElement("div");
    copy.className = "public-shell-footer-copy";
    copy.innerHTML =
      "<strong>码成仝 · 公开体验原型</strong>" +
      "<span>不能完成真实事务 · 不接真实业务数据</span>";

    footer.append(copy, navigationElement("public-shell-footer-navigation", "页脚导航"));
    frame.append(footer);
  }

  function feedbackPanel(frame) {
    const status = frame.querySelector(".public-prototype-status");
    if (!status) return null;

    const panel = document.createElement("section");
    panel.className = "public-shell-feedback";
    panel.setAttribute("aria-label", "原型反馈");
    panel.innerHTML = `
      <div class="public-shell-feedback-copy">
        <strong>帮助我们改进这个原型</strong>
        <span>反馈正文由你主动填写；联系方式可选；内容仅维护者可见，不会自动公开。</span>
      </div>
      <div class="public-shell-feedback-slot" role="status" aria-live="polite" data-feedback-state="loading">
        正在检查反馈入口…
      </div>
    `;
    status.insertAdjacentElement("afterend", panel);
    return panel.querySelector(".public-shell-feedback-slot");
  }

  function diagnoseFeedback(slot, code, error) {
    slot.dataset.feedbackState = "unavailable";
    slot.textContent = `反馈入口暂不可用 · 诊断码：${code}`;
    console.warn("[prototype-feedback]", code, error || "");
  }

  async function installFeedback(frame) {
    const slot = feedbackPanel(frame);
    if (!slot) return;

    try {
      const response = await fetch(FEEDBACK_API_URL, {
        method: "GET",
        mode: "cors",
        credentials: "omit",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        diagnoseFeedback(slot, `api-${response.status}`);
        return;
      }

      const payload = await response.json();
      if (payload?.unavailable === true) {
        diagnoseFeedback(slot, "critique-not-configured");
        return;
      }

      const label = typeof payload?.label === "string" ? payload.label.trim() : "";
      const configuredUrl = typeof payload?.url === "string" ? payload.url.trim() : "";
      let parsedUrl;
      try {
        parsedUrl = new URL(configuredUrl);
      } catch {
        diagnoseFeedback(slot, "critique-url-invalid");
        return;
      }
      if (!label || parsedUrl.protocol !== "https:") {
        diagnoseFeedback(slot, "critique-config-invalid");
        return;
      }

      const link = document.createElement("a");
      link.className = "public-shell-feedback-link";
      link.textContent = label;
      link.target = "_blank";
      link.rel = "noreferrer";
      const refreshHref = () => {
        link.href = buildFeedbackUrl(parsedUrl.href);
      };
      refreshHref();
      link.addEventListener("focus", refreshHref);
      link.addEventListener("pointerenter", refreshHref);
      link.addEventListener("click", refreshHref);

      slot.dataset.feedbackState = "available";
      slot.replaceChildren(link);
    } catch (error) {
      diagnoseFeedback(slot, "critique-api-unreachable", error);
    }
  }

  function main() {
    const frame = document.querySelector(".public-site-frame");
    if (!frame || frame.dataset.publicShellEnhanced === "true") return;
    frame.dataset.publicShellEnhanced = "true";
    installNavigation(frame);
    installFooter(frame);
    void installFeedback(frame);
  }

  main();
})();
