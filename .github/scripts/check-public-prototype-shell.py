#!/usr/bin/env python3

from __future__ import annotations

import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


PUBLIC_SHELL_PAGES = (
    "index.html",
    "neighborhood-mutual-aid-team/index.html",
    "neighborhood-mutual-aid-team/prototype-customer/index.html",
    "neighborhood-mutual-aid-team/prototype-implementation/index.html",
    "kith-inn/index.html",
    "kith-inn/prototype-customer/index.html",
    "kith-inn/prototype-implementation/index.html",
    "kith-inn/prototype-implementation/prototype-customer/index.html",
    "kith-inn/prototype-implementation/prototype-taozi/index.html",
    "hallway-harmony/index.html",
)

FROZEN_PUBLIC_PAGES = (
    "meal-mind/index.html",
    "meal-mind/prototype-customer/index.html",
    "meal-mind/prototype-implementation/index.html",
)

CANONICAL_URLS = {
    "index.html": "https://ideal.codeforpeople.cn/",
    "neighborhood-mutual-aid-team/index.html": (
        "https://ideal.codeforpeople.cn/neighborhood-mutual-aid-team/"
    ),
    "neighborhood-mutual-aid-team/prototype-customer/index.html": (
        "https://ideal.codeforpeople.cn/neighborhood-mutual-aid-team/prototype-customer/"
    ),
    "neighborhood-mutual-aid-team/prototype-implementation/index.html": (
        "https://ideal.codeforpeople.cn/neighborhood-mutual-aid-team/prototype-implementation/"
    ),
}

PUBLIC_BRAND_LINK = (
    'class="public-shell-brand" href="https://www.codeforpeople.cn/" '
    'aria-label="返回码成仝官网"'
)
PUBLIC_BRAND_LOGO = (
    '<img class="public-shell-seal" '
    'src="https://www.codeforpeople.cn/assets/brand/code-for-people-logo.png" '
    'alt="" width="36" height="36" />'
)

COMMON_REQUIRED_MARKERS = (
    "prototype-shell.css",
    "public-prototype-page",
    "public-shell-header",
    "public-shell-seal",
    "https://www.codeforpeople.cn/assets/brand/code-for-people-logo.png",
    'aria-label="返回码成仝官网"',
    "public-prototype-status",
    "公开体验原型",
    "不能完成真实事务",
    "不接真实业务数据",
    "码成仝",
)

