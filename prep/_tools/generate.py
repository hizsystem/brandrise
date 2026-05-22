#!/usr/bin/env python3
"""
Convert brandrise/prep/*.md → brandrise/prep/[slug]/index.html + hub index.html
Style: quote/levero-inspired (dark + cream/green accent)
"""
import os
import re
import html
import json
from pathlib import Path

PREP_DIR = Path("/Users/seulki/PROJECT/brandrise/prep")
OUT_DIR = PREP_DIR  # write back into prep/

# Tier metadata (from README curation)
TIER_MAP = {
    "S": {"label": "S · 즉시 GO", "color": "#059669", "bg": "#ECFDF5"},
    "A": {"label": "A · 명확", "color": "#0066CC", "bg": "#EBF4FF"},
    "B": {"label": "B · 검증 후", "color": "#EA580C", "bg": "#FFF7ED"},
    "C": {"label": "C · 정보 부족", "color": "#6B7280", "bg": "#F3F4F6"},
}

# Slug → tier mapping
SLUG_TIER = {
    # ── 2026-05-11~18 사전상담 배치 (27건) ──
    "cura-pulse": "S", "bowlbox": "S", "naturalgoodthings": "S", "diang": "S",
    "orbrand": "A", "mixroom": "A", "ashuniverse": "A", "living-sense": "A",
    "allwell": "A", "yrim": "A",
    "pap": "B", "tnr-biofab": "B", "ciklux": "B", "whatsup-house": "B",
    "mk": "B", "langs-enter": "B", "atw-korea": "B", "summerin": "B",
    "wayd": "C", "thenewcompany": "C", "lilliger": "C", "mer": "C",
    "zenni-global": "B", "todays": "B", "chobibooks": "B", "family-company": "B",
    "findercorp": "A",  # ↑ 2차 리서치 결과 승급 (5/22 재검토)
    # ── 2026-05-22 고벤처 행사 배치 (22건) ──
    "nodaji-pi-labs": "S",
    "healernet": "A", "daynesta": "A", "youngeyed-project": "A", "risanghoe": "A",
    "blupino": "A", "moolsoo": "A", "stylegrapher": "A",
    "boreumi": "B", "welisson": "B", "nunsarang": "B",
    "spicyspice": "B", "penther": "B", "yuan-corp": "B",  # ↑ 2차 리서치 결과 승급
    "kingdom-square": "C", "everyday-christmas": "C",
    "yousomi": "C", "briyl": "C", "gelato-wayou": "C",
    "j-and": "C", "esam": "C", "kim-yeoreum": "C",
}

# Slug → source batch (sangdam = 사전상담 신청자, govent = 고벤처 행사)
SLUG_SOURCE = {
    # govent (22건)
    "nodaji-pi-labs": "govent", "healernet": "govent", "daynesta": "govent",
    "youngeyed-project": "govent", "risanghoe": "govent", "blupino": "govent",
    "moolsoo": "govent", "stylegrapher": "govent", "boreumi": "govent",
    "welisson": "govent", "nunsarang": "govent", "kingdom-square": "govent",
    "spicyspice": "govent", "penther": "govent", "everyday-christmas": "govent",
    "yousomi": "govent", "yuan-corp": "govent", "briyl": "govent",
    "gelato-wayou": "govent", "j-and": "govent", "esam": "govent", "kim-yeoreum": "govent",
}
# default = sangdam (기존 27건)

