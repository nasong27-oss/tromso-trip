# Tromsø 2026

트롬쇠 여행(2026.12.24 – 2027.1.1) 안내 페이지. 정적 사이트 + Vercel 미들웨어 비밀번호 게이트 + 페이지 내 편집.

## 처음 한 번 설정 (Vercel)
1. **Storage → Create → Blob** 으로 저장소를 만들고 이 프로젝트에 Connect (`BLOB_READ_WRITE_TOKEN` 자동 추가)
2. **Settings → Environment Variables** 에 `EDIT_PASSWORD` (편집용 비밀번호) 추가
3. (선택) `SITE_PASSWORD` 로 보기 비밀번호 변경 — 기본값 `1224`, **숫자만** (자릿수만큼 칸이 생기고 다 입력하면 자동 로그인)
4. **Deployments → 최신 배포 → Redeploy** (환경변수 반영)

## 내용 수정
- 페이지 맨 아래 **✏️ 편집** → 편집 비번 + 이름 입력 → 노란 칸을 눌러 수정 → **저장**
- `+ 추가` / `×` 로 항목 추가·삭제, **이력** 에서 이전 버전으로 되돌리기
- 저장할 때마다 새 버전이 Blob 에 쌓임 (덮어쓰기 없음). 다른 사람이 먼저 저장했으면 알림
- `**굵게**` 처럼 별표 두 개로 감싸면 굵은 글씨
- `assets/data.js` 는 첫 저장 전까지 쓰이는 초기값. 첫 저장 이후의 내용은 Blob 이 기준

## 구조
- `middleware.js` 보기 비밀번호 게이트 (모든 경로 보호, `/api` 포함)
- `api/data.js` 현재 내용 조회·저장 (충돌 검사) · `api/edit.js` 편집 로그인 · `api/history.js` 이력·되돌리기 · `api/_store.js` 저장소

## 추가 기능
- **로그인 잠금**: `/api/login` 이 비밀번호를 확인. 같은 접속 주소에서 5번 틀리면 10분 잠금 (실패 기록: Blob `auth/fail/`)
- **오프라인**: `sw.js` 가 페이지·데이터·글꼴을 기기에 저장. 홈 화면에 추가 가능 (`manifest.webmanifest`, 아이콘)
- **저장소 사용량 절약**: `/api/data` 는 최신 내용을 60초 동안 서버에 기억 (`?fresh=1` 은 바로 확인). 편집 시작·저장은 항상 최신 확인
- **지도 탭**: Leaflet + OpenStreetMap(CARTO 타일), 경로는 OSRM 공개 서버로 계산 (실패하면 점선)
- **현지 정보 탭**: `info.draft: true` 인 동안 "작성 중" 표시
