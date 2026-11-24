# Tromsø 2026

트롬쇠 여행(2026.12.24 – 2027.1.1) 안내 페이지. 빌드 과정 없는 정적 사이트 + Vercel 미들웨어 비밀번호 게이트.

## 내용 수정
- 모든 일정·예약·비용 데이터는 `assets/data.js` 한 파일에 있음. 고쳐서 push하면 Vercel이 자동 재배포.
- MOXY 예약번호·비용이 확정되면 `stay3.facts`와 `cost.items`의 MOXY 항목에 넣기.

## 비밀번호
- 기본값 `1224`. Vercel → Project → Settings → Environment Variables에 `SITE_PASSWORD`를 넣으면 그 값으로 바뀜(재배포 필요).
- 로그인 후 60일간 유지. `/__logout`으로 로그아웃.

## 배포
Vercel → Add New Project → 이 GitHub repo Import → Framework Preset: **Other** → Deploy (빌드 설정 변경 불필요).
