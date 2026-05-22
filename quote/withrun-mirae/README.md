# 미례국밥 견적서 — 정본 위치 안내

## 2026-05-22 이후 정본 위치 변경

이 폴더의 `index.html`(5월 운영 견적서)은 클라이언트 운영 허브 통합 정책에 따라 **`hizsystem.github.io/mirye/may/`로 이전**되었습니다.

### 새 정본 위치

| 항목 | URL | 레포 |
|------|-----|------|
| **5월 견적서** | https://hizsystem.github.io/mirye/may/ | `hizsystem/hizsystem.github.io` → `mirye/may/index.html` |
| **운영 허브 (카드 인덱스)** | https://hizsystem.github.io/mirye/ | `hizsystem/hizsystem.github.io` → `mirye/index.html` |
| **4월 견적서** | https://hizsystem.github.io/mirye/april/ | (동일 레포) |

### 본 폴더(`brandrise-pages/quote/withrun-mirae/`)의 위치

- **워킹 카피로 유지** — 작업 히스토리 보존 + 빠른 로컬 편집용
- 변팀장께 발송하는 URL은 항상 `hizsystem.github.io/mirye/...` 사용
- 본 폴더의 `index.html`을 수정해도 라이브 사이트에 반영되지 않음 (배포 경로 아님)

### 정책 (2026-05-22 결정)

미례국밥 모든 산출물은 `hizsystem.github.io/mirye/{category}/` 또는 `hizsystem.github.io/mirye/{month}/` 패턴으로 통일.
- 월별: `april/`, `may/`, `june/`, ...
- 카테고리: `gangnam/`, `kickoff/`, `team-dispatch/`, ...

작업 시작 시 워킹 카피는 본 폴더에 만들고, 발송 직전에 `hizsystem.github.io/mirye/{slug}/`로 복사 + commit + push.
