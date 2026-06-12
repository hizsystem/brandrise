# BRANDRISE 템플릿 레이아웃 업그레이드 스펙 (veggiet DNA → 인디고 클린)

> 제정 2026-06-12. 대표가 베지어트 7월 페이지의 **레이아웃·가독성·구성**을 좋게 봄 →
> 그 레이아웃 DNA를 브랜드라이즈 4종 템플릿에 이식한다.
> ⛔ **색·폰트는 차용 금지** — 인디고 클린 토큰(아래) 그대로. 베지어트의 웜페이퍼/그린/브라운은 전부 인디고·중성으로 치환.
> ⛔ **NGT 케이스 콘텐츠는 한 글자도 바꾸지 말 것** — 레이아웃/마크업만 업그레이드. 수치·문장·금액 유지.
> 이 업그레이드는 **가산(additive)** 이다 — 기존 CSS(hero/sec-k/card/co/t/table/steps/total/tl/footer)는 유지하고 아래 컴포넌트를 추가/적용.

## 0. 불변 토큰 (전 템플릿 공통 — 이미 적용됨, 유지)

```css
:root{
  --ink:#0f172a; --ink2:#334155; --muted:#64748b; --line:#e7e9ee; --line2:#eef1f5;
  --bg:#fbfcfd; --card:#fff; --soft:#f6f8fb;
  --ac:#4f46e5; --ac-50:#eef2ff; --ac-100:#e0e7ff; --ac-700:#3730a3;
  --ok:#0e9f6e; --ok-50:#ecfdf5; --warn:#d97706; --warn-50:#fffbeb; --bad:#e11d48; --bad-50:#fef2f4;
}
```
폰트 = Pretendard. 모든 신규 컴포넌트는 위 토큰만 사용. 새 색 도입 금지.

---

## 1. 신규/업그레이드 컴포넌트 CSS (그대로 붙여넣기 — 전 HTML 템플릿 공통)

