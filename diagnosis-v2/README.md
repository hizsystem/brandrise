# 모수 v2 트리거 진단서 — 빌드 현황

> 5/6 보류 결정 5개 컨펌 + v2 골격 빌드. 5/11 워크샵 v1 시드 박음(클로드 생성, 검수 대기). 베타 5/12 목표.
> 상위 spec: `../diagnosis/specs/2026-05-04-trigger-diagnosis-spec-v1.md`
> 12문항 spec: `specs/2026-05-06-questions-v1.md`
> 워크샵 v1 시드: `specs/2026-05-11-workshop-output-v1-draft.md`

## 상태

| 영역 | 상태 | 시드 상태 |
|------|-----|----------|
| 진입 랜딩 (`index.html`) | ✅ 완료 | v1 광고 카피 박힘 (검수 대기) |
| 진단 폼 (`diagnosis.html` + `js/diagnosis.js`) | ✅ 완료 | — |
| 결과지 (`result.html` + `js/result.js`) | ✅ 완료 | v1 시드 박힘: 별명·캐치·24개 매트릭스·TRAP (검수 대기) |
| 응답 수집 API (`api/submit.js`) | ✅ 완료 | v1 CODE_NICKNAMES 박힘 (검수 대기) |
| 디자인 시스템 (`styles.css`) | ✅ 완료 | — |
| 배포 설정 (`vercel.json`, `package.json`) | ✅ 완료 | — |

## 부분 교체 위치 (검수 후 키만 바꿔도 갱신)

검수 결과 부분 교체가 필요하면 아래 3개 파일의 객체 키만 수정합니다. 로직 변경 없음.

### 1. `js/result.js` (최대 교체 영역)

```js
// 워크샵 1 산출물
const NICKNAMES = {
  FS: '...', FG: '...', TS: '...', TG: '...'
};
const CATCHPHRASES = { ... };

// 워크샵 2 산출물 (TS 6개 → FS/FG/TG는 변주)
const PRESCRIPTIONS = {
  TS: {
    B1: { headline: '...', body: '...' },
    // B2~B6
  },
  // FS, FG, TG는 TS 변주
};

const TRAP_DIAGNOSIS = { FS: '...', FG: '...', TS: '...', TG: '...' };
```

### 2. `api/submit.js`

```js
const CODE_NICKNAMES = {
  FS: '...', FG: '...', TS: '...', TG: '...'
};
```

### 3. `index.html` (워크샵 3)

`<h1>` 본문 1줄을 워크샵 3 산출물(TS형 광고 메인 카피)로 교체.

## 12문항 구조 요약

| 문항 | 섹션 | 역할 |
|------|-----|------|
| A1·A2 | 정체성 | F/T 축 판정 |
| A3·A4 | 정체성 | S/G 축 판정 |
| B1~B6 | 영역 진단 | 1~4점 척도, 6영역 점수 산출 |
| C1 | 처방 트리거 | 시급 과제 복수 선택 (최대 2) |
| C2 | 처방 트리거 | 자유 서술 30~80자 (PART 2 인용) |
| G1·G2 | 게이트 | 단계·인력 (TG 자연 이탈 결정) |
| G3 | 게이트 | 이메일 (Lead 전환) |
| G4 | 게이트 | 회사명 (선택) |

## 4유형 판정 로직 (`js/diagnosis.js` `calculateType`)

```
A1 + A2 점수: F vs T → 큰 쪽 (동률 시 F)
A3 + A4 점수: S vs G → 큰 쪽 (동률 시 S)
→ 결과: FS / FG / TS / TG
```

TS형 = 골든 타겟 (시뮬레이션 9·9·1·9, 1:1 전환의 60%+ 추정).

## 라우팅

`vercel.json` rewrites:
- `/diagnosis` → `/diagnosis.html`
- `/result` → `/result.html` (URL params로 코드·점수·c2 등 전달)

## 환경 변수 (배포 직전)

- `SLACK_WEBHOOK_URL` — 슬랙 #diagnosis-v2 (또는 별도 채널) 웹훅
- Meta Pixel `init('YOUR_PIXEL_ID')` 활성화 (3개 파일: index/diagnosis/result)

## v1 대비 차이

