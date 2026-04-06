#!/usr/bin/env python3
"""슈퍼세이브 리서치 PPT용 차트/이미지 생성"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np
import os

OUT_DIR = os.path.dirname(os.path.abspath(__file__))

# ── 폰트 설정 ──
plt.rcParams['font.family'] = 'Noto Sans KR'
plt.rcParams['axes.unicode_minus'] = False

# ── 컬러 ──
ACCENT = '#2d3a8c'
ORANGE = '#e8491d'
BLUE = '#3b82f6'
GREEN = '#10b981'
PURPLE = '#8b5cf6'
RED = '#ef4444'
GRAY = '#6b7280'
DARK = '#1a1a1a'
LIGHT = '#f9fafb'


def save(fig, name):
    path = os.path.join(OUT_DIR, name)
    fig.savefig(path, dpi=200, bbox_inches='tight', facecolor='white', transparent=False)
    plt.close(fig)
    print(f"  ✅ {name}")


# ═══════════════════════════════════════
# 1. 건강기능식품 시장 규모 추이
# ═══════════════════════════════════════
fig, ax = plt.subplots(figsize=(10, 4.5))
years = [2021, 2022, 2023, 2024, 2025]
values = [5.69, 6.15, 6.14, 5.95, 5.96]
colors = [ACCENT if v >= 6 else BLUE for v in values]
bars = ax.bar(years, values, color=colors, width=0.6, zorder=3, edgecolor='white', linewidth=1.5)

for bar, val in zip(bars, values):
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.08,
            f'{val}조', ha='center', va='bottom', fontsize=13, fontweight='bold', color=DARK)

growth = [None, '+8.1%', '-0.1%', '-3.1%', '+0.2%']
for i, g in enumerate(growth):
    if g:
        c = GREEN if g.startswith('+') else RED
        ax.text(years[i], 0.3, g, ha='center', fontsize=10, fontweight='bold', color=c)

ax.set_ylim(0, 7.2)
ax.set_xlim(2020.3, 2025.7)
ax.set_ylabel('시장 규모 (조 원)', fontsize=11, color=GRAY)
ax.set_title('건강기능식품 시장 규모 추이', fontsize=16, fontweight='bold', color=DARK, pad=15)
ax.set_xticks(years)
ax.set_xticklabels([str(y) for y in years], fontsize=12, color=DARK)
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
ax.spines['left'].set_color('#e5e7eb')
ax.spines['bottom'].set_color('#e5e7eb')
ax.yaxis.set_visible(False)
ax.grid(axis='y', color='#f3f4f6', linewidth=0.8, zorder=0)
fig.text(0.99, 0.02, '출처: 한국건강기능식품협회, e-나라지표 (2026.04)', ha='right', fontsize=7, color=GRAY)
save(fig, 'chart_market_size.png')


# ═══════════════════════════════════════
# 2. 유통 채널 비중 파이차트
# ═══════════════════════════════════════
fig, ax = plt.subplots(figsize=(8, 5))
labels = ['오픈마켓\n(쿠팡, 11번가)', '자사 쇼핑몰', '네이버\n스마트스토어', 'TV홈쇼핑\n라이브커머스', '프리미엄마켓\n(오아시스 등)']
sizes = [37.5, 22.5, 17.5, 12.5, 10]
colors_pie = [BLUE, GREEN, ACCENT, ORANGE, PURPLE]
explode = (0.03, 0.03, 0.03, 0.08, 0.03)

wedges, texts, autotexts = ax.pie(sizes, labels=labels, colors=colors_pie, explode=explode,
                                   autopct='%1.0f%%', startangle=90,
                                   textprops={'fontsize': 10, 'color': DARK},
                                   pctdistance=0.75, labeldistance=1.15)
for t in autotexts:
    t.set_fontsize(11)
    t.set_fontweight('bold')
    t.set_color('white')

ax.set_title('곰보배추시럽 유통 채널 비중 (추정)', fontsize=15, fontweight='bold', color=DARK, pad=20)
save(fig, 'chart_channel_pie.png')


# ═══════════════════════════════════════
# 3. 가격 포지셔닝 차트 (수평 바)
# ═══════════════════════════════════════
fig, ax = plt.subplots(figsize=(10, 4))
brands = ['곰배랑효소랑', '슈퍼세이브', '오늘과일', '슬리아 곰백보관', '한국유기농', '새잎']
prices = [900, 1150, 1430, 1750, 1780, 2255]  # 45100/20 approx
bar_colors = [GREEN, ORANGE, BLUE, PURPLE, BLUE, BLUE]

bars = ax.barh(brands, prices, color=bar_colors, height=0.55, zorder=3, edgecolor='white', linewidth=1)
for bar, price in zip(bars, prices):
    ax.text(bar.get_width() + 30, bar.get_y() + bar.get_height()/2,
            f'{price:,}원/포', va='center', fontsize=11, fontweight='bold', color=DARK)

ax.set_xlim(0, 2800)
ax.set_title('브랜드별 스틱 단가 비교', fontsize=15, fontweight='bold', color=DARK, pad=15)
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
ax.spines['left'].set_color('#e5e7eb')
ax.spines['bottom'].set_color('#e5e7eb')
ax.xaxis.set_visible(False)
ax.grid(axis='x', color='#f3f4f6', linewidth=0.8, zorder=0)
ax.tick_params(axis='y', labelsize=11)

# highlight supersave
ax.get_yticklabels()[1].set_color(ORANGE)
ax.get_yticklabels()[1].set_fontweight('bold')
save(fig, 'chart_price_comparison.png')


# ═══════════════════════════════════════
# 4. 포지셔닝 맵 (산점도)
# ═══════════════════════════════════════
fig, ax = plt.subplots(figsize=(10, 7))
ax.set_facecolor('#f9fafb')

# Axes
ax.axhline(y=0, color='#e5e7eb', linewidth=1, zorder=1)
ax.axvline(x=0, color='#e5e7eb', linewidth=1, zorder=1)

brands_map = [
    ('슈퍼세이브', -0.5, 0.8, ORANGE, 18, 700),
    ('슬리아\n곰백보관', 1.5, 1.5, PURPLE, 14, 400),
    ('한국유기농', 0.3, -0.8, BLUE, 14, 400),
    ('오늘과일', -0.3, 0.3, GREEN, 14, 350),
    ('곰배랑\n효소랑', -1.8, -1.2, GRAY, 13, 300),
    ('사온데', -2.0, -1.5, '#9ca3af', 12, 250),
    ('새잎', 0.8, -0.3, '#64748b', 12, 250),
]

for name, x, y, color, fs, size in brands_map:
    ax.scatter(x, y, s=size, c=color, zorder=5, edgecolors='white', linewidth=2, alpha=0.9)
    ax.annotate(name, (x, y), fontsize=fs, fontweight='bold', color=color,
                ha='center', va='center', zorder=6)

ax.set_xlim(-3, 3)
ax.set_ylim(-2.5, 2.5)
ax.set_xlabel('← 전통/자연                                                과학/기능성 →',
              fontsize=11, color=GRAY, labelpad=10)
ax.set_ylabel('← 가성비                                    프리미엄 →',
              fontsize=11, color=GRAY, labelpad=10)
ax.set_title('경쟁사 포지셔닝 맵', fontsize=16, fontweight='bold', color=DARK, pad=15)
ax.set_xticks([])
ax.set_yticks([])
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
ax.spines['left'].set_color('#e5e7eb')
ax.spines['bottom'].set_color('#e5e7eb')
save(fig, 'chart_positioning_map.png')


# ═══════════════════════════════════════
# 5. 소비자 세그먼트 비중
# ═══════════════════════════════════════
fig, ax = plt.subplots(figsize=(8, 5))
segments = ['건강관심\n중년층', '육아맘', 'MZ\n건강족', '선물\n구매자']
shares = [35, 30, 20, 15]
colors_seg = [ACCENT, ORANGE, PURPLE, GREEN]

bars = ax.bar(segments, shares, color=colors_seg, width=0.6, zorder=3, edgecolor='white', linewidth=1.5)
for bar, val in zip(bars, shares):
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1,
            f'{val}%', ha='center', va='bottom', fontsize=14, fontweight='bold', color=DARK)

ax.set_ylim(0, 48)
ax.set_title('곰보배추시럽 추정 소비자 세그먼트', fontsize=15, fontweight='bold', color=DARK, pad=15)
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
ax.spines['left'].set_color('#e5e7eb')
ax.spines['bottom'].set_color('#e5e7eb')
ax.yaxis.set_visible(False)
ax.grid(axis='y', color='#f3f4f6', linewidth=0.8, zorder=0)
save(fig, 'chart_consumer_segments.png')


# ═══════════════════════════════════════
# 6. SWOT 매트릭스 이미지
# ═══════════════════════════════════════
fig, axes = plt.subplots(2, 2, figsize=(10, 7))
fig.suptitle('슈퍼세이브 SWOT 분석', fontsize=16, fontweight='bold', color=DARK, y=0.98)

swot_data = [
    ('S — 강점', BLUE, '#eff6ff', [
        'CJ온스타일 입점 (TV홈쇼핑 유일)',
        '리뷰 1,564개 / 평점 4.9',
        '"원조" 포지셔닝',
        '엄마 소비자 신뢰 스토리',
    ]),
    ('W — 약점', ORANGE, '#fff7ed', [
        'SNS/디지털 마케팅 취약',
        '네이밍 혼선 (슈퍼세이브=?)',
        '제품 라인업 단조',
        '브랜드 아이덴티티 미약',
    ]),
    ('O — 기회', GREEN, '#ecfdf5', [
        '호흡기 건강 관심 지속',
        'MZ세대 건강즙 시장 진입',
        '유아 건강식품 급성장',
        '라이브커머스/숏폼 채널',
    ]),
    ('T — 위협', RED, '#fef2f2', [
        '영세 업체 난립 / 품질 신뢰↓',
        '대형 식품기업 진출 가능성',
        '일반식품 분류 (기능성 표시 불가)',
        '원료 수급 불안정',
    ]),
]

for idx, (title, color, bg, items) in enumerate(swot_data):
    ax = axes[idx // 2][idx % 2]
    ax.set_facecolor(bg)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.set_xticks([])
    ax.set_yticks([])
    ax.set_title(title, fontsize=13, fontweight='bold', color=color, pad=8)
    for i, item in enumerate(items):
        ax.text(0.08, 0.82 - i * 0.22, f'• {item}', fontsize=10, color=DARK,
                va='top', transform=ax.transAxes)
    for spine in ax.spines.values():
        spine.set_color('#e5e7eb')

plt.tight_layout(rect=[0, 0, 1, 0.95])
save(fig, 'chart_swot.png')


# ═══════════════════════════════════════
# 7. 글로벌 허벌 시장 규모
# ═══════════════════════════════════════
fig, ax = plt.subplots(figsize=(10, 4.5))
years_g = [2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030]
values_g = [2100, 2250, 2512, 2700, 2900, 3120, 3350, 3600, 4200]
ax.plot(years_g, values_g, color=ACCENT, linewidth=3, marker='o', markersize=8, zorder=5,
        markerfacecolor='white', markeredgecolor=ACCENT, markeredgewidth=2)
ax.fill_between(years_g, values_g, alpha=0.08, color=ACCENT)

for i, (yr, val) in enumerate(zip(years_g, values_g)):
    if yr in [2022, 2024, 2030]:
        ax.annotate(f'${val:,}억', (yr, val), textcoords="offset points",
                    xytext=(0, 15), ha='center', fontsize=11, fontweight='bold', color=ACCENT)

ax.set_ylim(1500, 4800)
ax.set_title('글로벌 허벌 보충제 시장 전망 (억 USD)', fontsize=15, fontweight='bold', color=DARK, pad=15)
ax.set_xticks(years_g)
ax.set_xticklabels([str(y) for y in years_g], fontsize=10, color=DARK)
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
ax.spines['left'].set_color('#e5e7eb')
ax.spines['bottom'].set_color('#e5e7eb')
ax.grid(axis='y', color='#f3f4f6', linewidth=0.8, zorder=0)
ax.yaxis.set_visible(False)

# CAGR annotation
ax.annotate('CAGR 7.4%', xy=(2027, 3120), xytext=(2028.5, 2500),
            fontsize=12, fontweight='bold', color=GREEN,
            arrowprops=dict(arrowstyle='->', color=GREEN, lw=1.5))

fig.text(0.99, 0.02, '출처: Grand View Research, Mordor Intelligence (2026)', ha='right', fontsize=7, color=GRAY)
save(fig, 'chart_global_market.png')


# ═══════════════════════════════════════
# 8. 핵심 기회 포인트 인포그래픽
# ═══════════════════════════════════════
fig, ax = plt.subplots(figsize=(10, 5))
ax.set_xlim(0, 10)
ax.set_ylim(0, 5)
ax.set_xticks([])
ax.set_yticks([])
for spine in ax.spines.values():
    spine.set_visible(False)

opportunities = [
    (1.25, 3.5, '브랜딩 강화', '"원조" 포지셔닝\n시각화 · BI 재설계', ACCENT, '🎨'),
    (3.75, 3.5, '디지털 마케팅', '인스타/유튜브/틱톡\n엄마 인플루언서 협업', BLUE, '📱'),
    (6.25, 3.5, '유아 라인 확장', '유아/어린이 전용\n프리미엄 포지셔닝', GREEN, '👶'),
    (8.75, 3.5, '채널 다각화', '쿠팡/네이버 강화\n라이브커머스 정기편성', ORANGE, '🛒'),
]

for x, y, title, desc, color, emoji in opportunities:
    circle = plt.Circle((x, y), 0.7, facecolor=color, alpha=0.12, edgecolor=color, linewidth=2)
    ax.add_patch(circle)
    ax.text(x, y + 0.15, emoji, fontsize=22, ha='center', va='center')
    ax.text(x, y - 0.5, title, fontsize=12, fontweight='bold', color=color, ha='center')
    ax.text(x, y - 1.1, desc, fontsize=9, color=GRAY, ha='center', linespacing=1.6)

# Arrows between circles
for i in range(3):
    x1 = opportunities[i][0] + 0.8
    x2 = opportunities[i+1][0] - 0.8
    ax.annotate('', xy=(x2, 3.5), xytext=(x1, 3.5),
                arrowprops=dict(arrowstyle='->', color='#d1d5db', lw=2))

ax.set_title('핵심 기회 포인트', fontsize=16, fontweight='bold', color=DARK, pad=20)
save(fig, 'chart_opportunities.png')


# ═══════════════════════════════════════
# 9. 전략 로드맵 타임라인
# ═══════════════════════════════════════
fig, ax = plt.subplots(figsize=(12, 4))
ax.set_xlim(-0.5, 10.5)
ax.set_ylim(-1, 3.5)
ax.set_xticks([])
ax.set_yticks([])
for spine in ax.spines.values():
    spine.set_visible(False)

# Timeline bar
ax.fill_between([0, 10], -0.15, 0.15, color='#e5e7eb', zorder=1)

phases = [
    (1.5, BLUE, 'Phase 1', '기반 구축', '1-6개월', ['브랜드 BI 리뉴얼', '디지털 채널 구축', 'SNS 콘텐츠 시작']),
    (5.0, GREEN, 'Phase 2', '성장 가속', '6-12개월', ['쿠팡/네이버 확대', '인플루언서 협업', '유아 라인 출시']),
    (8.5, PURPLE, 'Phase 3', '글로벌 확장', '12-24개월', ['해외 시장 진입', '오프라인 리테일', '글로벌 캠페인']),
]

for x, color, phase, subtitle, period, items in phases:
    # Node
    circle = plt.Circle((x, 0), 0.25, facecolor=color, edgecolor='white', linewidth=3, zorder=5)
    ax.add_patch(circle)

    # Phase title
    ax.text(x, 0.7, phase, fontsize=13, fontweight='bold', color=color, ha='center')
    ax.text(x, 1.1, subtitle, fontsize=11, fontweight='bold', color=DARK, ha='center')
    ax.text(x, 1.5, period, fontsize=9, color=GRAY, ha='center',
            bbox=dict(boxstyle='round,pad=0.3', facecolor=LIGHT, edgecolor='#e5e7eb'))

    # Items
    for i, item in enumerate(items):
        ax.text(x, 2.1 + i * 0.35, f'• {item}', fontsize=9, color=GRAY, ha='center')

ax.set_title('전략 로드맵', fontsize=16, fontweight='bold', color=DARK, pad=15)
save(fig, 'chart_roadmap.png')


# ═══════════════════════════════════════
# 10. 구매 여정 퍼널
# ═══════════════════════════════════════
fig, ax = plt.subplots(figsize=(10, 5))
ax.set_xlim(0, 10)
ax.set_ylim(0, 6)
ax.set_xticks([])
ax.set_yticks([])
for spine in ax.spines.values():
    spine.set_visible(False)

stages = [
    (5, 5.2, 8, '인지', '블로그/카페 후기, 지인 추천, TV홈쇼핑', ACCENT),
    (5, 4.2, 6.5, '탐색', '네이버 검색, 쿠팡/오아시스 비교', BLUE),
    (5, 3.2, 5, '비교', '가격, 리뷰, 원산지, 성분 확인', PURPLE),
    (5, 2.2, 3.5, '구매', '쿠팡/스마트스토어/자사몰/홈쇼핑', GREEN),
    (5, 1.2, 2.5, '재구매', '효과 체감 시 정기 구매 전환', ORANGE),
]

for cx, cy, width, stage, desc, color in stages:
    trap = mpatches.FancyBboxPatch((cx - width/2, cy - 0.35), width, 0.7,
                                    boxstyle="round,pad=0.1", facecolor=color, alpha=0.15,
                                    edgecolor=color, linewidth=1.5)
    ax.add_patch(trap)
    ax.text(cx - width/2 + 0.3, cy, stage, fontsize=12, fontweight='bold', color=color, va='center')
    ax.text(cx + 0.5, cy, desc, fontsize=10, color=GRAY, va='center')

ax.set_title('소비자 구매 여정 (Purchase Journey)', fontsize=15, fontweight='bold', color=DARK, pad=15)
save(fig, 'chart_purchase_journey.png')


print(f"\n🎉 총 10개 차트 생성 완료!")
