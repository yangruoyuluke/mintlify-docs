#!/usr/bin/env python3
"""把 prodspec 演示站的截图装配进文档仓库。

输入（与文档目录一一对应，见下方 BASE_MAP / STATE_MAP）：
  docs-shots-v2/<locale>/<page>.png          整页截图
  docs-shots-v2-states/<locale>/<state>.png  交互状态截图

输出：
  <repo>/images/<lang>/<page-dir>/<name>.jpg   1600px 宽、JPEG q84、渐进式

locale 目录用 zh-CN/en/ja/fr/es；文档语言目录用 cn/en/jp/fr/es。

用法：python3 scripts/capture/assemble-images.py <base-shots-dir> <state-shots-dir>
"""
import os
import sys
from PIL import Image

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MAX_WIDTH = 1600
QUALITY = 84

LOCALE_TO_LANG = {"zh-CN": "cn", "en": "en", "ja": "jp", "fr": "fr", "es": "es"}

# 整页截图 → 文档图片路径（同一张可复用到多页）
BASE_MAP = {
    "dashboard": [
        "guide/dashboard/business-performance/01-overview",
        "guide/interface-tour/01-overview",
        "quick-start/introduction/01-dashboard",
        "quick-start/quick-start/04-dashboard",
    ],
    "ai-usage": ["guide/dashboard/ai-usage/01-overview"],
    "data-export": ["guide/dashboard/data-export/01-overview"],
    "mercado-review": ["guide/dashboard/conversation-review/01-overview"],
    "ai-assistant-login": [
        "guide/assistant/login-online/01-overview",
        "quick-start/quick-start/01-login-online",
    ],
    "persona": [
        "guide/assistant/persona/01-overview",
        "quick-start/quick-start/02-persona",
    ],
    "relationship-management": ["guide/assistant/relationship-config/01-overview"],
    "persona-reply": ["guide/response/reply-rules/01-overview"],
    "ai-reply-guardrails": ["guide/response/safety-guardrails/01-overview"],
    "lead-cleaning": ["guide/response/new-customer-reception/01-overview"],
    "service-time": ["guide/response/working-hours/01-overview"],
    "knowledge-upload": [
        "guide/knowledge/generation/01-overview",
        "quick-start/quick-start/03-knowledge-upload",
    ],
    "knowledge-review": ["guide/knowledge/optimization/01-overview"],
    "knowledge-category-settings": ["guide/knowledge/management/01-overview"],
    "skills-library": ["guide/skills/library/01-overview"],
    "personal-settings": ["guide/account/profile/01-overview"],
    "password-settings": ["guide/account/security/01-overview"],
    "auth-code-settings": ["guide/account/ai-authorization/01-overview"],
}

# 交互状态截图 → 文档图片路径
STATE_MAP = {
    "interface-account-menu": ["guide/interface-tour/02-account-menu"],
    "interface-window-switcher": ["guide/interface-tour/03-window-switcher"],
    "interface-help-center": ["guide/interface-tour/04-help-center"],
    "interface-chat-drawer": [
        "guide/interface-tour/05-chat-drawer",
        "collaboration/basics/01-chat-drawer",
    ],
    "dashboard-glossary": ["guide/dashboard/business-performance/02-metric-glossary"],
    "dashboard-heatmap": ["guide/dashboard/business-performance/03-message-heatmap"],
    "ai-usage-month": ["guide/dashboard/ai-usage/02-month-details"],
    "data-export-drilldown": ["guide/dashboard/data-export/02-message-trace"],
    "data-export-agent-tab": ["guide/dashboard/data-export/03-agent-data-tab"],
    "login-online-create": ["guide/assistant/login-online/02-create-window"],
    "login-online-channel": ["guide/assistant/login-online/03-select-channel"],
    "persona-contexts": ["guide/assistant/persona/02-context-settings"],
    "relationship-edit": ["guide/assistant/relationship-config/02-edit-relationship"],
    "reply-rules-keyword": ["guide/response/reply-rules/02-keyword-direct-reply"],
    "guardrails-add": ["guide/response/safety-guardrails/02-add-rule"],
    "lead-cleaning-add": ["guide/response/new-customer-reception/02-add-item"],
    "service-time-add": ["guide/response/working-hours/02-add-time-slot"],
    "knowledge-upload-web": ["guide/knowledge/generation/02-generate-from-webpage"],
    "knowledge-upload-manual": ["guide/knowledge/generation/03-manual-entry"],
    "knowledge-upload-history": ["guide/knowledge/generation/04-generation-history"],
    "knowledge-review-edit": ["guide/knowledge/optimization/02-edit-knowledge"],
    "knowledge-management-recycle": ["guide/knowledge/management/02-recycle-bin"],
    "skills-add": ["guide/skills/library/02-add-skill"],
}


def convert(src: str, dest_no_ext: str) -> int:
    img = Image.open(src)
    if img.width > MAX_WIDTH:
        height = round(img.height * MAX_WIDTH / img.width)
        img = img.resize((MAX_WIDTH, height), Image.LANCZOS)
    img = img.convert("RGB")
    os.makedirs(os.path.dirname(dest_no_ext), exist_ok=True)
    dest = dest_no_ext + ".jpg"
    img.save(dest, "JPEG", quality=QUALITY, optimize=True, progressive=True)
    return os.path.getsize(dest)


def main() -> int:
    if len(sys.argv) < 3:
        print(__doc__)
        return 2
    base_dir, state_dir = sys.argv[1], sys.argv[2]
    written, missing = 0, []

    for locale, lang in LOCALE_TO_LANG.items():
        for mapping, root in ((BASE_MAP, base_dir), (STATE_MAP, state_dir)):
            for source_name, targets in mapping.items():
                src = os.path.join(root, locale, source_name + ".png")
                if not os.path.exists(src):
                    missing.append(src)
                    continue
                for target in targets:
                    dest = os.path.join(REPO, "images", lang, target)
                    convert(src, dest)
                    written += 1

    print(f"written: {written} images -> {REPO}/images")
    if missing:
        print(f"missing ({len(missing)}):")
        for path in missing[:20]:
            print("  ", path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