# Display order — matches sheet row order (applicant order)
DISPLAY_ORDER = [
    ("mixroom", "노도원·손한솔", "주식회사 믹스룸", "2026-05-11", 2, "Y"),
    ("mk", "조은미·강민주", "MK", "2026-05-12", 2, "N"),
    ("pap", "이수연", "PAP", "2026-05-12", 1, "N"),
    ("summerin", "박현주", "썸머린", "2026-05-14", 1, "N"),
    ("naturalgoodthings", "김수안", "주식회사 네츄럴굿띵스", "2026-05-14", 1, "N"),
    ("ashuniverse", "김정희", "주식회사 아슈니버스", "2026-05-14", 1, "N"),
    ("diang", "김지현", "동일프라텍 (Diang)", "2026-05-14", 1, "N"),
    ("ciklux", "조현상", "주식회사 사이클룩스", "2026-05-14", 1, "N"),
    ("chobibooks", "김수영", "초비북스", "2026-05-14", 1, "N"),
    ("living-sense", "심효진", "리빙센스", "2026-05-14", 1, "N"),
    ("orbrand", "심명보", "오어브랜드", "2026-05-15", 1, "N"),
    ("atw-korea", "조진숙", "에이티더블유코리아", "2026-05-15", 1, "N"),
    ("langs-enter", "임문화·정슬기", "(주)랑스엔터", "2026-05-17", 2, "N"),
    ("family-company", "최미진", "가족컴퍼니", "2026-05-17", 1, "N"),
    ("wayd", "이동기", "WAYD", "2026-05-17", 1, "N"),
    ("zenni-global", "김혜련", "제니글로벌", "2026-05-17", 1, "N"),
    ("bowlbox", "신지은", "보울박스", "2026-05-17", 1, "N"),
    ("todays", "이동훈", "투데이즈", "2026-05-17", 1, "N"),
    ("thenewcompany", "윤준서", "더뉴컴퍼니", "2026-05-17", 1, "N"),
    ("lilliger", "이서현", "릴리저", "2026-05-17", 1, "N"),
    ("whatsup-house", "김형섭·황민영", "와썹하우스", "2026-05-17", 2, "N"),
    ("tnr-biofab", "석나경", "티앤알바이오팹", "2026-05-17", 1, "N"),
    ("cura-pulse", "조남규", "큐라펄스", "2026-05-18", 1, "N"),
    ("findercorp", "최재천", "파인더코퍼레이션", "2026-05-18", 1, "N"),
    ("allwell", "이현정", "(주)올웰", "2026-05-18", 1, "N"),
    ("mer", "정지원", "메르", "2026-05-18", 1, "N"),
    ("yrim", "권기진", "와이림 (Y-Rim)", "2026-05-18", 1, "N"),
    # ── 2026-05-22 고벤처 행사 배치 (22건) ──
    ("moolsoo", "강수지", "물수", "2026-05-22", 1, "N"),
    ("yousomi", "윤소민", "유쏘미", "2026-05-22", 1, "N"),
    ("healernet", "김종우", "(주)힐러넷 (Healernet)", "2026-05-22", 1, "N"),
    ("kingdom-square", "박선정", "킹덤스퀘어", "2026-05-22", 1, "N"),
    ("risanghoe", "이정하", "리상회", "2026-05-22", 1, "N"),
    ("daynesta", "YEONGJUN YUN", "DAYNESTA LLC", "2026-05-22", 1, "N"),
    ("j-and", "이주현", "J&", "2026-05-22", 1, "N"),
    ("spicyspice", "김경주", "스파이시스파이스", "2026-05-22", 1, "N"),
    ("penther", "김정윤", "(주)펜써", "2026-05-22", 1, "N"),
    ("blupino", "이석모", "블루피노 (BLUPINO)", "2026-05-22", 1, "N"),
    ("stylegrapher", "이사금", "스타일그래퍼", "2026-05-22", 1, "N"),
    ("everyday-christmas", "김승용", "에브리데이 크리스마스", "2026-05-22", 1, "N"),
    ("nodaji-pi-labs", "최명수", "노다지파이랩스", "2026-05-22", 1, "N"),
    ("yuan-corp", "강구현", "유안코퍼레이션", "2026-05-22", 1, "N"),
    ("briyl", "김민지", "BRIYL", "2026-05-22", 1, "N"),
    ("boreumi", "윤정은", "보르미(주)", "2026-05-22", 1, "N"),
    ("youngeyed-project", "이세빈", "영아이드프로젝트", "2026-05-22", 1, "N"),
    ("gelato-wayou", "김경민", "젤라또와유", "2026-05-22", 1, "N"),
    ("esam", "김성은", "esam", "2026-05-22", 1, "N"),
    ("nunsarang", "윤태원", "눈사랑 안과 동물병원", "2026-05-22", 1, "N"),
    ("welisson", "신민경", "(주)웰리스온", "2026-05-22", 1, "N"),
    ("kim-yeoreum", "김여름", "개인사업자 (김여름)", "2026-05-22", 1, "N"),
]