```css
/* ===== 1) 에디토리얼 커버 업그레이드 (.hero h1에 형광 언더라인) ===== */
.hero h1{font-size:clamp(28px,4.6vw,40px)}           /* 반응형 확대 */
.hero h1 .hl{background:linear-gradient(transparent 60%, rgba(165,180,252,.55) 60%);padding:0 2px;border-radius:2px}
/* 사용: <h1>[브랜드] 브랜드 컨설팅 <span class="hl">견적서</span></h1> */

/* ===== 2) 스티키 TOC 탭바 (hero 바로 아래) ===== */
.toc{position:sticky;top:0;z-index:50;display:flex;background:var(--card);
  border-bottom:1px solid var(--line);box-shadow:0 1px 0 var(--line)}
.toc a{flex:1;text-align:center;padding:13px 6px;font-size:12.5px;font-weight:700;
  color:var(--ink2);text-decoration:none;border-right:1px solid var(--line2);transition:.15s}
.toc a:last-child{border-right:none}
.toc a:hover{background:var(--ac-50);color:var(--ac)}
.toc a.on{color:var(--ac);box-shadow:inset 0 -2px 0 var(--ac)}

/* ===== 3) ★ A/B 견적 비교 그리드 (대표 핵심 요구: "차이를 눈으로") ===== */
/* 좌=A안(진입/코어) · 가운데 화살표 · 우=B안(권장/풀, 인디고 반전 강조) */
.ab{display:grid;grid-template-columns:1fr 56px 1.08fr;gap:0;align-items:stretch;margin:18px 0 8px}
.ab-card{border:1.5px solid var(--line);border-radius:16px;padding:24px 26px;background:var(--card);display:flex;flex-direction:column}
.ab-card.rec{background:var(--ink);color:#fff;border-color:var(--ink)}      /* 권장안 = 다크 반전 */
.ab-card .ab-k{font-size:11px;font-weight:800;letter-spacing:.14em;color:var(--muted);margin-bottom:6px}
.ab-card.rec .ab-k{color:#a5b4fc}
.ab-card .ab-nm{font-size:18px;font-weight:800;letter-spacing:-.01em;margin-bottom:14px}
.ab-card .ab-amt{font-size:30px;font-weight:800;letter-spacing:-.02em;line-height:1.1}
.ab-card.rec .ab-amt{color:#a5b4fc}
.ab-card .ab-amt small{font-size:13px;font-weight:600;color:var(--muted);margin-left:6px}
.ab-card.rec .ab-amt small{color:#cbd5e1}
.ab-card .ab-rows{margin-top:16px;display:flex;flex-direction:column;gap:8px}
.ab-card .ab-rows div{font-size:13px;display:flex;gap:12px;justify-content:space-between;
  border-top:1px dashed var(--line);padding-top:8px}
.ab-card.rec .ab-rows div{border-color:rgba(255,255,255,.16);color:#e2e8f0}
.ab-card .ab-tag{margin-top:auto;padding-top:14px;font-size:12px;font-weight:700;color:var(--ac)}
.ab-card.rec .ab-tag{color:#a5b4fc}
.ab-arrow{display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;color:var(--ac)}
/* 사용 예 (블록 깊이로 금액 차이 — 단가 동일, 항목 가감만):
<div class="ab">
  <div class="ab-card">
    <div class="ab-k">PLAN A · 코어(진입 앵커)</div><div class="ab-nm">데이터 진단 + 핵심 리브랜딩</div>
    <div class="ab-amt">3,000<small>만원~ · VAT 별도</small></div>
    <div class="ab-rows"><div><span>블록 1 진단</span><b>포함</b></div>...</div>
    <div class="ab-tag">작은 yes로 시작 — 진단 결과 후 확장</div>
  </div>
  <div class="ab-arrow">→</div>
  <div class="ab-card rec">
    <div class="ab-k">PLAN B · 풀(권장)</div><div class="ab-nm">6개월 풀 파트너십</div>
    <div class="ab-amt">1억~<small>· VAT 별도</small></div>
    <div class="ab-rows">...</div>
    <div class="ab-tag">토대를 제대로 — 진단→브랜딩→디자인→런칭</div>
  </div>
</div>  */

/* ===== 4) evidence 박스 (스샷/증빙 — 진단서·PREP 리서치 캡처용) ===== */
.evi{border:1.5px solid var(--line);border-radius:14px;overflow:hidden;background:var(--card);margin:14px 0}
.evi .eh{padding:11px 16px;font-size:12.5px;font-weight:800;background:var(--soft);border-bottom:1px solid var(--line);color:var(--ink2)}
.evi img{display:block;width:100%;height:auto}
.evi .en{padding:9px 16px;font-size:12px;color:var(--muted);border-top:1px dashed var(--line)}

/* ===== 5) layer 스택 (이름|기간|설명 가로 레이어 — 프로세스 단계/행사구조) ===== */
.stack{display:flex;flex-direction:column;gap:8px;margin:14px 0}
.layer{display:grid;grid-template-columns:130px 150px 1fr;border:1.5px solid var(--line);border-radius:12px;overflow:hidden;background:var(--card)}
.layer .ln{padding:14px 16px;font-weight:800;font-size:14px;background:var(--ac-50);color:var(--ac-700);display:flex;align-items:center}
.layer .lp{padding:14px 12px;font-size:12.5px;font-weight:700;color:var(--ink2);display:flex;align-items:center;border-left:1px dashed var(--line);border-right:1px dashed var(--line)}
.layer .ld{padding:14px 18px;font-size:13px;color:var(--ink2);display:flex;align-items:center}

/* ===== 6) 역할/팩트 카드 그리드 (역할분담·핵심 팩트 3~4열) ===== */
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin:14px 0}
.fcard{border:1.5px solid var(--line);border-radius:14px;background:var(--card);padding:18px 20px}
.fcard .fk{font-size:11px;font-weight:800;letter-spacing:.1em;color:var(--muted);margin-bottom:8px}
.fcard .fv{font-size:15px;font-weight:800;color:var(--ink)}

/* ===== 반응형 ===== */
@media(max-width:880px){
  .ab{grid-template-columns:1fr;gap:10px}
  .ab-arrow{transform:rotate(90deg);padding:2px 0}
  .layer{grid-template-columns:110px 1fr}
  .layer .lp{border-right:none}
  .layer .ld{grid-column:1/3;border-top:1px dashed var(--line)}
  .toc{display:none}
}
@media print{
  .toc{display:none}
  .ab-card,.evi,.layer,.fcard{break-inside:avoid}
}
```

---

## 2. 템플릿별 적용 지시

공통: ① 위 CSS를 기존 `<style>` 끝에 추가 ② hero 아래 스티키 `.toc` 추가(섹션 id로 앵커) ③ h1에 `.hl` 적용 ④ **콘텐츠(NGT 문구·수치·금액) 절대 불변** ⑤ 브라우저+인쇄(PDF) 둘 다 안 깨지게 ⑥ 기존 `@media print` 규칙 유지/병합.

