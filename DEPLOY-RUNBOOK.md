# BRANDRISE 노출 정리 — A안(Vercel 이전 + 인증) 배포 런북

> **목적:** 견적·제안서·상담준비·리서치가 `hizsystem.github.io/brandrise/`(공개 GitHub Pages)에서 URL만 알면 보이는 문제 해결.
> **방식:** 레포 전체를 새 Vercel 프로젝트로 올리고, **기밀 폴더만** Edge Middleware 비밀번호 게이트. 그 후 레포 PRIVATE 전환.
> ⚠️ Vercel 네이티브 Password Protection은 Pro **$150/월 유료** → 사용 안 함. 앱(미들웨어) 자체 인증으로 **$0** 구현.

## 무엇이 막히고 무엇이 열리나

| | 경로 | 처리 |
|---|------|------|
| 🔒 **게이트(비번)** | `/quote` `/proposals` `/new-biz` `/prep` `/consulting` `/research` `/reports` | 미인증 시 `/login.html`로 차단 |
| 🌐 **공개 유지** | 루트 `index.html`(마케팅 랜딩), `/diagnosis` `/diagnosis-v2`(진단 퍼널), `/goventure-follow`, `/story` `/townhall` 등 그 외 전부 | 그대로 노출 |

> 신규 산출물도 위 7개 기밀 폴더 안에 들어가면 **자동 보호**됨. 새 기밀 폴더가 생기면 `middleware.ts`의 `GATED` 배열에 한 줄 추가.

## 작동 원리
- `middleware.ts` — 기밀 폴더 요청에 서명 쿠키(`br_auth`) 없으면 `/login.html`로 보냄
- `login.html` + `api/login.ts` — 비번 검증 후 HMAC 서명 쿠키 발급(30일), `api/logout.ts` — 만료
- 인증 통과 후엔 같은 쿠키로 하위 페이지·이미지 전부 로드

## ⚠️ diagnosis / diagnosis-v2 는 별개
`diagnosis-v2`는 **자체 vercel.json+api를 가진 독립 Vercel 프로젝트**(라이브 모수 진단 퍼널 `diagnosis-v2-silk.vercel.app`).
- 이 레포를 루트(`.`)로 새 프로젝트를 만들면 Vercel은 **루트 vercel.json만** 읽으므로 중첩 설정 충돌 0.
- 기존 diagnosis-v2 Vercel 프로젝트(Root Directory=`diagnosis-v2`)는 독립적으로 계속 작동.
- 레포가 private 돼도 두 프로젝트 모두 Vercel GitHub 권한 유지로 정상 배포.

## 환경변수 2개 (Vercel 대시보드에서만 — 레포·코드 커밋 금지)

| 변수 | 용도 | 생성 |
|------|------|------|
| `SITE_PASSWORD` | 클라이언트에게 전달할 접근 비밀번호 | 원하는 문자열 (예: `openssl rand -base64 9`) |
| `AUTH_SECRET` | 쿠키 서명 키 (외부 비공개) | `openssl rand -hex 32` |

---

## 배포 순서 (무중단)

### 1단계 — 코드 푸시 (비파괴)
이 코드는 GitHub Pages가 무시(`middleware.ts`/`api/`)하므로 **현재 라이브 사이트 영향 0**.
```
git add -A && git commit -m "feat: Vercel Edge 인증 게이트 (노출 정리 A안)" && git push
```

### 2단계 — Vercel 프로젝트 생성
vercel.com → Add New → Project → `hizsystem/brandrise` import
- **Framework Preset: `Other`** / **Root Directory: `./`** / Build Command 비움 / Output 비움

### 3단계 — 환경변수
Settings → Environment Variables → `SITE_PASSWORD`, `AUTH_SECRET` (Production+Preview) → **Redeploy**

### 4단계 — 임시 URL 검증 (DNS/도메인 건드리기 전!)
`https://{프로젝트}.vercel.app` 에서:
- [ ] `/quote/jamful/` → 로그인 페이지로 차단되는가
- [ ] 비번 입력 → 견적서 정상 표시, 이미지 로드되는가
- [ ] 루트 `/`(랜딩), `/diagnosis-v2` → 비번 없이 그대로 열리는가
- [ ] `/research/`, `/prep/` → 차단되는가

### 5단계 — 레포 PRIVATE 전환 (노출 차단의 핵심)
> Vercel로 옮겨도 레포가 PUBLIC이면 github.com에서 raw HTML이 그대로 읽힘.
1. github.com/hizsystem/brandrise → Settings → Danger Zone → **Change to Private**
2. GitHub Pages 자동 비활성(안 되면 Settings → Pages → Disable)
3. Vercel 두 프로젝트(브랜드라이즈 통배포 + diagnosis-v2) 모두 계속 배포됨

### 6단계 (선택) — 도메인
공개 URL을 쓰려면 Vercel Domains에서 도메인 연결. 현재는 커스텀 도메인(CNAME) 없음 → `xxx.vercel.app` 그대로 써도 됨.

### 7단계 — 최종 검증
- [ ] 게이트 URL → 비번 없이 차단 / 비번 있으면 통과
- [ ] `github.com/hizsystem/brandrise` → 비로그인 시 **404**
- [ ] 랜딩·진단 퍼널 정상

---

## 운영 메모
- 비번 교체: `SITE_PASSWORD` 수정 → Redeploy (`AUTH_SECRET` 유지 시 기존 세션 유지 / 즉시 전체 로그아웃은 `AUTH_SECRET`도 교체)
- 공개로 열 폴더 추가/기밀 폴더 추가: `middleware.ts`의 `GATED` 배열만 수정
- 게이트는 **fail-closed**: `AUTH_SECRET` 미설정 시 기밀 폴더는 503으로 차단(열리지 않음)
