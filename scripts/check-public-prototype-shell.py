#!/usr/bin/env python3

from __future__ import annotations

import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


PUBLIC_SHELL_PAGES = (
    "index.html",
    "牛马互助平台/index.html",
    "牛马互助平台/prototype-customer/index.html",
    "牛马互助平台/prototype-implementation/index.html",
    "街坊味/index.html",
    "街坊味/prototype-customer/index.html",
    "街坊味/prototype-implementation/index.html",
    "街坊味/prototype-implementation/prototype-customer/index.html",
    "街坊味/prototype-implementation/prototype-taozi/index.html",
    "楼道回收提醒/index.html",
)

FROZEN_PUBLIC_PAGES = (
    "排好菜/index.html",
    "排好菜/prototype-customer/index.html",
    "排好菜/prototype-implementation/index.html",
    "牛马互助平台/消费者联盟-亲历推荐-prototype.html",
    "牛马互助平台/近邻互助组-客户体验-prototype.html",
    "牛马互助平台/近邻互助组-实施对照-prototype.html",
)

COMMON_REQUIRED_MARKERS = (
    "prototype-shell.css",
    "public-prototype-page",
    "public-shell-header",
    "public-shell-official-link",
    "返回官网",
    'aria-label="返回原型首页"',
    "public-prototype-status",
    "不接真实业务数据",
    "码成仝",
)

FORBIDDEN_MARKERS = (
    "码成工",
    "www.codeforpeople.cn/neighbors",
    "public-status-meta",
    "public-shell-actions",
    "public-shell-link",
    "public-feedback",
    "反馈入口尚未配置",
    "反馈通道准备中",
)

ROOT_FOOTER_DISCLOSURE = "全部页面均为交互原型，不接入真实业务数据。"
ROOT_GRAPH_FORBIDDEN_MARKERS = (
    'class="anchor',
)
RECYCLE_HEADER_FORBIDDEN_MARKERS = (
    'class="topbar"',
    "prototype-note",
)
PROTOTYPE_HOME_HREFS = {
    "index.html": "./",
    "牛马互助平台/index.html": "../",
    "牛马互助平台/prototype-customer/index.html": "../../",
    "牛马互助平台/prototype-implementation/index.html": "../../",
    "街坊味/index.html": "../",
    "街坊味/prototype-customer/index.html": "../../",
    "街坊味/prototype-implementation/index.html": "../../",
    "街坊味/prototype-implementation/prototype-customer/index.html": "../../../",
    "街坊味/prototype-implementation/prototype-taozi/index.html": "../../../",
    "楼道回收提醒/index.html": "../",
}


class SharedStylesheetParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.hrefs: list[str] = []

    def handle_starttag(
        self, tag: str, attrs: list[tuple[str, str | None]]
    ) -> None:
        if tag != "link":
            return
        attributes = dict(attrs)
        rel = (attributes.get("rel") or "").split()
        href = attributes.get("href") or ""
        if "stylesheet" in rel and urlsplit(href).path.endswith("prototype-shell.css"):
            self.hrefs.append(href)


def fail(message: str) -> None:
    print(f"Public prototype shell check failed: {message}", file=sys.stderr)
    raise SystemExit(1)


def main() -> None:
    if len(sys.argv) != 2:
        fail("usage: check-public-prototype-shell.py <built-site-directory>")

    site_dir = Path(sys.argv[1]).resolve()
    if not site_dir.is_dir():
        fail(f"missing built site directory: {site_dir}")

    shared_styles = site_dir / "prototype-shell.css"
    if not shared_styles.is_file():
        fail("prototype-shell.css is missing from the Pages artifact")

    for relative_path in PUBLIC_SHELL_PAGES:
        page = site_dir / relative_path
        if not page.is_file():
            fail(f"missing public page: {relative_path}")
        text = page.read_text(encoding="utf-8")
        missing = [marker for marker in COMMON_REQUIRED_MARKERS if marker not in text]
        if missing:
            fail(f"{relative_path} is missing: {', '.join(missing)}")

        if relative_path == "index.html" and ROOT_FOOTER_DISCLOSURE in text:
            fail("index.html must keep the prototype/data disclosure in the status strip only")

        if relative_path == "index.html":
            root_graph_markers = [
                marker for marker in ROOT_GRAPH_FORBIDDEN_MARKERS if marker in text
            ]
            if root_graph_markers:
                fail("index.html must not render decorative graph anchor dots")

        if relative_path == "楼道回收提醒/index.html":
            recycle_header_markers = [
                marker for marker in RECYCLE_HEADER_FORBIDDEN_MARKERS if marker in text
            ]
            if recycle_header_markers:
                fail("楼道回收提醒/index.html must not render a duplicate product header")

        expected_home_link = (
            f'class="public-shell-brand" href="{PROTOTYPE_HOME_HREFS[relative_path]}" '
            'aria-label="返回原型首页"'
        )
        if expected_home_link not in text:
            fail(f"{relative_path} brand must link to the prototype home")

        if text.count("public-shell-official-link") != 1:
            fail(f"{relative_path} must render exactly one standalone official-site link")

        if relative_path == "index.html":
            if "public-shell-breadcrumb" in text:
                fail("index.html must not render a breadcrumb on the prototype home")
        else:
            if text.count("public-shell-breadcrumb") != 1:
                fail(f"{relative_path} must render exactly one breadcrumb navigation")
            if text.count('public-breadcrumb-current" aria-current="page"') != 1:
                fail(f"{relative_path} must identify exactly one current breadcrumb item")

            breadcrumb_start = text.index('<nav class="public-shell-breadcrumb"')
            breadcrumb_end = text.index("</nav>", breadcrumb_start)
            breadcrumb = text[breadcrumb_start:breadcrumb_end]
            if "codeforpeople.cn" in breadcrumb or "正式网站" in breadcrumb:
                fail(f"{relative_path} breadcrumb must stay inside the prototype site")
            if text.index("public-prototype-status") > breadcrumb_start:
                fail(f"{relative_path} breadcrumb must follow the prototype status strip")

        forbidden = [marker for marker in FORBIDDEN_MARKERS if marker in text]
        if forbidden:
            fail(f"{relative_path} contains forbidden public-shell text: {', '.join(forbidden)}")

        parser = SharedStylesheetParser()
        parser.feed(text)
        if len(parser.hrefs) != 1:
            fail(
                f"{relative_path} must load prototype-shell.css exactly once "
                f"(found {len(parser.hrefs)})"
            )

        stylesheet_path = urlsplit(parser.hrefs[0]).path
        resolved_stylesheet = (page.parent / unquote(stylesheet_path)).resolve()
        if resolved_stylesheet != shared_styles.resolve():
            fail(
                f"{relative_path} resolves prototype-shell.css outside the shared artifact: "
                f"{parser.hrefs[0]}"
            )

    for relative_path in FROZEN_PUBLIC_PAGES:
        if not (site_dir / relative_path).is_file():
            fail(f"missing frozen compatibility or Paihaocai page: {relative_path}")

    print(
        "Public prototype shell check passed: "
        f"{len(PUBLIC_SHELL_PAGES)} redesigned pages and "
        f"{len(FROZEN_PUBLIC_PAGES)} frozen pages are present."
    )


if __name__ == "__main__":
    main()