### A. `quote/_template/quote-template.html` (★ 최우선 — A/B 그리드 신설)
- 현재 단일 블록0~5/단일 total 구조 위에, **블록 표 위쪽에 `.ab` A/B 비교 그리드 섹션 신설** (섹션 id=`ab`, sec-k="PLAN A vs B").
- A안 = 진입 앵커(블록1 진단 단독 + 핵심), B안 = 6개월 풀(현 103,400,000 구조). **단가는 동일, 차이는 블록 깊이/항목 가감으로만** 표현(단가 공유 원칙). 기존 블록 표의 소계/금액을 근거로 A/B 숫자 구성.
- 기존 진단맵·블록표·steps·total·notes는 그대로 두되, total 위에 "위 B안 = 아래 상세" 한 줄 연결.
- TOC 탭 = 진단맵 · A/B · 블록상세 · 일정 · 비고.

### B. `research/_template/prep-v2-template.html` (상담 前 — 가설 표기 유지)
- 에디토리얼 커버 + 스티키 TOC + 섹션 카드화. 진단/니즈/적합도는 **"가설" 표기 절대 유지**.
- 직접 리서치 캡처가 있으면 `.evi`로 액자화, 참고 출처 2분류 유지.
- 핵심 팩트(브랜드 규모·채널 등)는 `.cards`(.fcard)로 스캔 가능하게.

### C. `research/_template/diagnosis-template.html` (상담 後 — 견적 근거)
- 커버 + TOC + **병목 ①~⑧을 `.cards` 또는 `.layer`로 카드화**(현 표 → 카드, 단 번호↔견적블록 대응 유지).
- 상담 발언 인용은 `.co`(콜아웃)로, "발언 기반 추정" 표기 유지.
- 데이터 근거 스샷은 `.evi`.

### D. `quote/_template/quote-builder-template.gs` (구글시트 — 이번 범위 제외/후순위)
- `renderQuote_()` 엔진 **수정 금지**. 이번 레이아웃 업그레이드는 HTML 3종만. 시트는 밴드 색만 인디고 유지(이미 적용), 손대지 않음.

---

## 3. 검수 기준 (완성 정의)
- [ ] 인디고 토큰 외 새 색 0건 · Pretendard 유지
- [ ] NGT 콘텐츠 디프 = 마크업/클래스만, 텍스트·수치·금액 불변
- [ ] A/B 그리드가 모바일에서 세로 붕괴 + 화살표 회전
- [ ] 인쇄(PDF) 시 카드·그리드 break-inside 안 깨짐
- [ ] TOC 스티키 동작 · 앵커 점프 정상
- [ ] 브라우저 렌더 확인(깨짐 0)

---

# v2 — 대표 피드백 반영 (2026-06-12, 같은 날)

> 피드백: "베지어트에서 **위 메뉴(상단 TOC)만 따라한** 느낌. 사이드바 있으면 그건 오히려 불필요.
> 대표가 좋아한 건 **디자인 완성도·가독성·이미지가 들어간 비주얼**." → v1의 표면(상단 탭바)을 걷어내고 알맹이로.

## v2-① 상단 TOC 탭바 제거 (전 템플릿)
- v1에서 추가한 hero 아래 **수평 TOC 탭바(`.toc`/`.tabbar`)를 마크업·CSS 모두 삭제**.
- PREP의 **기존 좌측 사이드바(`nav.toc`)는 그대로 유지** — 거기에 탭바를 또 단 게 중복이었음. 사이드바 스크롤스파이만 남김.
- 견적서·진단서(사이드바 없음): 탭바 없이 가되, 섹션이 길면 hero 아래 **얇은 한 줄 텍스트 목차(클릭 가능, 박스/배경 없는 인라인 `· 진단 · 견적 · 일정` 정도)**만. 메뉴바 느낌 금지.

## v2-② ★ 리서치 캡처 이미지 슬롯 (이번 핵심 — "이미지가 들어간 부분")
문서가 비주얼하게 보이도록 **리서치 캡처 자리를 디자인된 슬롯**으로. 빈 상태도 의도된 디자인으로 보이고, 실제 캡처(상담준비 때)를 넣으면 바로 리치해짐.

