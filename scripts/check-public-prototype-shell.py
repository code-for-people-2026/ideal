#!/usr/bin/env python3

from __future__ import annotations

import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


PUBLIC_SHELL_PAGES = (
    "index.html",
    "neighbors/index.html",
    "neighbors/prototype-customer/index.html",
    "neighbors/prototype-implementation/index.html",
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
)

CANONICAL_URLS = {
    "index.html": "https://ideal.codeforpeople.cn/",
    "neighbors/index.html": "https://ideal.codeforpeople.cn/neighbors/",
    "neighbors/prototype-customer/index.html": (
        "https://ideal.codeforpeople.cn/neighbors/prototype-customer/"
    ),
    "neighbors/prototype-implementation/index.html": (
        "https://ideal.codeforpeople.cn/neighbors/prototype-implementation/"
    ),
}

FORMAL_INTRO_LINK = (
    '<a class="public-shell-official-link" '
    'href="https://www.codeforpeople.cn/neighbors" target="_blank" '
    'rel="noreferrer">返回正式介绍 <span aria-hidden="true">↗</span></a>'
)
PUBLIC_BRAND_LINK = (
    'class="public-shell-brand" href="https://www.codeforpeople.cn/" '
    'aria-label="返回码成仝官网"'
)

PERMANENT_REDIRECTS = {
    "牛马互助平台/index.html": "https://ideal.codeforpeople.cn/neighbors/",
    "牛马互助平台/prototype-customer/index.html": (
        "https://ideal.codeforpeople.cn/neighbors/prototype-customer/"
    ),
    "牛马互助平台/prototype-implementation/index.html": (
        "https://ideal.codeforpeople.cn/neighbors/prototype-implementation/"
    ),
    "牛马互助平台/消费者联盟-亲历推荐-prototype.html": (
        "https://ideal.codeforpeople.cn/neighbors/"
    ),
    "牛马互助平台/近邻互助组-客户体验-prototype.html": (
        "https://ideal.codeforpeople.cn/neighbors/prototype-customer/"
    ),
    "牛马互助平台/近邻互助组-实施对照-prototype.html": (
        "https://ideal.codeforpeople.cn/neighbors/prototype-implementation/"
    ),
}