# Curation hooks (from README)
HOOKS = {
    "cura-pulse": "Pre-A·TIPS 글로벌·B2C 디바이스 런칭 직전 — 리솔츠/위타민 케이스 구조 동일",
    "bowlbox": "한남·역삼 매장 + 가맹 모집 — 본사 통합 자산 + 가맹 리드 퍼포먼스",
    "naturalgoodthings": "안정 D2C 연 169억, 최대 잠재 계약",
    "diang": "제조 중견(19억) 글로벌 진출",
    "orbrand": "E커머스 신규, 예산 100만 → Tier 1 진입 후 업셀 동선",
    "mixroom": "시드, 글로벌 런칭 직후 + BI 시스템화 (2명 동석)",
    "ashuniverse": "개인 IP→브랜드 시스템화, 커뮤니티 자산 보유",
    "living-sense": "30년 매거진 IP 디지털 전환 — 단가 上",
    "allwell": "신생 D2C, 사명·도메인 3중 네이밍 분산",
    "yrim": "기존 정식 리서치 활용, Essential 직입",
    "pap": "KREAM Corp 산하, 성장 단계",
    "tnr-biofab": "코스닥 상장 바이오, 부서·과제 정의가 1순위",
    "ciklux": "B2B 임상시험 컨설팅, 커스텀 스코프",
    "whatsup-house": "2인 동석, 방향만 잡으면 즉시 실행",
    "mk": "공동창업 정렬 단계, 워크샵형 접근",
    "langs-enter": "대표 부재 리스크, 2차 미팅 필수",
    "atw-korea": "해외 브랜드 한국법인 가능성, 사업 확인 1순위",
    "summerin": "violetherz vs summerin 브랜드 아키텍처 정리",
    "wayd": "동명 3건 충돌 + 2차에도 매칭 실패",
    "zenni-global": "↑ 2차: 사업자 확정 (용인 기흥, 7개월차 1인 e-커머스 셀러)",
    "todays": "↑ 2차: 사업자 확정 (용인 수지, 14개월차 + 토스페이먼츠 결제링크)",
    "thenewcompany": "THENEW 아트 플랫폼 충돌 + 2차에도 매칭 실패",
    "lilliger": "영문 표기 해외 충돌 + 2차에도 매칭 실패",
    "chobibooks": "↑ 2차: 초비북스 출판사 확정, 이효재 작가 5종 출간 (2025-09~)",
    "family-company": "↑ 2차: 최미진·조남혁 공동대표 신생 4주차 D2C (정읍/파주)",
    "findercorp": "↑↑ 2차: W'GREEN 규조토 발매트 D2C 운영사, 1.5년차·자사몰+후기 1.5만 — 강력 매칭 A 승급",
    "mer": "naver 메일, 1인 운영 가능성 + 2차에도 매칭 실패",
    # ── 2026-05-22 고벤처 행사 배치 (22건) ──
    "nodaji-pi-labs": "기존 정식 리서치 GO 4.0/5.0, Pre-launch D-50, T2 8주 압축런",
    "healernet": "AI 활성물질 + 진세노사이드 소재 + 요프리Rh2 D2C, CSO·대표 라인 확인",
    "daynesta": "관절 라이프스타일 건기식 D2C, 한미 동시 진출 — 위타민·케어비네스트 인접",
    "youngeyed-project": "라이프스타일+세라믹+아트 플랫폼, 29CM·CJ온스타일 입점",
    "risanghoe": "(주)리비트 안주 D2C, 모회사 듀얼 구조 정리가 1순위",
    "blupino": "무첨가 사과 탄산음료 D2C, 청송 농업회사법인 — 마키노차야 인접",
    "moolsoo": "한국 전통 섬유(모시·실크) 샤워타월 D2C, 와디즈+USPTO 출원",
    "stylegrapher": "압구정 1인 스타일링 스튜디오, 시스템화·온라인 확장 레버리지",
    "boreumi": "B2B 기프트·판촉물 에이전시, 대기업 레퍼런스 보유",
    "welisson": "약사 D2C 헬스케어 가설 = 케어비네스트·바디노트 인접",
    "nunsarang": "동물 안과 — HIZ D2C SOP 핏 검증 필수",
    "kingdom-square": "↗ 2차: 사업자 확인 (강남 봉은사로, 정보통신업), 박선정 대표자 매칭 보류",
    "spicyspice": "↑ 2차: 사업자 정상 등록 (충남 청양 e-커머스), 청양고추 가공품 글로벌 D2C 가설",
    "penther": "↑ 2차: (주)펜써 법인 확정 (서울 관악), 0→1 단계 — T1 Foundation 핏",
    "everyday-christmas": "동음 6건 모두 김승용 매칭 0 — PASS 가능성 검토",
    "yousomi": "정보 부족, 디렉터 직책 = 대표 별도 가능성 + 2차에도 매칭 실패",
    "yuan-corp": "↑ 2차: 개인사업자 확정 (고양), B2C e-커머스 셀러 — PB 보유 여부가 GO 분기",
    "briyl": "캐나다 시그널, 본진 시장 확인 필요 + 2차에도 매칭 실패",
    "gelato-wayou": "23세 청년 F&B, 외부 풋프린트 0 — Tier 0 진단형",
    "j-and": "사명 매우 짧음, 동명 충돌 — @jand_official 후보 1건(매칭 보류)",
    "esam": "사명 다의어, 1인 사업자 가설 + 2차에도 매칭 실패",
    "kim-yeoreum": "회사명 없음, 사업 정의 워크샵 진입 + 2차에도 매칭 실패",
}


def parse_md(md_path: Path) -> dict:
    """Parse a prep .md into structured fields."""
    text = md_path.read_text(encoding="utf-8")

    # Frontmatter
    fm = {}
    m = re.match(r"---\n(.*?)\n---\n(.*)", text, re.DOTALL)
    if m:
        for line in m.group(1).split("\n"):
            if ":" in line:
                k, v = line.split(":", 1)
                fm[k.strip()] = v.strip()
        body = m.group(2)
    else:
        body = text

    sections = {}
    # Split by ## headings
    parts = re.split(r"\n## ", "\n" + body)
    for i, part in enumerate(parts):
        if i == 0:
            # Before first ## (may include # title and blockquote)
            sections["_intro"] = part.strip()
            continue
        head, _, rest = part.partition("\n")
        sections[head.strip()] = rest.strip()

    return {"frontmatter": fm, "sections": sections, "intro": sections.get("_intro", "")}


def md_inline_to_html(s: str) -> str:
    """Minimal markdown inline → HTML: **bold**, [text](url), `code`, line breaks."""
    s = html.escape(s, quote=False)
    # Restore < > inside [text] (no), keep simple
    # Links: [text](url)
    s = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2" target="_blank" rel="noopener">\1</a>', s)
    # Bold
    s = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", s)
    # Code
    s = re.sub(r"`([^`]+)`", r"<code>\1</code>", s)
    return s


def list_to_html(text: str) -> str:
    """Convert markdown list (- or numbered) to HTML <ul>/<ol>."""
    if not text.strip():
        return ""
    lines = [ln for ln in text.strip().split("\n") if ln.strip()]
    items = []
    is_ol = False
    for ln in lines:
        ln_strip = ln.strip()
        if re.match(r"^\d+\.\s", ln_strip):
            is_ol = True
            content = re.sub(r"^\d+\.\s+", "", ln_strip)
            items.append(md_inline_to_html(content))
        elif ln_strip.startswith("- "):
            content = ln_strip[2:]
            items.append(md_inline_to_html(content))
        else:
            # Plain paragraph
            items.append(md_inline_to_html(ln_strip))
    tag = "ol" if is_ol else "ul"
    lis = "\n".join(f"      <li>{it}</li>" for it in items)
    return f"<{tag}>\n{lis}\n    </{tag}>"