```css
/* 리서치 캡처 그리드 — 광고 대시보드·경쟁사·SNS 현황 등 */
.shots{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px;margin:16px 0 6px}
.shot{border:1px solid var(--line);border-radius:14px;overflow:hidden;background:var(--card);box-shadow:0 1px 2px rgba(15,23,42,.04)}
.shot .sk{display:flex;align-items:center;gap:7px;padding:9px 13px;font-size:11px;font-weight:800;letter-spacing:.08em;color:var(--ac);background:var(--ac-50);border-bottom:1px solid var(--ac-100)}
.shot .sk::before{content:"";width:6px;height:6px;border-radius:2px;background:var(--ac)}
.shot .sfig{aspect-ratio:16/10;background:var(--soft);display:block;width:100%;object-fit:cover}
/* 빈 슬롯(placeholder) 상태 — 점선 안내 */
.shot .sph{aspect-ratio:16/10;background:repeating-linear-gradient(45deg,var(--soft),var(--soft) 10px,#f0f3f8 10px,#f0f3f8 20px);
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;color:var(--muted);text-align:center;padding:14px}
.shot .sph .ic{font-size:22px;opacity:.5}
.shot .sph .pl{font-size:12px;font-weight:700;color:var(--ink2)}
.shot .scap{padding:10px 14px;font-size:12px;color:var(--muted);line-height:1.55;border-top:1px solid var(--line2)}
.shot .scap b{color:var(--ink2)}
@media print{.shot{break-inside:avoid}}
```
사용(빈 슬롯 — 템플릿 기본):
```html
<div class="shots">
  <figure class="shot">
    <div class="sk">광고 대시보드</div>
    <div class="sph"><div class="ic">📊</div><div class="pl">메타 광고 캡처</div></div>
    <figcaption class="scap"><b>메타 ROAS 0.3</b> · 월 700만 집행 — 상담 시 대시보드 캡처 삽입</figcaption>
  </figure>
  <!-- 채울 때: <img class="sfig" src="..."> 로 .sph 교체 -->
</div>
```
배치: **진단서** = 데이터 근거(광고 대시보드·매출 추이·CRM)·경쟁/SNS 현황. **PREP** = 광고 대시보드·경쟁사·인스타 현황(상담 전 직접 리서치 캡처). **견적서** = 선택(딜리버러블 레퍼런스 정도, 과하지 않게).

## v2-③ 디자인·가독성 격상 (전 템플릿 공통 — 표면 아닌 알맹이)
인디고 토큰 안에서 "디자인된 문서"로:
1. **섹션 호흡 키우기**: section 간 여백 ↑(예 `section{margin-bottom:64px}`), 섹션 시작에 sec-k 칩 + 큰 h2 + lead 대비 강화.
2. **핵심 한 줄 밴드**: 각 섹션 결론을 `.co.ac`(인디고 연한 배경) **풀폭 밴드**로 시각 강조 — 베지어트의 컬러 블록 역할(색은 인디고만).
3. **숫자/지표 강조**: 중요 수치(ROAS 0.3, 매출 60%, 103,400,000 등)는 `.fcard .fv`처럼 **크게**. 표 안 묻힌 핵심 숫자를 카드/콜아웃으로 끌어올리기.
4. **표 가독성**: zebra(행 교차 `var(--soft)`), th 인디고 틴트, 숫자열 tabular-nums 유지, 셀 패딩 ↑.
5. **타이포 리듬**: h2/h3 letter-spacing·line-height 정돈, 본문 15px 유지, 강조는 굵기/색(인디고)으로.
6. **인쇄 안전**: 모든 신규 블록 `break-inside:avoid`.
⛔ 새 색 금지(인디고/중성 토큰만), Pretendard 유지, **NGT 콘텐츠 문구·수치·금액 불변**(마크업/표현만).

## v2 검수
- [ ] 상단 탭바 0개 (PREP는 좌측 사이드바만) · 메뉴바 느낌 제거
- [ ] 리서치 캡처 슬롯이 빈 상태에서도 "디자인된" 느낌 (점선 placeholder + 라벨칩 + 캡션)
- [ ] 핵심 수치가 표에서 카드/밴드로 시각화돼 한눈에 읽힘
- [ ] 새 색 0 · NGT 콘텐츠 불변 · 모바일/인쇄 OK
- [ ] 렌더 스샷으로 "메뉴만 바뀐 게 아니라 비주얼이 리치해졌다" 확인