| | v1 (`../diagnosis/`) | v2 (`./`) |
|--|---------------------|----------|
| 진단 코드 | 단순 등급 (D/C/B/A) | 4유형 코드 (FS/FG/TS/TG) + 별명 |
| 영역 | 6항목 (성과 추적, 성장 병목 포함) | 6항목 v2 (데이터·대시보드, AI·자동화로 교체) |
| 자유 서술 | 없음 | C2 30~80자 (PART 2 인용) |
| 결과지 구조 | 단일 점수표 | Hero / PART 1·2·3 (얼터식) |
| 처방 | 영역별 다음레벨 조언 풀세트 | 1순위 처방의 첫 단락만 + 1:1 트리거 |
| 광고 타게팅 | 전 단계 | 시리즈A+ / 마케팅팀 3+ 제외 (Decision B) |
| KPI | 미정 | 1:1 신청률 + 진단 완료율 (Decision C) |

## 5/11~5/13 남은 일

- [x] ~~우성민 챗GPT 워크샵 50분~~ → 클로드코드가 v1 후보 생성 (5/11, `specs/2026-05-11-workshop-output-v1-draft.md`)
- [x] 시드 v1 → 3개 파일 데이터 객체 박음 (5/11)
- [x] PART 3 24개 처방 매트릭스 변주 (TS·FS·FG·TG 각 6개) (5/11)
- [ ] **🔴 우성민 시드 검수** — 별명·캐치·처방 1순위 OK 또는 부분 교체 회신
- [ ] 베타 테스트 (지인 3명, 검수 통과 후)
- [ ] 환경변수 설정: `SLACK_WEBHOOK_URL` + Meta Pixel ID (3개 파일: index/diagnosis/result)
- [ ] 1:1 예약 CTA URL을 캘린더 링크로 교체 (현재 `mailto:hi@brandrise.kr`)
- [ ] OG 동적 카드 생성 (vercel og 또는 별도 endpoint, P2)
- [ ] Vercel 배포 + diagnosis.brandrise.kr 또는 brandrise.kr/diagnosis-v2 라우팅

## 베타 테스트 체크리스트

검수 통과 즉시 진행:

1. **4유형 4명 진단:**
   - FS 시나리오: A1·A2 모두 ① / A3·A4 모두 ① / B 영역 1~2점 위주 / C2 자유서술 입력
   - FG 시나리오: A1·A2 ① / A3·A4 ③·④ / B2·B5 1~2점 / 매출 정체 자유서술
   - TS 시나리오 (골든): A1·A2 ③·④ / A3·A4 ① / B 영역 1~2점 위주 / "마케터 위임" 자유서술
   - TG 시나리오: A1·A2 ④ / A3·A4 ④ / B 영역 3~4점 / "다음 단계" 자유서술 → 결과지 끝 TG 안내 노출 확인
2. **결과지 4섹션 노출 확인:** Hero 별명·캐치 / PART 1 점수 카드·함정 / PART 2 위험·트렌드 격차·C2 인용·격차 시각화 / PART 3 1순위 처방·CTA
3. **트렌드 격차 카드:** B2 또는 B5가 1~2점일 때만 노출 (둘 다 낮으면 더 낮은 쪽)
4. **TG 자연 이탈 라인:** code=TG OR stage=series-a-plus OR team=3+ 시 결과지 끝에 정밀 자문 안내
5. **공유 버튼:** 링크 복사 / 카톡 복사 동작
6. **API 응답 수집:** `SLACK_WEBHOOK_URL` 설정 후 헤더 이모지 분기 (🟢=TS, 🟡=TG, 📊=기타) 확인

## 환경변수 설정 가이드

Vercel 프로젝트 환경변수에 추가 후 재배포:

| 변수 | 값 | 용도 |
|------|-----|------|
| `SLACK_WEBHOOK_URL` | `https://hooks.slack.com/services/...` | `#diagnosis-v2` 채널 신규 진단 알림 |

Meta Pixel은 3개 파일의 `fbq('init', 'YOUR_PIXEL_ID')` 주석 해제 + 픽셀 ID 교체:
- `index.html` (PageView)
- `diagnosis.html` (InitiateCheckout)
- `result.html` (Lead)

## 검수 회신 포맷 (우성민)

전체 OK:
```
v1 시드 전체 OK
```

부분 교체:
```
TS·별명=후보2 / FG·캐치=후보3 / B5=후보2 / 나머지 OK
```

후보 번호는 `specs/2026-05-11-workshop-output-v1-draft.md`의 후보 목록 번호.