COMMON_REQUIRED_MARKERS = (
    "prototype-shell.css",
    "public-prototype-page",
    "public-shell-header",
    "public-shell-official-link",
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
    "neighbors/index.html": "../prototype-shell.js",
    "neighbors/prototype-customer/index.html": "../../prototype-shell.js",
    "neighbors/prototype-implementation/index.html": "../../prototype-shell.js",
    "街坊味/index.html": "../prototype-shell.js",
    "街坊味/prototype-customer/index.html": "../../prototype-shell.js",
    "街坊味/prototype-implementation/index.html": "../../prototype-shell.js",
    "街坊味/prototype-implementation/prototype-customer/index.html": (
        "../../../prototype-shell.js"
    ),
    "街坊味/prototype-implementation/prototype-taozi/index.html": (
        "../../../prototype-shell.js"
    ),
    "楼道回收提醒/index.html": "../prototype-shell.js",
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

    shared_styles = site_dir / "prototype-shell.css"
    if not shared_styles.is_file():
        fail("prototype-shell.css is missing from the Pages artifact")
    styles_text = shared_styles.read_text(encoding="utf-8")
    required_style_markers = (
        ".public-shell-navigation-toggle",
        "min-width: 44px;",
        "min-height: 44px;",
        ".public-shell-navigation-toggle:not([hidden])",
        ".public-shell-badge::before",
    )
    missing_style_markers = [
        marker for marker in required_style_markers if marker not in styles_text
    ]
    if missing_style_markers:
        fail(
            "prototype-shell.css is missing mobile navigation/badge markers: "
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
        '"近邻互助组", FORMAL_INTRO_URL',
        '`$' + '{FORMAL_SITE_ORIGIN}/manifesto`',
        '`$' + '{FORMAL_SITE_ORIGIN}/wam`',
        '`$' + '{FORMAL_SITE_ORIGIN}/license`',
        "public-shell-navigation",
        "public-shell-footer",
        "public-shell-feedback",
        "public-shell-navigation-toggle",
        'toggle.setAttribute("aria-controls", NAVIGATION_ID)',
        'toggle.setAttribute("aria-expanded", String(isExpanded))',
        'event.key === "Escape"',
        'setNavigationExpanded(false, true)',
        'normalizedPathname() !== "/"',
        "公开体验原型",
        "不能完成真实事务",
        "不接真实业务数据",
        "反馈正文由你主动填写；联系方式可选；内容仅维护者可见，不会自动公开。",
        "反馈入口暂不可用 · 诊断码：",
        '`${FORMAL_SITE_ORIGIN}/api/public/critique-form`',
        "payload?.unavailable === true",
        'typeof payload?.label === "string"',
        'typeof payload?.url === "string"',
        'Object.freeze(["prototype", "step", "source"])',
        'Object.freeze(["step", "scenario", "variant", "view"])',
        'link.target = "_blank";',
        'link.rel = "noreferrer";',
        'new URL(window.location.pathname, window.location.origin)',
        'mode: "cors"',
        'credentials: "omit"',
    )
    missing_script_markers = [
        marker for marker in required_script_markers if marker not in script_text
    ]
    if missing_script_markers:
        fail(
            "prototype-shell.js is missing public navigation/feedback contract markers: "
            + ", ".join(missing_script_markers)
        )

    forbidden_script_markers = (
        "/api/form-links",
        "payload.docs",
        "where%5Bpurpose%5D",
    )
    old_contract_markers = [
        marker for marker in forbidden_script_markers if marker in script_text
    ]
    if old_contract_markers:
        fail(
            "prototype-shell.js still exposes the generic Payload form-links contract: "
            + ", ".join(old_contract_markers)
        )

    feedback_parameters = re.findall(
        r'feedbackUrl\.searchParams\.set\("([^"]+)"', script_text
    )
    if feedback_parameters != ["prototype", "step", "source"]:
        fail("prototype-shell.js may only append prototype, step, and source feedback metadata")

    forbidden_feedback_markers = ("FormData", "localStorage", "sessionStorage", ".value")
    present_forbidden = [
        marker for marker in forbidden_feedback_markers if marker in script_text
    ]
    if present_forbidden:
        fail(
            "prototype-shell.js must not read or forward user input: "
            + ", ".join(present_forbidden)
        )

    for relative_path in PUBLIC_SHELL_PAGES:
        page = site_dir / relative_path
        if not page.is_file():
            fail(f"missing public page: {relative_path}")
        text = page.read_text(encoding="utf-8")
        missing = [marker for marker in COMMON_REQUIRED_MARKERS if marker not in text]
        if missing:
            fail(f"{relative_path} is missing: {', '.join(missing)}")
        if "public-shell-feedback-link" in text:
            fail(f"{relative_path} must not contain a feedback link before CMS validation")

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
                'href="./neighbors/" aria-label="打开近邻互助组原型入口"'
                not in text
            ):
                fail("index.html must link to the canonical neighbors prototype route")

        if relative_path == "楼道回收提醒/index.html":
            recycle_header_markers = [
                marker for marker in RECYCLE_HEADER_FORBIDDEN_MARKERS if marker in text
            ]
            if recycle_header_markers:
                fail("楼道回收提醒/index.html must not render a duplicate product header")

        if text.count(PUBLIC_BRAND_LINK) != 1:
            fail(f"{relative_path} brand must link to the 码成仝 website home")

        if text.count("public-shell-official-link") != 1:
            fail(f"{relative_path} must render exactly one standalone official-site link")

        if text.count(FORMAL_INTRO_LINK) != 1:
            fail(f"{relative_path} must link directly to the formal neighbors introduction")
        if "返回官网" in text:
            fail(f"{relative_path} must label the action as 返回正式介绍")

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

    redirect_paths = set(PERMANENT_REDIRECTS)
    for relative_path, target_url in PERMANENT_REDIRECTS.items():
        page = site_dir / relative_path
        if not page.is_file():
            fail(f"missing permanent compatibility redirect: {relative_path}")

        text = page.read_text(encoding="utf-8")
        required_redirect_markers = (
            '<meta name="robots" content="noindex" />',
            f'<meta http-equiv="refresh" content="0; url={target_url}" />',
            f'<link rel="canonical" href="{target_url}" />',
            f'const target = new URL("{target_url}");',
            "target.search = window.location.search;",
            "target.hash = window.location.hash;",
            "window.location.replace(target.href);",
            f'<a href="{target_url}">',
        )
        missing = [marker for marker in required_redirect_markers if marker not in text]
        if missing:
            fail(f"{relative_path} is not a direct canonical redirect")

        parsed_target = urlsplit(target_url)
        if parsed_target.scheme != "https" or parsed_target.netloc != "ideal.codeforpeople.cn":
            fail(f"{relative_path} redirects outside the canonical ideal origin")

        target_path = unquote(parsed_target.path).lstrip("/")
        target_page = site_dir / target_path
        if parsed_target.path.endswith("/"):
            target_page /= "index.html"
        if not target_page.is_file():
            fail(f"{relative_path} redirects to a missing canonical page: {target_url}")
        if str(target_page.relative_to(site_dir)) in redirect_paths:
            fail(f"{relative_path} creates a multi-hop redirect: {target_url}")

        check_page_links(site_dir, relative_path, text)

    for relative_path in FROZEN_PUBLIC_PAGES:
        if not (site_dir / relative_path).is_file():
            fail(f"missing frozen compatibility or Paihaocai page: {relative_path}")

    print(
        "Public prototype shell check passed: "
        f"{len(PUBLIC_SHELL_PAGES)} redesigned pages and "
        f"{len(PERMANENT_REDIRECTS)} direct compatibility redirects and "
        f"{len(FROZEN_PUBLIC_PAGES)} frozen pages are present."
    )


if __name__ == "__main__":
    main()