def paragraph_to_html(text: str) -> str:
    if not text.strip():
        return ""
    paragraphs = re.split(r"\n\s*\n", text.strip())
    out = []
    for p in paragraphs:
        if p.strip().startswith("- ") or re.match(r"^\d+\.\s", p.strip()):
            out.append(list_to_html(p))
        else:
            out.append(f"<p>{md_inline_to_html(p)}</p>")
    return "\n    ".join(out)


# ---------- HTML template ----------

PREP_TEMPLATE = """<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{brand_title} · 사전상담 PREP — 브랜드라이즈 by HIZ</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
    :root {{
      --black: #14181A;
      --white: #FFFFFF;
      --bg: #F5F2EC;
      --accent: #2E5D4F;
      --accent-light: #ECF2EE;
      --accent-soft: #7FB89F;
      --gray-100: #F3F4F6;
      --gray-200: #E5E7EB;
      --gray-300: #D1D5DB;
      --gray-500: #6B7280;
      --gray-700: #374151;
      --text: #111827;
      --tier-color: {tier_color};
      --tier-bg: {tier_bg};
    }}
    body {{
      font-family: 'Noto Sans KR', -apple-system, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.7;
      font-size: 14px;
    }}
    .container {{ max-width: 960px; margin: 0 auto; padding: 0 48px; }}
    a {{ color: var(--accent); text-decoration: none; border-bottom: 1px solid var(--accent-light); }}
    a:hover {{ color: var(--black); border-bottom-color: var(--black); }}
    code {{ background: var(--gray-100); padding: 1px 6px; border-radius: 4px; font-size: 0.9em; font-family: 'SF Mono', Menlo, monospace; }}

    /* TOP NAV */
    .topnav {{ background: var(--black); color: rgba(255,255,255,0.55); padding: 14px 0; font-size: 12px; }}
    .topnav .container {{ display: flex; justify-content: space-between; align-items: center; }}
    .topnav a {{ color: rgba(255,255,255,0.55); border: none; }}
    .topnav a:hover {{ color: var(--white); }}
    .topnav .brand {{ font-weight: 800; letter-spacing: -0.02em; color: var(--white); }}

    /* HERO */
    .hero {{ background: var(--black); color: var(--white); padding: 80px 0 64px; }}
    .hero .tier-badge {{
      display: inline-block; background: var(--tier-bg); color: var(--tier-color);
      font-size: 11px; font-weight: 800; letter-spacing: 0.12em;
      padding: 6px 14px; border-radius: 20px; text-transform: uppercase;
      margin-bottom: 24px;
    }}
    .hero .label {{
      font-size: 11px; font-weight: 700; letter-spacing: 0.18em;
      color: var(--accent-soft); text-transform: uppercase; margin-bottom: 18px;
    }}
    .hero h1 {{
      font-size: 48px; font-weight: 900; line-height: 1.15;
      letter-spacing: -0.025em; margin-bottom: 20px;
    }}
    .hero .sub {{
      font-size: 15px; color: rgba(255,255,255,0.6);
      font-weight: 300; max-width: 680px; line-height: 1.85;
    }}
    .hero-meta {{
      display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 28px; margin-top: 48px;
      padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.1);
    }}
    .hero-meta-item .k {{
      font-size: 10px; letter-spacing: 0.12em; color: rgba(255,255,255,0.35);
      text-transform: uppercase; margin-bottom: 6px;
    }}
    .hero-meta-item .v {{ font-size: 14px; font-weight: 600; }}

    .confidential {{
      display: inline-block; margin-top: 28px;
      padding: 5px 12px; border: 1px solid rgba(255,255,255,0.25);
      border-radius: 20px; font-size: 10px; letter-spacing: 0.18em;
      color: rgba(255,255,255,0.55); text-transform: uppercase;
    }}

    /* SECTIONS */
    section {{ padding: 72px 0; border-bottom: 1px solid var(--gray-200); }}
    section:last-of-type {{ border-bottom: none; }}
    .sec-label {{
      font-size: 10px; font-weight: 800; letter-spacing: 0.18em;
      color: var(--accent); text-transform: uppercase; margin-bottom: 14px;
    }}
    h2 {{
      font-size: 30px; font-weight: 900; letter-spacing: -0.025em;
      line-height: 1.25; margin-bottom: 14px; color: var(--black);
    }}
    .sec-desc {{
      font-size: 15px; color: var(--gray-500); max-width: 620px;
      line-height: 1.85; margin-bottom: 36px;
    }}

    /* CARDS */
    .card {{
      background: var(--white); border-radius: 14px;
      border: 1px solid var(--gray-200); padding: 32px 36px;
    }}
    .card p {{ margin-bottom: 12px; }}
    .card p:last-child {{ margin-bottom: 0; }}
    .card ul, .card ol {{ padding-left: 22px; }}
    .card ul li, .card ol li {{ padding: 6px 0; line-height: 1.75; }}
    .card ul li::marker {{ color: var(--accent); }}
    .card ol li::marker {{ color: var(--accent); font-weight: 700; }}
    .card strong {{ color: var(--black); }}

    .card-dark {{
      background: var(--black); color: var(--white);
      border-color: var(--black);
    }}
    .card-dark strong {{ color: var(--accent-soft); }}
    .card-dark a {{ color: var(--accent-soft); border-color: rgba(127,184,159,0.3); }}
    .card-dark a:hover {{ color: var(--white); }}
    .card-dark ul li::marker, .card-dark ol li::marker {{ color: var(--accent-soft); }}

    /* QUESTIONS as numbered cards */
    .q-grid {{ display: grid; gap: 12px; }}
    .q-item {{
      background: var(--white); border-radius: 12px;
      border: 1px solid var(--gray-200); padding: 18px 24px;
      display: flex; gap: 18px; align-items: flex-start;
    }}
    .q-num {{
      flex-shrink: 0; width: 32px; height: 32px;
      background: var(--accent-light); color: var(--accent);
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 13px;
    }}
    .q-text {{ flex: 1; font-size: 14px; line-height: 1.7; }}
    .q-text strong {{ color: var(--accent); }}

    /* SOURCES */
    .src-list {{ list-style: none; padding: 0; }}
    .src-list li {{
      padding: 10px 0; border-bottom: 1px dashed var(--gray-200);
      font-size: 13px; color: var(--gray-700);
    }}
    .src-list li:last-child {{ border-bottom: none; }}
    .src-list a {{ word-break: break-all; }}

    /* FOOTER */
    .footer {{ background: var(--black); color: rgba(255,255,255,0.4); padding: 56px 0; text-align: center; }}
    .footer .brand {{ font-size: 18px; font-weight: 900; color: var(--white); margin-bottom: 6px; letter-spacing: -0.02em; }}
    .footer .tag {{ font-size: 12px; margin-bottom: 28px; }}
    .footer .meta {{ font-size: 11px; line-height: 2; }}
    .footer a {{ color: rgba(255,255,255,0.55); border: none; }}
    .footer a:hover {{ color: var(--white); }}

    @media (max-width: 720px) {{
      .hero h1 {{ font-size: 34px; }}
      .container {{ padding: 0 24px; }}
      section {{ padding: 52px 0; }}
      .card {{ padding: 24px 22px; }}
    }}

    @media print {{
      body {{ background: var(--white); font-size: 11px; }}
      .topnav, .footer {{ display: none; }}
      .hero {{ background: var(--white); color: var(--black); padding: 32px 0; }}
      .hero h1 {{ color: var(--black); font-size: 28px; }}
      .hero .sub, .hero-meta-item .v {{ color: var(--gray-700); }}
      .hero-meta-item .k {{ color: var(--gray-500); }}
      .hero-meta {{ border-top-color: var(--gray-300); }}
      .hero .label {{ color: var(--accent); }}
      .confidential {{ color: var(--gray-700); border-color: var(--gray-300); }}
      section {{ padding: 28px 0; page-break-inside: avoid; }}
      h2 {{ font-size: 18px; }}
      .card-dark {{ background: var(--gray-100); color: var(--black); border-color: var(--gray-200); }}
      .card-dark strong, .card-dark a {{ color: var(--accent); }}
    }}
  </style>
</head>
<body>

<div class="topnav">
  <div class="container">
    <a href="../" class="brand">BRANDRISE · PREP</a>
    <span>2026 Q2 · 사전상담 PREP 배치</span>
  </div>
</div>

<header class="hero">
  <div class="container">
    <span class="tier-badge">{tier_label}</span>
    <div class="label">사전상담 PREP — 2026 Q2</div>
    <h1>{brand_title}</h1>
    <p class="sub">{hook}</p>
    <div class="hero-meta">
      <div class="hero-meta-item"><div class="k">신청자</div><div class="v">{representative}</div></div>
      <div class="hero-meta-item"><div class="k">신청일</div><div class="v">{applied_date}</div></div>
      <div class="hero-meta-item"><div class="k">참여 인원</div><div class="v">{participants}명</div></div>
      <div class="hero-meta-item"><div class="k">참여 확정</div><div class="v">{confirmed}</div></div>
    </div>
    <div class="confidential">Internal · 브랜드라이즈 팀 전용</div>
  </div>
</header>

{sections_html}

<footer class="footer">
  <div class="container">
    <div class="brand">BRANDRISE</div>
    <div class="tag">브랜드의 성장을 설계합니다.</div>
    <div class="meta">
      <a href="../">← PREP 배치 허브</a> · <a href="https://hizsystem.github.io/brandrise/">brandrise 메인</a><br>
      D2C·자영업·시드~Pre-A 진단·컨설팅 · @brandrise_kr
    </div>
  </div>
</footer>

</body>
</html>
"""

