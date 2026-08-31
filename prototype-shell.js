(() => {
  "use strict";

  function installFooter(frame) {
    if (frame.querySelector(".public-shell-footer")) return;
    const footer = document.createElement("footer");
    footer.className = "public-shell-footer";

    const copy = document.createElement("div");
    copy.className = "public-shell-footer-copy";
    copy.innerHTML =
      "<strong>码成仝 · 公开体验原型</strong>" +
      "<span>不能完成真实事务 · 不接真实业务数据</span>";

    footer.append(copy);
    frame.append(footer);
  }

  function installMobilePrototypeToolbar() {
    const body = document.body;
    const exitHref = body.dataset.mobilePrototypeExit;
    if (!exitHref || body.querySelector(".mobile-prototype-toolbar")) return;

    const toolbar = document.createElement("div");
    toolbar.className = "mobile-prototype-toolbar";
    toolbar.setAttribute("role", "navigation");
    toolbar.setAttribute("aria-label", "手机原型工具栏");

    const exit = document.createElement("a");
    exit.className = "mobile-prototype-exit";
    exit.href = exitHref;
    exit.setAttribute("aria-label", "退出原型，返回项目入口");
    exit.textContent = "← 退出原型";

    const title = document.createElement("span");
    title.className = "mobile-prototype-title";
    title.textContent = body.dataset.mobilePrototypeTitle || "手机原型";

    toolbar.append(exit, title);
    body.prepend(toolbar);
  }

  function activateRequestedMobilePrototype() {
    const body = document.body;
    if (body.dataset.mobilePrototypeMode !== "manual") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("prototype") === "1") {
      body.setAttribute("data-mobile-prototype", "");
    }
  }

  function main() {
    const frame = document.querySelector(".public-site-frame");
    if (!frame) return;
    activateRequestedMobilePrototype();
    installMobilePrototypeToolbar();
    if (frame.dataset.publicShellEnhanced === "true") return;
    frame.dataset.publicShellEnhanced = "true";
    installFooter(frame);
  }

  main();
})();
