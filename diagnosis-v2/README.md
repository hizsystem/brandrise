# 모수 v2 트리거 진단서 — 빌드 현황

> 5/6 보류 결정 5개 컨펌 후 5/6 빌드 진입. 5/8 배포 목표.
> 상위 spec: `../diagnosis/specs/2026-05-04-trigger-diagnosis-spec-v1.md`
> 12문항 spec: `specs/2026-05-06-questions-v1.md`

## 상태

| 영역 | 상태 | 시드 의존? |
|------|-----|----------|
| 진입 랜딩 (`index.html`) | ✅ 완료 | Hero H1 1줄만 (워크샵 3 광고 카피) |
| 진단 폼 (`diagnosis.html` + `js/diagnosis.js`) | ✅ 완료 | ✗ (12문항 카피 확정) |
| 결과지 골격 (`result.html` + `js/result.js`) | ✅ 골격 | ✓ (NICKNAMES, CATCHPHRASES, PRESCRIPTIONS, TRAP_DIAGNOSIS) |
| 응답 수집 API (`api/submit.js`) | ✅ 완료 | CODE_NICKNAMES만 (워크샵 1) |
| 디자인 시스템 (`styles.css`) | ✅ 완료 | ✗ |
| 배포 설정 (`vercel.json`, `package.json`) | ✅ 완료 | ✗ |

## 시드 받았을 때 교체 위치 (3개 파일만)

우성민 챗GPT 워크샵 50분 후, 슬랙 산출물을 받아 아래 **3개 파일의 데이터 객체만** 교체하면 결과지가 채워집니다.

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

## 5/7~5/8 남은 일

- [ ] 우성민 챗GPT 워크샵 50분 (시드 산출)
- [ ] 시드 받아 3개 파일 데이터 객체 교체
- [ ] PART 3 24개 처방 매트릭스 (TS 6개 → FS/FG/TG 변주, 클로드코드 자동 변주)
- [ ] 베타 테스트 (지인 3명, 5/8)
- [ ] Meta Pixel ID + Slack Webhook 환경변수 설정
- [ ] 1:1 예약 CTA URL을 캘린더 링크로 교체 (현재 mailto)
- [ ] OG 동적 카드 생성 (vercel og 또는 별도 endpoint)
- [ ] Vercel 배포 + diagnosis.brandrise.kr 또는 brandrise.kr/diagnosis-v2 라우팅