# Order and labels for sections in HTML
SECTION_RENDER_ORDER = [
    ("한 줄 요약", "ONE-LINER", "사업 본질 한 줄", "card"),
    ("추정 단계", "STAGE", "현재 추정 단계", "card"),
    ("핵심 페인 (가설)", "PAIN POINTS", "사전 검색 기반 가설 페인", "card"),
    ("핵심 페인 (가설·리서치 검증됨)", "PAIN POINTS", "리서치 검증 페인", "card"),
    ("컨설팅 가설 (브랜드라이즈가 풀 수 있는 것)", "CONSULTING HYPOTHESIS", "브랜드라이즈가 풀 수 있는 것", "card-dark"),
    ("미팅 시 확인 질문", "MEETING QUESTIONS", "사전상담 도입 5분 어젠다 + 정량 진단", "questions"),
    ("출처", "SOURCES", "참고 출처", "sources"),
]


def render_brand_html(md_path: Path, slug: str, applicant_meta: tuple) -> str:
    parsed = parse_md(md_path)
    fm = parsed["frontmatter"]
    secs = parsed["sections"]

    # Pull metadata
    brand_title = fm.get("brand", slug)
    representative = applicant_meta[1] if applicant_meta else fm.get("representative", "")
    applied_date = applicant_meta[3] if applicant_meta else fm.get("applied_date", "")
    participants = applicant_meta[4] if applicant_meta else fm.get("participants", "1")
    confirmed = "확정" if (applicant_meta[5] if applicant_meta else fm.get("confirmed", "N")).strip("()").startswith("Y") else "예정"

    tier = SLUG_TIER.get(slug, "C")
    tier_meta = TIER_MAP[tier]
    hook = HOOKS.get(slug, "사전상담 준비 PREP")

    # Render sections in order
    blocks = []
    for sec_key, label, desc, kind in SECTION_RENDER_ORDER:
        content = secs.get(sec_key)
        if content is None:
            continue

        # Special handling for blockquote intro (yrim case)
        if kind == "questions":
            # Convert numbered list to question cards
            items = re.findall(r"^\d+\.\s+(.+?)$(?=\n\d+\.|\n\Z|$)", content, re.MULTILINE)
            if items:
                q_html = "\n".join(
                    f'      <div class="q-item"><div class="q-num">{i+1}</div><div class="q-text">{md_inline_to_html(it)}</div></div>'
                    for i, it in enumerate(items)
                )
                body_html = f'<div class="q-grid">\n{q_html}\n    </div>'
            else:
                body_html = paragraph_to_html(content)
        elif kind == "sources":
            lines = [ln.strip()[2:].strip() if ln.strip().startswith("- ") else ln.strip()
                     for ln in content.split("\n") if ln.strip()]
            li_html = "\n".join(f"      <li>{md_inline_to_html(ln)}</li>" for ln in lines if ln)
            body_html = f'<ul class="src-list">\n{li_html}\n    </ul>'
        elif kind == "card-dark":
            inner = paragraph_to_html(content)
            body_html = f'<div class="card card-dark">\n    {inner}\n    </div>'
        else:
            inner = paragraph_to_html(content)
            body_html = f'<div class="card">\n    {inner}\n    </div>'

        block = f"""
<section>
  <div class="container">
    <div class="sec-label">{label}</div>
    <h2>{html.escape(sec_key)}</h2>
    <p class="sec-desc">{desc}</p>
    {body_html}
  </div>
</section>"""
        blocks.append(block)

    # If intro has blockquote (yrim has existing research link), include it as top note
    if parsed.get("intro") and "&gt;" in html.escape(parsed["intro"]):
        # extract blockquote lines
        bq = "\n".join(ln.lstrip("> ").strip() for ln in parsed["intro"].split("\n") if ln.lstrip().startswith(">"))
        if bq:
            note = f"""
<section style="padding-top: 36px; padding-bottom: 0; border-bottom: none;">
  <div class="container">
    <div class="card card-dark" style="background: var(--accent); border-color: var(--accent);">
    {paragraph_to_html(bq)}
    </div>
  </div>
</section>"""
            blocks.insert(0, note)

    sections_html = "\n".join(blocks)

    return PREP_TEMPLATE.format(
        brand_title=html.escape(brand_title),
        tier_label=tier_meta["label"],
        tier_color=tier_meta["color"],
        tier_bg=tier_meta["bg"],
        hook=html.escape(hook),
        representative=html.escape(representative),
        applied_date=html.escape(applied_date),
        participants=html.escape(str(participants)),
        confirmed=confirmed,
        sections_html=sections_html,
    )


