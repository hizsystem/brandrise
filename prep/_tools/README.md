# prep/_tools — 재사용 스크립트

2026 Q2 사전상담 PREP 배치 작업 시 사용한 빌드 스크립트와 시트 주입용 데이터.

## 파일

- **generate.py** — MD → 견적서 톤 HTML 변환기. `python3 generate.py` 로 27개 brand HTML + 허브 index.html 자동 생성. Tier 매핑(SLUG_TIER), 신청자 메타(DISPLAY_ORDER), 큐레이션 훅(HOOKS)을 코드 내 상단 dict로 관리. 새 prep 배치 추가 시 dict만 업데이트하고 재실행.
- **build-inject-csv.py** — 시트 PREP 컬럼 주입용 CSV/TSV 생성기. 29행(중복 행 포함) 셀 한 칸 압축 포맷(`[Tier] 한줄 / Pain / 제안+Q1·Q2`).
- **prep-inject.csv** — `build-inject-csv.py` 산출물. Google Drive에 업로드된 시트의 로컬 원본.
- **prep-paste.tsv** — 시트 PREP 컬럼 단일-컬럼 페이스트용. PREP 시트의 마지막 칸 M2에 select → Cmd+V 가능.

## 외부 산출물 링크

- 허브 페이지: https://hizsystem.github.io/brandrise/prep/
- 시트 (CSV 업로드본): https://docs.google.com/spreadsheets/d/1CwtkELwbHuJ1mH_kN5hxGEUTjdBw12QXHKwNTTf3PRo/edit
- 시트 (원본 신청자): https://docs.google.com/spreadsheets/d/1T9yzKNtThksMYeMN3LXLf4g-wyI9JiFyICVoWVGG8Z4/edit?gid=1006709075

## 다음 배치 시 절차

1. 새 신청자 시트에서 신청자/회사/이메일/전화/일자/인원/확정 정보 추출
2. `generate.py` 상단의 `DISPLAY_ORDER`·`SLUG_TIER`·`HOOKS` dict 갱신
3. 각 브랜드 prep MD를 `prep/[slug].md`로 생성 (researcher 에이전트 활용)
4. `python3 generate.py` 실행 → HTML 자동 생성
5. `prep/README.md` 인덱스 업데이트
6. git commit + push → GitHub Pages 자동 배포