FORBIDDEN_MARKERS = (
    "码成工",
    "public-status-meta",
    "public-shell-actions",
    "public-shell-link",
    "public-feedback",
    "public-shell-navigation",
    "public-shell-navigation-toggle",
    "public-shell-feedback",
    "public-shell-official-link",
    "帮助我们改进这个原型",
    "反馈入口暂不可用",
    "返回正式介绍",
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
PROTOTYPE_SHELL_SCRIPT_SRCS = {
    "index.html": "./prototype-shell.js",
    "neighborhood-mutual-aid-team/index.html": "../prototype-shell.js",
    "neighborhood-mutual-aid-team/prototype-customer/index.html": "../../prototype-shell.js",
    "neighborhood-mutual-aid-team/prototype-implementation/index.html": "../../prototype-shell.js",
    "kith-inn/index.html": "../prototype-shell.js",
    "kith-inn/prototype-customer/index.html": "../../prototype-shell.js",
    "kith-inn/prototype-implementation/index.html": "../../prototype-shell.js",
    "kith-inn/prototype-implementation/prototype-customer/index.html": (
        "../../../prototype-shell.js"
    ),
    "kith-inn/prototype-implementation/prototype-taozi/index.html": (
        "../../../prototype-shell.js"
    ),
    "hallway-harmony/index.html": "../prototype-shell.js",
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


class SharedScriptParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.sources: list[str] = []

    def handle_starttag(
        self, tag: str, attrs: list[tuple[str, str | None]]
    ) -> None:
        if tag != "script":
            return
        src = dict(attrs).get("src") or ""
        if urlsplit(src).path.endswith("prototype-shell.js"):
            self.sources.append(src)


class PageLinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.hrefs: list[str] = []

    def handle_starttag(
        self, tag: str, attrs: list[tuple[str, str | None]]
    ) -> None:
        if tag != "a":
            return
        href = dict(attrs).get("href")
        if href:
            self.hrefs.append(href)


def fail(message: str) -> None:
    print(f"Public prototype shell check failed: {message}", file=sys.stderr)
    raise SystemExit(1)


def built_target_for_href(site_dir: Path, page: Path, href: str) -> Path | None:
    parsed = urlsplit(href)
    if parsed.scheme not in ("", "http", "https"):
        return None
    if parsed.netloc and parsed.netloc != "ideal.codeforpeople.cn":
        return None
    if not parsed.path:
        return None

    decoded_path = unquote(parsed.path)
    if decoded_path.startswith("/"):
        target = site_dir / decoded_path.lstrip("/")
    else:
        target = page.parent / decoded_path

    target = target.resolve()
    try:
        target.relative_to(site_dir)
    except ValueError:
        fail(f"{page.relative_to(site_dir)} links outside the built site: {href}")

    if decoded_path.endswith("/") or target.is_dir():
        target /= "index.html"
    return target


def check_page_links(site_dir: Path, relative_path: str, text: str) -> None:
    page = site_dir / relative_path
    parser = PageLinkParser()
    parser.feed(text)
    for href in parser.hrefs:
        target = built_target_for_href(site_dir, page, href)
        if target is not None and not target.is_file():
            fail(f"{relative_path} has a broken internal link: {href}")


def main() -> None:
    if len(sys.argv) != 2:
        fail("usage: check-public-prototype-shell.py <built-site-directory>")

    site_dir = Path(sys.argv[1]).resolve()
    if not site_dir.is_dir():
        fail(f"missing built site directory: {site_dir}")

    non_english_routes = sorted(
        str(path.relative_to(site_dir))
        for path in site_dir.rglob("*")
        if not str(path.relative_to(site_dir)).isascii()
    )
    if non_english_routes:
        fail(
            "Pages artifact contains non-English route paths: "
            + ", ".join(non_english_routes)
        )

    shared_styles = site_dir / "prototype-shell.css"
    if not shared_styles.is_file():
        fail("prototype-shell.css is missing from the Pages artifact")
    styles_text = shared_styles.read_text(encoding="utf-8")
    required_style_markers = (
        ".public-shell-seal",
        "object-fit: cover;",
        ".public-shell-badge::before",
    )
    missing_style_markers = [
        marker for marker in required_style_markers if marker not in styles_text
    ]
    if missing_style_markers:
        fail(
            "prototype-shell.css is missing shared logo/badge markers: "
            + ", ".join(missing_style_markers)
        )
    hidden_badge = re.search(
        r"\.public-shell-badge\s*\{[^}]*display\s*:\s*none",
        styles_text,
        flags=re.DOTALL,
    )
    if hidden_badge:
        fail("prototype-shell.css must keep the public role badge visible")

    shared_script = site_dir / "prototype-shell.js"
    if not shared_script.is_file():
        fail("prototype-shell.js is missing from the Pages artifact")
    script_text = shared_script.read_text(encoding="utf-8")
    required_script_markers = (
        "public-shell-footer",
        "公开体验原型",
        "不能完成真实事务",
        "不接真实业务数据",
    )
    missing_script_markers = [
        marker for marker in required_script_markers if marker not in script_text
    ]
    if missing_script_markers:
        fail(
            "prototype-shell.js is missing footer contract markers: "
            + ", ".join(missing_script_markers)
        )

    forbidden_script_markers = (
        "/api/public/critique-form",
        "/api/form-links",
        "payload.docs",
        "where%5Bpurpose%5D",
        "public-shell-navigation",
        "public-shell-footer-navigation",
        "public-shell-navigation-toggle",
        "public-shell-feedback",
        "installNavigation",
        "installFeedback",
        "buildFeedbackUrl",
    )
    old_contract_markers = [
        marker for marker in forbidden_script_markers if marker in script_text
    ]
    if old_contract_markers:
        fail(
            "prototype-shell.js still contains removed navigation/feedback behavior: "
            + ", ".join(old_contract_markers)
        )

    for relative_path in PUBLIC_SHELL_PAGES:
        page = site_dir / relative_path
        if not page.is_file():
            fail(f"missing public page: {relative_path}")
        text = page.read_text(encoding="utf-8")
        missing = [marker for marker in COMMON_REQUIRED_MARKERS if marker not in text]
        if missing:
            fail(f"{relative_path} is missing: {', '.join(missing)}")
        canonical_url = CANONICAL_URLS.get(relative_path)
        if canonical_url:
            canonical_markup = f'<link rel="canonical" href="{canonical_url}" />'
            if text.count(canonical_markup) != 1:
                fail(f"{relative_path} must declare canonical URL {canonical_url}")

        if relative_path == "index.html" and ROOT_FOOTER_DISCLOSURE in text:
            fail("index.html must keep the prototype/data disclosure in the status strip only")

        if relative_path == "index.html":
            root_graph_markers = [
                marker for marker in ROOT_GRAPH_FORBIDDEN_MARKERS if marker in text
            ]
            if root_graph_markers:
                fail("index.html must not render decorative graph anchor dots")
            if (
                'href="./neighborhood-mutual-aid-team/" aria-label="打开近邻互助组原型入口"'
                not in text
            ):
                fail("index.html must link to the existing neighbors prototype directory")

        if relative_path == "hallway-harmony/index.html":
            recycle_header_markers = [
                marker for marker in RECYCLE_HEADER_FORBIDDEN_MARKERS if marker in text
            ]
            if recycle_header_markers:
                fail("hallway-harmony/index.html must not render a duplicate product header")

        if text.count(PUBLIC_BRAND_LINK) != 1:
            fail(f"{relative_path} brand must link to the 码成仝 website home")

        if text.count(PUBLIC_BRAND_LOGO) != 1:
            fail(f"{relative_path} must use the official website brand logo exactly once")

        if text.count("public-shell-context") != 1:
            fail(f"{relative_path} must identify exactly one current prototype object")

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

        script_parser = SharedScriptParser()
        script_parser.feed(text)
        expected_script_src = PROTOTYPE_SHELL_SCRIPT_SRCS[relative_path]
        if script_parser.sources != [expected_script_src]:
            fail(
                f"{relative_path} must load prototype-shell.js exactly once from "
                f"{expected_script_src}"
            )
        resolved_script = (page.parent / unquote(urlsplit(expected_script_src).path)).resolve()
        if resolved_script != shared_script.resolve():
            fail(
                f"{relative_path} resolves prototype-shell.js outside the shared artifact: "
                f"{expected_script_src}"
            )

        check_page_links(site_dir, relative_path, text)

    for relative_path in FROZEN_PUBLIC_PAGES:
        if not (site_dir / relative_path).is_file():
            fail(f"missing frozen Meal Mind page: {relative_path}")

    print(
        "Public prototype shell check passed: "
        f"{len(PUBLIC_SHELL_PAGES)} redesigned pages and "
        f"{len(FROZEN_PUBLIC_PAGES)} frozen pages are present."
    )


if __name__ == "__main__":
    main()
