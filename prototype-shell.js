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

  function main() {
    const frame = document.querySelector(".public-site-frame");
    if (!frame || frame.dataset.publicShellEnhanced === "true") return;
    frame.dataset.publicShellEnhanced = "true";
    installFooter(frame);
  }

  main();
})();
