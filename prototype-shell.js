(() => {
  "use strict";

  const FORMAL_SITE_ORIGIN = "https://www.codeforpeople.cn";
  const FORMAL_INTRO_URL = `${FORMAL_SITE_ORIGIN}/neighbors`;

  const SITE_NAVIGATION = Object.freeze([
    ["近邻互助组", FORMAL_INTRO_URL],
    ["为什么做", `${FORMAL_SITE_ORIGIN}/manifesto`],
    ["如何选题", `${FORMAL_SITE_ORIGIN}/wam`],
    ["如何约束", `${FORMAL_SITE_ORIGIN}/license`],
  ]);

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

  function main() {
    const frame = document.querySelector(".public-site-frame");
    if (!frame || frame.dataset.publicShellEnhanced === "true") return;
    frame.dataset.publicShellEnhanced = "true";
    installFooter(frame);
  }

  main();
})();