# ---------- HUB INDEX ----------

HUB_TEMPLATE = """<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>2026 Q2 PREP 배치 (사전상담 + 고벤처) — 브랜드라이즈 by HIZ</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
    :root {{
      --black: #14181A;
      --white: #FFFFFF;
      --bg: #F5F2EC;
      --accent: #2E5D4F;
      --accent-light: #ECF2EE;
      --accent-soft: #7FB89F;
      --gray-100: #F3F4F6;
      --gray-200: #E5E7EB;
      --gray-500: #6B7280;
      --gray-700: #374151;
      --text: #111827;
    }}
    body {{ font-family: 'Noto Sans KR', -apple-system, sans-serif; background: var(--bg); color: var(--text); line-height: 1.7; font-size: 14px; }}
    .container {{ max-width: 1080px; margin: 0 auto; padding: 0 48px; }}
    a {{ color: var(--accent); text-decoration: none; }}

    .topnav {{ background: var(--black); color: rgba(255,255,255,0.55); padding: 14px 0; font-size: 12px; }}
    .topnav .container {{ display: flex; justify-content: space-between; }}
    .topnav .brand {{ font-weight: 800; color: var(--white); }}
    .topnav a {{ color: rgba(255,255,255,0.55); }}

    .hero {{ background: var(--black); color: var(--white); padding: 100px 0 80px; }}
    .hero .label {{ font-size: 11px; font-weight: 700; letter-spacing: 0.18em; color: var(--accent-soft); text-transform: uppercase; margin-bottom: 24px; }}
    .hero h1 {{ font-size: 52px; font-weight: 900; line-height: 1.15; letter-spacing: -0.025em; margin-bottom: 24px; }}
    .hero h1 em {{ color: var(--accent-soft); font-style: normal; }}
    .hero .sub {{ font-size: 16px; color: rgba(255,255,255,0.6); max-width: 720px; line-height: 1.85; }}
    .hero-stats {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 32px; margin-top: 56px; padding-top: 36px; border-top: 1px solid rgba(255,255,255,0.1); }}
    .hero-stat .k {{ font-size: 10px; letter-spacing: 0.12em; color: rgba(255,255,255,0.35); text-transform: uppercase; margin-bottom: 8px; }}
    .hero-stat .v {{ font-size: 28px; font-weight: 900; letter-spacing: -0.02em; }}
    .hero-stat .v small {{ font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.4); }}

    section {{ padding: 80px 0; }}
    .sec-label {{ font-size: 10px; font-weight: 800; letter-spacing: 0.18em; color: var(--accent); text-transform: uppercase; margin-bottom: 14px; }}
    h2 {{ font-size: 32px; font-weight: 900; letter-spacing: -0.025em; margin-bottom: 14px; color: var(--black); }}
    .sec-desc {{ font-size: 15px; color: var(--gray-500); max-width: 620px; line-height: 1.85; margin-bottom: 40px; }}

    .tier-block {{ margin-bottom: 40px; }}
    .tier-head {{
      display: flex; align-items: baseline; gap: 14px; margin-bottom: 18px;
      padding-bottom: 14px; border-bottom: 1px solid var(--gray-200);
    }}
    .tier-pill {{
      display: inline-block; font-size: 11px; font-weight: 800;
      padding: 5px 12px; border-radius: 16px; letter-spacing: 0.1em; text-transform: uppercase;
    }}
    .tier-title {{ font-size: 18px; font-weight: 800; color: var(--black); }}
    .tier-count {{ font-size: 13px; color: var(--gray-500); }}

    .brand-grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }}
    .b-card {{
      background: var(--white); border-radius: 12px; border: 1px solid var(--gray-200);
      padding: 22px 24px; transition: all 0.15s;
      display: block; color: var(--text); text-decoration: none;
    }}
    .b-card:hover {{ border-color: var(--accent); transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.06); }}
    .b-card .bn {{ font-size: 15px; font-weight: 800; color: var(--black); margin-bottom: 4px; letter-spacing: -0.01em; }}
    .b-card .br {{ font-size: 12px; color: var(--gray-500); margin-bottom: 12px; }}
    .b-card .bh {{ font-size: 12px; color: var(--gray-700); line-height: 1.65; }}
    .b-card .bm {{
      display: flex; gap: 8px; margin-top: 12px; padding-top: 12px;
      border-top: 1px dashed var(--gray-200); font-size: 10px; color: var(--gray-500);
      align-items: center; flex-wrap: wrap;
    }}
    .src-badge {{
      display: inline-block; font-size: 9px; font-weight: 700;
      letter-spacing: 0.06em; padding: 2px 7px; border-radius: 10px;
      text-transform: uppercase;
    }}
    .src-badge.govent {{ background: #FEF3C7; color: #92400E; }}
    .src-badge.sangdam {{ background: #DBEAFE; color: #1E40AF; }}

    .ops-card {{
      background: var(--black); color: var(--white); border-radius: 18px;
      padding: 44px 52px; margin-top: 24px;
    }}
    .ops-card h3 {{ font-size: 22px; font-weight: 800; margin-bottom: 16px; color: var(--accent-soft); }}
    .ops-card ol {{ padding-left: 22px; }}
    .ops-card ol li {{ padding: 8px 0; color: rgba(255,255,255,0.75); }}
    .ops-card ol li::marker {{ color: var(--accent-soft); font-weight: 700; }}
    .ops-card .next {{ margin-top: 24px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 13px; color: rgba(255,255,255,0.55); }}

    .footer {{ background: var(--black); color: rgba(255,255,255,0.4); padding: 56px 0; text-align: center; }}
    .footer .brand {{ font-size: 18px; font-weight: 900; color: var(--white); margin-bottom: 6px; }}
    .footer .tag {{ font-size: 12px; margin-bottom: 28px; }}
    .footer .meta {{ font-size: 11px; line-height: 2; }}
    .footer a {{ color: rgba(255,255,255,0.55); }}

    @media (max-width: 720px) {{
      .hero h1 {{ font-size: 36px; }}
      .container {{ padding: 0 24px; }}
      .ops-card {{ padding: 32px 28px; }}
    }}
  </style>
</head>
<body>

<div class="topnav">
  <div class="container">
    <span class="brand">BRANDRISE · PREP</span>
    <a href="https://hizsystem.github.io/brandrise/">← brandrise 메인</a>
  </div>
</div>

<header class="hero">
  <div class="container">
    <div class="label">2026 Q2 · 사전상담 + 고벤처 PREP 통합 배치</div>
    <h1>49개 브랜드<br><em>1-page PREP</em></h1>
    <p class="sub">2026-05-11 ~ 22 사이 <strong style="color: #93C5FD;">사전상담 27건</strong> + <strong style="color: #FCD34D;">고벤처 행사 22건</strong> = 49개 브랜드 1-page PREP 패키지. 단계 추정·핵심 페인·컨설팅 가설·미팅 진입 질문 5개·출처를 견적서 톤으로 정리. 카드 우측 뱃지로 신청 경로 구분.</p>
    <div class="hero-stats">
      <div class="hero-stat"><div class="k">총 브랜드</div><div class="v">49 <small>(상담 27 · 행사 22)</small></div></div>
      <div class="hero-stat"><div class="k">S · 즉시 GO</div><div class="v" style="color: #7FB89F;">5</div></div>
      <div class="hero-stat"><div class="k">A · 명확</div><div class="v" style="color: #93C5FD;">14</div></div>
      <div class="hero-stat"><div class="k">B · 검증 후</div><div class="v" style="color: #FDBA74;">18</div></div>
      <div class="hero-stat"><div class="k">C · 정보 부족</div><div class="v" style="color: rgba(255,255,255,0.5);">12</div></div>
    </div>
  </div>
</header>

<section>
  <div class="container">
    <div class="sec-label">PRIORITY CURATION</div>
    <h2>우선순위 큐레이션</h2>
    <p class="sec-desc">웹 검색 기반 가설로 분류. S/A는 미팅 후 정식 리서치 승급 가능, B는 사업 확인·의사결정 라인 점검, C는 사업 본질 청취가 미팅 1순위.</p>

    {tier_blocks}
  </div>
</section>

<section style="background: var(--gray-100);">
  <div class="container">
    <div class="sec-label">MEETING OPERATIONS</div>
    <h2>미팅 운영 표준</h2>
    <p class="sec-desc">49건 공통 도입부 5분 어젠다. 그 다음 24문항 6영역 진단(브랜드 정체성 / 콘텐츠 / 채널 / 퍼포먼스 / 데이터 / 고객 관계) 진입.</p>
    <div class="ops-card">
      <h3>도입부 5분 · 공통 어젠다</h3>
      <ol>
        <li>30초 사업 소개 (카테고리·고객·매출 단계)</li>
        <li>동명/네이밍 충돌 차별화 의도</li>
        <li>의사결정 라인 (오늘 자리에서 결론 가능한지)</li>
        <li>컨설팅 후 1순위 기대 성과</li>
        <li>마케팅 예산 규모·의사결정 구조</li>
      </ol>
      <div class="next">→ 그 다음 <strong style="color: #7FB89F;">24문항 · 6영역 진단</strong> 진입.</div>
    </div>
  </div>
</section>

<footer class="footer">
  <div class="container">
    <div class="brand">BRANDRISE</div>
    <div class="tag">브랜드의 성장을 설계합니다.</div>
    <div class="meta">
      <a href="https://hizsystem.github.io/brandrise/">brandrise 메인</a> ·
      <a href="https://forms.gle/R5FaijsFD4VoTEsj9">진단 신청 폼</a><br>
      D2C·자영업·시드~Pre-A 진단·컨설팅 · @brandrise_kr · blog.naver.com/brandrise_kr
    </div>
  </div>
</footer>

</body>
</html>
"""


def render_hub() -> str:
    tier_groups = {"S": [], "A": [], "B": [], "C": []}
    for slug, applicant, brand, date, participants, confirmed in DISPLAY_ORDER:
        tier = SLUG_TIER.get(slug, "C")
        tier_groups[tier].append((slug, applicant, brand, date, participants, confirmed))

    tier_descriptions = {
        "S": "즉시 GO 후보 — 사업·단계·핏 명확",
        "A": "명확 케이스 — 진입 동선 설계 필요",
        "B": "검증 후 진입 — 의사결정·핏 확인",
        "C": "정보 부족 — 미팅 첫 5분이 결정",
    }

    blocks = []
    for tier in ["S", "A", "B", "C"]:
        meta = TIER_MAP[tier]
        cards = []
        for slug, applicant, brand, date, participants, confirmed in tier_groups[tier]:
            hook = HOOKS.get(slug, "")
            confirmed_label = "참여확정" if confirmed.strip("()").startswith("Y") else "예정"
            source = SLUG_SOURCE.get(slug, "sangdam")
            source_label = "행사" if source == "govent" else "상담"
            cards.append(f'''
      <a href="{slug}/" class="b-card">
        <div class="bn">{html.escape(brand)}</div>
        <div class="br">{html.escape(applicant)}</div>
        <div class="bh">{html.escape(hook)}</div>
        <div class="bm"><span class="src-badge {source}">{source_label}</span><span>{date}</span><span>·</span><span>{participants}명</span><span>·</span><span>{confirmed_label}</span></div>
      </a>''')
        block = f'''
    <div class="tier-block">
      <div class="tier-head">
        <span class="tier-pill" style="background: {meta["bg"]}; color: {meta["color"]};">{meta["label"]}</span>
        <span class="tier-title">{tier_descriptions[tier]}</span>
        <span class="tier-count">— {len(tier_groups[tier])}건</span>
      </div>
      <div class="brand-grid">{"".join(cards)}
      </div>
    </div>'''
        blocks.append(block)

    return HUB_TEMPLATE.format(tier_blocks="\n".join(blocks))


# ---------- MAIN ----------

def main():
    written = []

    # Render each brand
    for slug, applicant, brand, date, participants, confirmed in DISPLAY_ORDER:
        md_path = PREP_DIR / f"{slug}.md"
        if not md_path.exists():
            print(f"SKIP: {md_path}")
            continue

        # If multi-applicant brand (mixroom, whatsup-house), only render once
        out_dir = OUT_DIR / slug
        if (out_dir / "index.html").exists() and slug in ("mixroom", "whatsup-house"):
            # Already rendered for first applicant
            continue

        out_dir.mkdir(parents=True, exist_ok=True)
        html_str = render_brand_html(md_path, slug, (slug, applicant, brand, date, participants, confirmed))
        (out_dir / "index.html").write_text(html_str, encoding="utf-8")
        written.append(str(out_dir / "index.html"))

    # Render hub
    hub_path = OUT_DIR / "index.html"
    hub_path.write_text(render_hub(), encoding="utf-8")
    written.append(str(hub_path))

    print(f"Wrote {len(written)} files:")
    for w in written:
        print(f"  {w}")


if __name__ == "__main__":
    main()
