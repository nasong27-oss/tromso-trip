/* =========================================================
   트롬쇠 여행 데이터 — 내용 수정은 이 파일만 고치면 됩니다.
   시간은 모두 현지(노르웨이, UTC+1) 기준.
   ========================================================= */
window.TRIP = {
  title: "Tromsø, 북극의 겨울",
  period: "2026. 12. 24 (목) – 2027. 1. 1 (금)",
  start: "2026-12-24T00:00:00+09:00",
  travelers: 3,
  heroImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Troms%C3%B8_Aurora,_Norway.jpg?width=2400",

  /* ---------- 마감·주의 일정 (홈 상단에 자동 정렬) ---------- */
  deadlines: [
    { at: "2026-12-16T12:00:00+09:00", title: "Airbnb 숙박비 결제 예정", tab: "stay1", dateOnly: true },
    { at: "2026-12-24T17:00:00+01:00", title: "Airbnb 무료 취소 마감", tab: "stay1" },
    { at: "2026-12-25T16:30:00+01:00", title: "오로라 투어 무료 취소 마감 (25시간 전)", tab: "aurora" },
    { at: "2026-12-25T17:30:00+01:00", title: "오로라 투어 eWaiver 전원 작성", tab: "aurora", urgent: true },
    { at: "2026-12-26T17:20:00+01:00", title: "오로라 투어 집합 · Scandic Ishavshotel 앞", tab: "aurora" },
    { at: "2026-12-28T22:00:00+01:00", title: "Lauklines 캐빈 도착 마감 (리셉션 연락)", tab: "stay2" },
    { at: "2026-12-30T17:00:00+01:00", title: "렌터카 반납 · 트롬쇠 공항", tab: "car" }
  ],

  /* ---------- 숙소 요약 (홈 카드) ---------- */
  stays: [
    { tab: "stay1", dates: "12/25 – 12/28", nights: 3, name: "Tromsø 시내에서 약간 떨어진 주택", area: "트롬쇠 시내 · Dramsvegen", label: "AIRBNB" },
    { tab: "stay2", dates: "12/28 – 12/30", nights: 2, name: "Lauklines Kystferie 캐빈", area: "Kvaløya 섬 해안", label: "CABIN" },
    { tab: "stay3", dates: "12/30 – 1/1", nights: 2, name: "MOXY Tromsø", area: "트롬쇠 공항 옆", label: "HOTEL" }
  ],

  /* ---------- 일정 사이 후보 박스 (after 날짜 다음에 표시) ---------- */
  options: [{"after": "end", "title": "🏙 시내 관광", "tone": "info", "items": ["**Fjellheisen 케이블카 + 북극 대성당** — 다리 건너 같은 동네라 묶어 가기 좋음", "💬 케이블카 추천 시간 **12:00 ~ 14:00** — 12~13시는 설산·피오르가 가장 선명 / 13~14시는 짙은 블루아워에 시내·다리 불빛까지", "날씨 궂은 날 실내: **Polar Museum** (약 1시간) · **Polaria** (1~2시간, 물범)", "저녁: **Mack Brewery · Ølhallen** · 항구 산책 (블루아워 사진)", "12/25·26 공휴일 · 12/27 일요일은 운영시간이 줄거나 휴무일 수 있어요 — 가기 전에 확인 (자세한 소개는 추천 탭)"], "folds": [{"title": "케이블카 · 대성당 자세히 보기", "groups": [{"h": "시간대 (12월 말 태양 고도)", "list": ["11:44 하루 중 가장 밝음 (약 -3°) — 11:30쯤 올라가도 충분", "12:00 약 -3.1° · 설산·피오르가 가장 선명", "13:00 약 -4.0° · 하늘이 짙은 파란색이 되는 블루아워 시작", "14:00 약 -6.2° · 박명 끝 — 이후엔 야경·오로라"]}, {"h": "이용 정보", "list": ["케이블카 매일 **09:00 ~ 00:00** 운행 · 정상까지 4~5분 (해발 421m)", "정상 카페 Fjellstua **09:00 ~ 23:30** — 커피 · 와플 · 따뜻한 식사", "공휴일(12/25·26) 운영시간은 출발 전 fjellheisen.no에서 확인"]}, {"h": "주차 · 가는 법", "list": ["공사 중이라 **승강장 앞 주차 불가** → 임시 무료 주차장 **Solstrandvegen 30** (도보 약 5분)", "버스 26번 · 시내에서 걸어서 약 45분"]}, {"h": "주의사항", "list": ["정상은 바람이 세고 추워요 — 방한복 · 장갑 · 모자", "흐리거나 눈이 오면 전망이 없고 강풍 땐 운행이 멈출 수 있어요 — 당일 날씨 보고 결정", "북극 대성당은 **12/24~26 · 12/31 · 1/1 관람 휴무**로 알려져 있어요 (오래된 정보일 수 있음 — 확인 필요)"]}]}]}, {"after": "end", "title": "🚗 반나절 드라이브 (12/26 또는 12/27 추천)", "tone": "info", "items": ["숙소 → **Breivikeidet 페리 선착장** 왕복 · 편도 40~50분 (E8 → Fv91)", "선착장에서 건너편 **Lyngen 알프스** 전망 · 가는 길 Breivikeidet 계곡도 볼거리", "**12/27 추천** — 11시쯤 출발하면 14시 전후 복귀 (12/26은 저녁 오로라 투어까지 긴 하루)", "출발 전 도로 상황 확인 (vegvesen.no)"], "maps": [{"label": "숙소 → Breivikeidet 선착장 왕복", "stops": [{"name": "Dramsvegen 167 (숙소)", "at": "69.6715376,18.9654357"}, {"name": "Breivikeidet 페리 선착장", "at": "69.6699174,19.6500408"}, {"name": "Dramsvegen 167 (숙소)", "at": "69.6715376,18.9654357"}], "open": "https://www.google.com/maps/dir/Dramsvegen+167,+9010+Tromsø,+노르웨이/Breivikeidet+ferjekai,+Breivikeidveien,+9027+Ramfjordbotn,+노르웨이/Dramsvegen+167,+9010+Tromsø,+노르웨이/@69.6654682,18.6754026,9.6z/data=!4m20!4m19!1m5!1m1!1s0x45c4c442ec7852d3:0x9c383e720ebb8eb4!2m2!1d18.9654357!2d69.6715376!1m5!1m1!1s0x45c5207d619351b3:0x3d68ada88728004a!2m2!1d19.6500408!2d69.6699174!1m5!1m1!1s0x45c4c442ec7852d3:0x9c383e720ebb8eb4!2m2!1d18.9654357!2d69.6715376!3e0?entry=ttu&g_ep=EgoyMDI2MTEyMy4wIKXMDSoASAFQAw%3D%3D", "openLabel": "구글맵에서 이 경로 열기"}]}, {"after": "end", "title": "🌌 투어 없는 맑은 밤 · 직접 오로라 보기", "tone": "info", "items": ["**트롬쇠 섬 숙박 중** (12/25–28 · 12/30–31): Prestvannet (섬 언덕 위 호수) · Sydspissen (섬 남쪽 끝 바닷가)", "**캐빈 숙박 중** (12/28–29): 숙소 데크에서 바로 — 도심 불빛이 없어 투어 없이 봤다는 후기가 많음", "오로라 예보보다 **맑은 하늘이 먼저** — 구름 없는 날, 북쪽 하늘이 트인 곳으로", "방한 완전무장 · 헤드랜턴 · 보조배터리 (추위에 휴대폰 배터리가 빨리 닳음)"]}, {"after": "end", "title": "🚶 가벼운 산책 · Prestvannet 호수", "tone": "info", "items": ["섬 중앙 언덕 위 호수 한 바퀴 **1.7km · 30~45분** · 난이도 쉬움 · 24시간 무료", "낮 **10:30 ~ 13:00** 설산·푸른 박명 산책 / 맑은 밤 **20:00 ~ 23:00** 가볍게 오로라 보기"], "maps": [{"label": "Prestvannet", "q": "Prestvannet, Langnesvegen 33, 9016 Tromsø", "open": "https://maps.google.com/?cid=135143847667223419"}], "folds": [{"title": "자세히 보기", "groups": [{"h": "코스 · 풍경", "list": ["대부분 평탄한 자갈·아스팔트 길 · 일부 구간은 경사가 있음", "자작나무 숲 사이로 본토 Tromsdalstinden 산 · Fjellheisen · 주변 섬 설산 조망", "섬 중앙 크로스컨트리 스키 트랙(Lysløypa Tromsøya) · 넓은 산책로와 연결"]}, {"h": "이동 · 주차", "list": ["시내 중심에서 도보 오르막 20~30분 · 버스 **28 · 40 · 42번**", "주차: Prestvannet parkering (Prestvannvegen 44 또는 Stalheimvegen 19) · Langnesvegen · 학생 기숙사 근처", "유료 구간은 **EasyPark** 또는 **Tromsø Parkering** 앱으로 결제"]}, {"h": "시간대 (12월 말 기준)", "list": ["시민박명 09:31 ~ 13:57 · 가장 밝은 때 11:44 — 10:30~13:00이면 손전등 없이 설산·호수 감상·촬영", "투어 없는 맑은 밤에 가볍게 오로라 — 섬 안에서도 주변 불빛이 적은 편"]}, {"h": "12월 주의사항", "list": ["다져진 눈·빙판이 많아 방한화 + **간이 아이젠** 권장", "산책로 일부만 조명 — 어두울 땐 **헤드랜턴 · 손전등** 필수", "스키 트랙·다른 산책로 갈림길이 많아요 — 한 바퀴만 돌 땐 계속 호수 쪽 길 유지", "**얼음 위 진입 금지** — 얼음이 고르지 않고 북쪽 배수구 쪽은 겨울 내내 얇을 수 있음 (시청 안전 표지 확인 전)", "현장에 카페·매점 없음 — 따뜻한 음료·간식 챙기기"]}]}]}],

  /* ---------- 일자별 일정 ---------- */
  days: [
    { date: "2026-12-24", tag: "출국", tone: "blue", items: [
      { text: "한국 출발 · 트롬쇠로 이동" }
    ], folds: [{"title": "✈️ 항공일정 (나승민) · Finnair", "warn": "**헬싱키 환승 1시간 30분** — 솅겐 입국심사까지 거쳐야 해서 빠듯해요. 내리면 바로 환승(Transfer) 안내를 따라 이동", "groups": [{"h": "출국 · 12/24 – 12/25 · 총 18시간 40분", "list": ["**AY042** 인천(ICN, T1) → 헬싱키(HEL) · 12/24(목) **23:00** → 12/25(금) **05:40** (13시간 40분)", "헬싱키 환승 **1시간 30분** (솅겐 입국심사)", "**AY541** 헬싱키(HEL) → 트롬쇠(TOS) · 12/25(금) **07:10** → **09:40** (3시간 30분)", "💬 로바니에미(핀란드) **기술 착륙 45분** 포함 — 08:40 착륙 · 09:25 출발 (같은 비행기, 보통 기내 대기)"]}, {"h": "귀국 · 1/1 – 1/2 · 총 18시간 0분", "list": ["**AY542** 트롬쇠(TOS) → 헬싱키(HEL) · 1/1(금) **10:25** → **14:40** (3시간 15분)", "💬 로바니에미(핀란드) **기술 착륙 45분** 포함 — 12:30 착륙 · 13:15 출발 (같은 비행기, 보통 기내 대기)", "헬싱키 환승 2시간 55분 (솅겐 출국심사)", "**AY041** 헬싱키(HEL) → 인천(ICN, T1) · 1/1(금) **17:35** → 1/2(토) **12:25** (11시간 50분)"]}]}]},
    { date: "2026-12-25", tag: "도착", tone: "blue", items: [
      { time: "10:00", text: "트롬쇠 공항 Hertz 키오스크에서 **렌터카 픽업** (Peugeot e-3008 전기차)", tab: "car" },
      { text: "식사 · 짧은 드라이브" },
      { time: "17:00", text: "**Airbnb 셀프 체크인** (열쇠 보관함) · Dramsvegen 167 · 15:00로 앞당기기 요청 중", tab: "stay1" }
    ], maps: [{ label: "숙소 위치", q: "Dramsvegen 167, 9010 Tromsø", open: "https://maps.app.goo.gl/sdqMFhLAw8rqRB2V6?g_st=ic" }]},
    { date: "2026-12-26", tag: "오로라", tone: "violet", items: [
      { text: "낮 자유 시간 — 아래 **트롬쇠 섬에서 할 만한 것들** 참고 (시내 관광 · 드라이브 · 산책)" },
      { time: "17:20", text: "**Scandic Ishavshotel 앞 집합** (5~10분 전 밖에서 대기)", tab: "aurora" },
      { time: "17:30", text: "**Wandering Owl · Adults Only Aurora Hunt** (약 6시간)", tab: "aurora" }
    ], maps: [{ label: "오로라 투어 집결지", q: "Scandic Ishavshotel, Fredrik Langes gate 2, Tromsø" }]},
    { date: "2026-12-27", tag: "휴식", tone: "green", items: [
      { text: "야간 투어 후 늦은 오전까지 휴식" },
      { text: "오후 자유 시간 — 아래 **트롬쇠 섬에서 할 만한 것들** 참고" }
    ]},
    { date: "2026-12-28", tag: "이동", tone: "amber", items: [
      { time: "11:00", text: "Airbnb 체크아웃" },
      { text:  "☀️ 밝은 시간 약 09:30–14:00 · 경치를 보려면 **10시 전후 출발** (체크아웃을 앞당기는 것도 방법)" },
      { text: "Kvaløya 해안 드라이브" },
      {"text": "🛒 체크인 전 시내에서 **장보기** — 캐빈 주변에 식당·카페 없음"},
      { time: "15:00", text: "**Lauklines Kystferie 캐빈 체크인** · 22시 전 도착 필수", tab: "stay2" }
    ], maps: [{ label: "해안 드라이브 · 숙소 → 캐빈",
      stops: [
        { name: "Dramsvegen 167 (숙소)", at: "69.6715376,18.9654358" },
        { name: "Ersfjordbotn", at: "69.6942065,18.6203726" },
        { name: "Grøtfjorden", at: "69.7774907,18.5398493" },
        { name: "Tromtindvegen 327", at: "69.7795494,18.3999063" },
        { name: "Lauklines Kystferie", at: "69.6209136,18.285743" }
      ],
      open: "https://www.google.com/maps/dir/Dramsvegen+167,+9010+Troms%C3%B8/Ersfjordbotn,+9107/Gr%C3%B8tfjorden,+9107/Tromtindvegen+327,+9107+Kval%C3%B8ya/Lauklines+Kystferie,+Vasstrandvegen+578,+9108+Kval%C3%B8ya/@69.6991271,17.9736168,9z/data=!3m1!4b1!4m32!4m31!1m5!1m1!1s0x45c4c442ec7852d3:0x97da1429c9fc70d9!2m2!1d18.9654358!2d69.6715376!1m5!1m1!1s0x45c4b888660da56d:0xd7a32a72843fe1f8!2m2!1d18.6203726!2d69.6942065!1m5!1m1!1s0x45c4be93c6cee039:0xa5860d119593876b!2m2!1d18.5398493!2d69.7774907!1m5!1m1!1s0x45c4bc6602e95183:0x8ee28103c4e1e14f!2m2!1d18.3999063!2d69.7795494!1m5!1m1!1s0x45c4b126d44ac6c9:0xeced82e449daa8c2!2m2!1d18.285743!2d69.6209136!3e0",
      openLabel: "구글맵에서 이 경로 열기" }]},
    { date: "2026-12-29", tag: "드라이브", tone: "amber", items: [
      { text: "**Sommarøy 드라이브** — 하얀 모래 해변과 Sommarøy 대교" },
      { text:  "☀️ 밝은 시간 약 09:30–14:00 · 밝을 때 경치를 보려면 **10시 전후 출발**" }
    ], maps: [{ label: "캐빈 → Sommarøy",
      stops: [
        { name: "Lauklines Kystferie", at: "69.6209136,18.285743" },
        { name: "Sommarøy", at: "Sommarøy, 9110 Norway" }
      ],
      open: "https://www.google.com/maps/dir/?api=1&origin=Lauklines+Kystferie,+Vasstrandvegen+578,+9108+Kval%C3%B8ya&destination=Sommar%C3%B8y,+9110&travelmode=driving",
      openLabel: "구글맵에서 이 경로 열기" }]},
    { date: "2026-12-30", tag: "이동", tone: "amber", items: [
      { time: "10:00", text: "캐빈 체크아웃 (보증금 가승인 해제 확인)" },
      { time: "17:00", text: "**렌터카 반납** · 트롬쇠 공항", tab: "car" },
      { text: "**MOXY Tromsø 체크인** — 공항 바로 옆이라 반납 후 이동이 편해요", tab: "stay3" }
    ], maps: [{ label: "MOXY Tromsø", q: "Moxy Tromso, Huldervegen 2, 9016 Tromsø" }]},
    { date: "2026-12-31", tag: "연말", tone: "rose", items: [
      { text: "호텔 중심으로 휴식 · 연말 마무리" },
      { text: "Arctic Cathedral 새해 전야 콘서트 · 자정 불꽃놀이" }
    ], quote: "트롬쇠의 12/31 밤은 보통 대형 거리축제보다는 조용한 식사 + 교회/성당 음악회 + 자정 전후 불꽃놀이 감상 중심으로 보내는 편입니다. 특히 Arctic Cathedral의 새해 전야 오르간 콘서트가 유명합니다. — Perplexity" },
    { date: "2027-01-01", tag: "귀국", tone: "blue", items: [
      { text: "MOXY 체크아웃 · 귀국" }
    ]}
  ],

  /* ---------- 출발 전 체크리스트 ---------- */
  checklist: [
    { id: "ewaiver", text: "오로라 투어 eWaiver 3명 모두 작성 (12/25 17:30까지)", link: "https://forms.office.com/r/Xrt2DEEeBF" },
    { id: "idp", text: "국제운전면허증 · 국내 면허증 · 여권 · 본인 명의 신용카드 (렌터카)" },
    { id: "flight", text: "Hertz 예약에 항공편명 입력" },
    { id: "earlycheckin", text: "Airbnb 15:00 조기 체크인 최종 확인 (날짜 다가오면 호스트 회신)" },
    { id: "deposit", text: "Lauklines 보증용 신용카드 (Visa / Mastercard)" },
    { id: "insurance", text: "여행자 보험 가입" },
    { id: "moxy", text: "MOXY 각자 개별 예약 확인" }
  ],

  /* ---------- 비용 (엑셀 「비용 정리」) ---------- */
  cost: {
    items: [
      { name: "12/25–28 숙소", sub: "Airbnb", krw: 2237654, nok: null, status: "due", due: "12/16", tab: "stay1" },
      { name: "12/28–30 숙소", sub: "Lauklines", krw: 1038413, nok: 7438, status: "paid", tab: "stay2" },
      { name: "오로라 투어", sub: "Wandering Owl", krw: 1026127, nok: 7350, status: "paid", tab: "aurora" },
      { name: "렌터카", sub: "Hertz", krw: 1229677, nok: 8808.75, status: "onsite", tab: "car" },
      { name: "12/30–1/1 숙소", sub: "MOXY", krw: null, nok: null, status: "self", tab: "stay3" }
    ]
  },

  /* ---------- 숙소 1 ---------- */
  stay1: {
    eyebrow: "STAY 01 · 12/25 – 12/28 · 3박",
    title: "Tromsø 시내에서 약간 떨어진 주택",
    original: "Moderne leilighet med fin utsikt og bilparkering",
    facts: [
      { k: "체크인", v: "12/25 (금) 17:00", s: "셀프 체크인 · 열쇠 보관함 · 15:00로 앞당기기 요청 중" },
      { k: "체크아웃", v: "12/28 (월) 11:00", s: "3박" },
      { k: "예약 코드", v: "HMH3CT2TN2", copy: true },
      { k: "총 비용", v: "₩2,237,654", s: "1인 ₩745,885 · 12/16 결제 예정" }
    ],
    address: "Dramsvegen 167 Leilighet, 9010 Tromsø, 노르웨이",
    mapQ: "Dramsvegen 167, 9010 Tromsø",
    mapOpen: "https://maps.app.goo.gl/sdqMFhLAw8rqRB2V6?g_st=ic",
    warn: { title: "호스트 확인 (11/25)", tone: "info", items: [
        "수건 · 비누 · 휴지 · 차 · 커피 등 **기본 물품 모두 있음** — 숙소 페이지에 잘못 적혀 있었다고 호스트가 확인",
        "체크인 **15:00로 앞당기기 요청** — 해 보겠다고 함, 최종 확인은 날짜가 다가오면 호스트가 회신 (그즈음 다시 연락)",
        "💬 **Asbjørn 답장 (원문)** — Hei, det skal vi prøve å få til! Vi kan avtale mer når det nærmer seg, da vi vet flere detaljer om når leiligheten blir klargjort for dere.",
        "💬 **번역** — 안녕하세요, 그렇게 되도록 해 볼게요! 날짜가 가까워져서 숙소를 언제 준비해 둘 수 있을지 더 자세히 알게 되면 그때 다시 이야기해요."
    ]},
    sections: [
      { h: "숙소 구성", list: [
        "임대 호실 전체 — 단층 · 계단 없음 · 전용 출입구",
        "침실 2 · 침대 2 · 욕실 2",
        "게스트 3명 (최대 4명)",
        "건물 아래 전용 공간 **무료 주차**"
      ]},
      { h: "찾아가는 길", list: [
        "공항에서 시내버스 24번 → **Greholtvegen** 정류장 하차 (숙소에서 50m)",
        "식료품점 100m"
      ]},
      { h: "시설", chips: ["와이파이", "TV", "장작 벽난로", "전기 · 이동식 난방기", "주방", "냉장고", "오븐", "식기세척기", "식기류", "식탁", "세탁기", "온수", "침구"] },
      { h: "이용 규칙", list: [
        "최대 4명 · 흡연 · 전자담배 금지",
        "소음 제한 22:00 ~ 07:00",
        "파티 · 이벤트 · 상업적 촬영 금지"
      ]},
      { h: "환불 정책", list: [
        "**12/24 17:00 전**까지 무료 취소",
        "12/25 17:00 체크인 전 취소 시 부분 환불"
      ]},
      { h: "호스트 · 후기", list: [
        "Asbjørn (공동 호스트 Kirsten) · 경력 4년",
        "호스트 평점 4.83 (24개) · 응답률 80% (몇 시간 내 응답)",
        "숙소 평점 **5.0** — 2026년 4월 후기 2건 모두 별점 5점"
      ]}
    ],
    refs: [{ k: "예약처", v: "Airbnb 숙소 페이지", href: "https://www.airbnb.co.kr/rooms/1623739938268623685" }],
    contacts: [],
    images: [{"h": "호스트 안내", "src": "/assets/img/stay1-welcome.jpg", "alt": "호스트가 보낸 트롬쇠 안내 이미지 (버스 24번, 옷차림, 예약, 추천 장소, 약도)", "list": ["**버스 24번** 공항 ⇄ 숙소 ⇄ 시내 — 숙소가 노선 중간이라 공항·시내 오가기 가장 쉬움", "날씨가 빨리 바뀌니 **따뜻한 옷을 여러 겹**", "성수기엔 식당·일부 명소가 꽉 차요 — **2~5일 전 예약** 권장"], "placesTitle": "현지 추천 장소", "places": [{"cat": "오로라·자연", "name": "Sydspissen", "desc": "트롬쇠 섬 남쪽 끝 바닷가 · 시내 불빛에서 벗어나 섬 안에서 오로라 보기 좋은 곳"}, {"cat": "오로라·자연", "name": "Prestvannet", "desc": "섬 언덕 위 호수 · 숙소에서 가까워 투어 없는 밤에 들르기 좋음"}, {"cat": "오로라·자연", "name": "Ersfjordbotn", "desc": "서쪽 섬 Kvaløya의 피오르 끝 마을 · 12/28 해안 드라이브 경로"}, {"cat": "오로라·자연", "name": "Skulsvik", "desc": "위치 확인 필요"}, {"cat": "문화", "name": "북극 대성당", "sub": "Ishavskatedralen", "desc": "다리 건너 삼각형 하얀 교회, 트롬쇠 대표 건물 · 12/27 시내 관광 후보"}, {"cat": "문화", "name": "극지 박물관", "sub": "Polar Museum", "desc": "북극 탐험·사냥의 역사"}, {"cat": "문화", "name": "Polaria", "desc": "북극 수족관 겸 체험관 · 물범, 얼음 조각이 쓰러진 듯한 건물"}]}]
  },

  /* ---------- 숙소 2 ---------- */
  stay2: {
    eyebrow: "STAY 02 · 12/28 – 12/30 · 2박",
    title: "Lauklines Kystferie",
    original: "Standard cabin · 성인 3명 · 100m²",
    facts: [
      { k: "체크인", v: "12/28 (월) 15:00", s: "22:00 전 도착 · 리셉션 연락" },
      { k: "체크아웃", v: "12/30 (수) 10:00", s: "2박" },
      { k: "예약 코드", v: "PB72GY58WG", copy: true, s: "예약자 seungmin na" },
      { k: "총 비용", v: "7,438 NOK", s: "≈ ₩1,038,413 · 완납" }
    ],
    address: "Vasstrandvegen 578, Tromsø (Lauklines Kystferie)",
    mapQ: "Lauklines Kystferie, Vasstrandvegen 578, Tromsø",
    cancelBands: { checkin: "2026-12-28T15:00:00+01:00", bands: [
      { minDays: 60, text: "60일 전까지 — 수수료 495 NOK만 공제" },
      { minDays: 31, text: "59 ~ 31일 전 — 25% 위약금" },
      { minDays: 15, text: "30 ~ 15일 전 — 50% 위약금" },
      { minDays: -999, text: "14일 이내 — 환불 불가" }
    ], note: "취소는 반드시 서면으로" },
    sections: [
      { h: "체크인 안내", list: [
        "파손 보증(가승인)용 **신용카드 지참** — Visa / Mastercard / Eurocard (퇴실 시 이상 없으면 해제)",
        "첫날 **22:00 전 도착** 및 리셉션 연락"
      ]},
      {"h": "캐빈 구조 · 100㎡ 2층 목조 · 최대 6인", "list": ["**1층** 주방 · 거실 · 욕실(샤워·화장실) · 침실 1 (90cm 침대 1) · 현관 쪽 **장비 보관·건조실** — 눈 맞은 외투·방한화 말리기 좋음", "**2층** 침실 2 (90cm 침대 3개 방 + 2개 방) · 욕실 1 → 3명이 **방 하나씩** 사용 가능", "전통 통나무 단열 구조 + 에어컨·전기 난방 — 한겨울에도 따뜻함", "소유주(Hanna & Andreas Nilsen) 가족이 현장에 상주하는 작은 캐빈 단지 (총 6채) · 평점 4.8 / 후기 132건"]},
      {"h": "준비할 것", "list": ["**12/28 체크인 전 트롬쇠 시내에서 장보기** — 걸어갈 수 있는 거리에 식당·카페가 전혀 없음", "**샴푸 · 바디워시 미제공** (손비누만) — 개인 세면도구 챙기기"]},
      {"h": "숙소에서 즐길 거리", "list": ["**데크에서 오로라** — 전 객실 바다·피오르 전망, 도심 불빛이 없어 투어 없이 숙소에서 봤다는 후기가 많음", "**해변 프라이빗 사우나** — 투숙객 **1,995 NOK / 2시간** · 1~6인 단독 · 대형 목욕타월·가운·생수 포함", "💬 예열에 최소 2시간 걸려 **사전 예약 필수** — +47 77 65 60 80 · post@lauklines.no", "겨울 장비 대여 (스노슈즈 · 크로스컨트리 스키 · 킥슬레드 · 방한복) · 개썰매 · 순록썰매 · 빙어낚시 · 가이드 하이킹 예약 — 리셉션 문의", "캐빈 뒤편으로 바로 산책·하이킹 코스 연결"]},
      { h: "결제 내역", list: [
        "**총액 7,438 NOK (≈ ₩1,038,413) · 완납**",
        "공급가 6,641 NOK + VAT 12% 797 NOK (1박 3,719 NOK)",
        "2026-07-23 Visa 1,512 NOK · 2026-11-15 Visa 5,927 NOK — **잔액 0 NOK**",
        "확인 메일: nasong27@gmail.com"
      ]},
      { h: "포함 사항", chips: ["침대 시트(린넨)", "수건 (1인 큰 것 1 + 작은 것 1)", "퇴실 청소", "전기", "난방", "와이파이", "온수 · 냉수", "무료 주차", "헤어드라이어", "화장지", "손비누", "공용 세탁기 · 건조기", "공용 대형 냉동고"] },
      { h: "분리수거", list: [
        "보라 플라스틱 · 초록 음식물 · 파랑 종이팩·잡지·종이 · 흰색 일반 쓰레기 (쓰레기통 4개 · 색상별 봉투 구비)"
      ]},
      { h: "주방 가전 · 소모품", chips: ["토스터", "전기포트", "커피메이커 · 필터", "전자레인지", "소금 · 후추", "행주 · 핸드타월", "오븐장갑 2", "식기세척기 세제", "주방세제 · 솔", "키친롤"] },
      { h: "주방 식기 · 조리도구", details: [
        "접시 · 깊은 접시 · 작은 접시 · 수프볼 · 찻잔 · 커피잔 각 8 / 유리잔 16 · 와인잔 8 · 에그컵 6",
        "오븐용기 2 · 계량컵 · 강판 · 유리 저그 · 그레이비 보트 · 채반 · 유리볼 3 · 플라스틱 볼 · 빵바구니 · 차 거름망 · 보온병",
        "스푼 · 나이프 · 포크 · 티스푼 각 8 / 조리용 칼 5 · 칼갈이 · 가위 · 도마 3",
        "감자 필러 · 치즈 슬라이서 · 피자 커터 · 바비큐 커틀러리 · 샐러드 서버 · 뒤집개 · 스파출라 · 거품기 · 국자 2 · 스파게티 스푼",
        "캔 오프너 · 와인 오프너 · 코르크 받침 3 · 냄비 · 프라이팬 5"
      ]},
      { h: "이용 규칙", list: [
        "2박 이상 예약 전용",
        "기상(흐림 · 비 · 눈 · 약풍) 사유로 액티비티 취소 불가 · 오로라 관측 미보장",
        "캐빈 최대 정원 5+1명 · 싱글 침대 구성",
        "금연 · 반려동물 동반 불가 (알레르기 친화 객실)",
        "레이트 체크아웃은 가능할 때 유료로 문의"
      ]}
    ],
    refs: [{ k: "예약처", v: "Lauklines Kystferie", href: "https://lauklines.no" }, {"k": "캐빈 안내", "v": "Standard cabin", "href": "https://lauklines.no/en/general-information/standard-cabin/"}, {"k": "사우나", "v": "예약 안내", "href": "https://lauklines.no/en/activities/sauna/"}],
    contacts: ["post@lauklines.no", "+47 77 65 60 80"]
  },

  /* ---------- 숙소 3 ---------- */
  stay3: {
    eyebrow: "STAY 03 · 12/30 – 1/1 · 2박",
    title: "MOXY Tromsø",
    original: "Marriott 계열 · 트롬쇠 공항 옆",
    facts: [
      { k: "체크인", v: "12/30 (수)", s: "24시간 체크인" },
      { k: "체크아웃", v: "1/1 (금)", s: "2박" },
      { k: "예약", v: "개별 예약", s: "각자 예약 · 각자 결제" },
      { k: "총 비용", v: "각자 결제", muted: true, s: "공동 비용 합계에서 제외" }
    ],
    address: "Huldervegen 2, 9016 Tromsø",
    mapQ: "Moxy Tromso, Huldervegen 2, 9016 Tromsø",
    warn: { title: "개별 예약", tone: "info", items: [
      "3번째 숙소는 **MOXY로 확정 · 각자 개별 예약**",
      "공항 바로 옆이라 12/30 렌터카 반납 후 이동, 1/1 출국이 편해요"
    ]},
    sections: [],
    refs: [{ k: "호텔", v: "MOXY Tromsø (Marriott)", href: "https://www.marriott.com/en-us/hotels/tosox-moxy-tromso/overview/" }],
    contacts: ["+47 902 27 061"]
  },

  /* ---------- 오로라 투어 ---------- */
  aurora: {
    eyebrow: "AURORA · 12/26 (토) 17:30",
    title: "Adults Only Aurora Hunt",
    original: "투어 코드 PUDGSF · 성인 전용 · 약 6시간",
    facts: [
      { k: "집합", v: "17:20", s: "5~10분 전 밖에서 대기 · 지각 시 환불 불가" },
      { k: "투어 시작", v: "12/26 (토) 17:30", s: "약 6시간" },
      { k: "예약 번호", v: "OWL038504", copy: true, s: "예약일 2026-10-28" },
      { k: "총 비용", v: "7,350 NOK", s: "2,450 NOK × 3명 · 완납" }
    ],
    address: "Scandic Ishavshotel 앞 · Fredrik Langes gate 2, Tromsø (별도 간판 없음)",
    mapQ: "Scandic Ishavshotel, Fredrik Langes gate 2, Tromsø",
    warn: { title: "필수 — eWaiver", tone: "urgent", items: [
      "출발 **최소 24시간 전까지 3명 모두** eWaiver 작성 (12/25 17:30까지)",
      "미작성 시 방한복 · 식사 · 사진 제공 불가"
    ], cta: { label: "eWaiver 작성하기", href: "https://forms.office.com/r/Xrt2DEEeBF" } },
    sections: [
      { h: "포함 사항", chips: ["영어 가이드", "이동 교통", "식사 (수프 · 식사 · 음료)", "방한복", "삼각대", "스노우슈즈", "사진 촬영"] },
      { h: "하차", list: ["사전 지정한 숙소 반경 200m 내 안전한 하차 지점"] },
      { h: "취소 · 환불", list: [
        "투어 시작 **25시간 전**까지 서면 취소 — 전액 환불 (수수료 200 NOK 공제)",
        "24시간 이내 취소 · 지각 · 노쇼 — 환불 불가",
        "투어 진행 시 오로라 미관측 환불 불가"
      ]},
      { h: "유의사항", list: [
        "눈 · 빙판길 200m 도보 이동 가능해야 함",
        "대여 장비 분실 · 파손 시 실비 변상",
        "여행자 보험 가입 권장",
        "비용 내역: 교통세 214.08 NOK · 식사세 35.50 NOK 포함"
      ]},
      { h: "예약자", list: ["Seungmin Na · nas627@naver.com"] }
    ],
    refs: [
      { k: "여행사", v: "Wandering Owl AS", href: "https://www.wanderingowl.com" },
      { k: "예약 확인서", v: "OWL038504", href: "https://wanderingowlnordic.rezdy.com/print/OWL038504?hash=1005df2a4dee0f640406df78095d0be2&hsa=d2FuZGVyaW5nb3dsbm9yZGlj" }
    ],
    contacts: ["info@wanderingowl.com", "+47 484 60 081"]
  },

  /* ---------- 렌터카 ---------- */
  car: {
    eyebrow: "RENTAL CAR · 12/25 – 12/30",
    title: "Hertz · Peugeot e-3008",
    original: "Midsize Wagon · 자동 변속 · 에어컨 · 전기차 · 무제한 주행",
    refs: [{ k: "렌터카", v: "Hertz Norway", href: "https://www.hertz.no" }],
    contacts: ["+47 4826 2000 (트롬쇠 공항 지점)"],
    facts: [
      { k: "픽업", v: "12/25 (금) 10:00", s: "트롬쇠 공항 셀프 키오스크" },
      { k: "반납", v: "12/30 (수) 17:00", s: "같은 지점" },
      { k: "예약 번호", v: "L662EC702E2", copy: true },
      { k: "총 비용", v: "8,808.75 NOK", s: "≈ ₩1,229,677 · 현지 결제" }
    ],
    address: "Tromsø Lufthavn Langnes, NO 9016 (공항 셀프서비스 키오스크)",
    mapQ: "Tromsø Airport Langnes",
    warn: { title: "필수 지참물", items: [
      "국내 운전면허증 + **국제운전면허증(IDP)**",
      "**본인 명의 신용카드** (직불카드 불가) · 여권",
      "보증금 약 $200 가승인"
    ]},
    breakdown: [
      { k: "차량 기본료 (6일 × 891.58)", v: 5349.48 },
      { k: "세금", v: 1653.75 },
      { k: "영업소 서비스", v: 903.92 },
      { k: "CDW (차량손실 면책)", v: 240 },
      { k: "Super Cover (완전면책)", v: 240 },
      { k: "WINTER (동계 옵션)", v: 201.6 },
      { k: "도로세", v: 160 },
      { k: "도난 보험 (TP)", v: 60 }
    ],
    sections: [
      { h: "포함 보험 · 옵션", chips: ["무제한 주행거리", "CDW", "Super Cover", "도난 보험 (TP)", "WINTER"] },
      { h: "영업소 운영시간", list: [
        "월 ~ 금 08:00 ~ 23:00 · 토 ~ 일 10:00 ~ 22:00",
        "영업시간 외 픽업 · 반납 시 625 NOK 추가 — 현재 일정은 모두 영업시간 내"
      ]},
      { h: "유의사항", list: [
        "셀프서비스 키오스크 이용 가능 지점",
        "항공편 이용 시 **항공편명 입력 필수**",
        "통행료(AutoPASS 등) · 전기 충전비 별도",
        "일정 · 반납지 변경 시 현지 요금으로 재산정될 수 있음"
      ]},
      { h: "결제 · 회원 정보", list: [
        "등록 카드 AMEX ••••2305 · 렌탈 시 현지 지불",
        "Hertz Gold Plus Rewards 15939574 · CDP: ASIA GOLD MEMBERS"
      ]}
    ]
  },

  /* ---------- 현지 정보 (출처: Visit Tromsø · tromsowinter.com · 외교부 · UiT 등, 2026-11 조사) ---------- */
  eat: {
    "eyebrow": "EAT & COFFEE",
    "title": "식당 · 카페",
    "original": "운영시간은 평소 기준 — 연휴엔 휴무·단축 영업이 많아요",
    "warn": {
      "title": "연휴 주의",
      "items": [
        "**12/25·26 공휴일 · 12/27 일요일 · 12/31 새해 전야**는 휴무·단축 영업이 많아요 — 가기 전에 공식 사이트·구글맵에서 당일 영업과 예약 확인",
        "인기 식당은 **미리 예약** (특히 금·토 저녁)"
      ]
    },
    "holiday": {
      "h": "연휴에 문 여는 곳 (확인된 곳)",
      "list": [
        "**12/25 (금)** Clarion Hotel The Edge **크리스마스 디너 뷔페 17:00–22:00** — 사전 예약 · 선결제 필수 / 낮엔 Fjellheisen 정상 카페",
        "**12/26 (토)** 확인된 곳 없음 — 호텔 레스토랑에 문의",
        "**12/27 (일)** Sumo Vervet **13:00–22:00** (공식 연휴 시간표) · 평소 일요일 영업: Smørtorget · Burgr · Yonas · Casa Inferno · Skarven Kro",
        "**12/31 (목)** Clarion Hotel The Edge **새해 전야 뷔페** (The Social Bar & Bistro) — 예약 필요 · Sumo 휴무",
        "**1/1 (금)** Sumo Vervet 15:00–22:00"
      ]
    },
    "groups": [
      {
        "title": "시푸드 · 파인다이닝 (예약 필수)",
        "items": [
          {
            "name": "Fiskekompaniet",
            "price": "$$$$",
            "desc": "항구 앞 대표 시푸드. 점심 아라카르트가 저녁 코스(3·5코스)보다 부담이 적어요",
            "hours": "점심 월–토 11:30–14:00 (평일 15:00까지라는 안내도 있음) · 저녁 월–토 17:00–22:00 · 일 휴무",
            "addr": "Killengreens gate 6",
            "map": "https://maps.google.com/?cid=17982134320915230315"
          },
          {
            "name": "Restaurant Smak",
            "price": "$$$$",
            "desc": "트롬쇠 대표 북유럽 테이스팅 코스 (약 2,500 NOK · 16–18코스 · 4–5시간). 좌석이 적어 예약 경쟁이 치열하고 보증금 필요",
            "hours": "수–토 18:00–24:00 · 일–화 휴무",
            "addr": "Stakkevollvegen 39",
            "map": "https://maps.google.com/?cid=4979463353818118703"
          },
          {
            "name": "Emmas Drømmekjøkken",
            "price": "$$$$",
            "desc": "트롬쇠 대성당(시내 Domkirke) 맞은편, 노르웨이식 테이스팅 메뉴",
            "note": "리노베이션으로 임시 휴업 중이라는 정보가 많아요 — 재개 여부 확인 필요",
            "hours": "화–토 저녁 (재개 시 확인)",
            "addr": "Kirkegata 8",
            "map": "https://maps.google.com/?cid=10759602435588270016"
          },
          {
            "name": "Arctandria",
            "price": "$$$",
            "desc": "항구 Vertshuset Skarven 2층, 북노르웨이 전통 해산물",
            "hours": "월–목 16:00–22:00 · 금–토 16:00–23:00 · 일 휴무",
            "addr": "Strandtorget 1",
            "map": "https://maps.google.com/?cid=4643929146814904705"
          }
        ]
      },
      {
        "title": "노르웨이 로컬 · 비스트로",
        "items": [
          {
            "name": "Bardus Bistro",
            "price": "$$",
            "desc": "순록 버거 · 제철 로컬 비스트로 요리. 점심이 비교적 합리적이고 옆 바에서 한잔하기 좋음 (예약 권장)",
            "hours": "화–금 11:00–15:00 · 16:00–22:00 / 토 12:00–15:00 · 16:00–22:00 · 일·월 휴무",
            "addr": "Cora Sandels gate 4",
            "map": "https://maps.google.com/?cid=6013747455949090020"
          },
          {
            "name": "Mathallen Tromsø",
            "price": "$$$",
            "desc": "북노르웨이 식재료 모던 비스트로 · 작은 델리도 있음",
            "hours": "월–토 점심 11:00–15:00 · 저녁 17:00–22:00 · 일 휴무",
            "addr": "Grønnegata 60",
            "map": "https://maps.google.com/?cid=14836058510433319348"
          },
          {
            "name": "Hildr Gastro Bar",
            "price": "$$$",
            "desc": "지역 해산물 · 허브를 쓰는 아늑한 가스트로 바",
            "hours": "화–토 18:00–22:00 · 일·월 휴무 (확인 필요)",
            "addr": "Skippergata 11",
            "map": "https://maps.google.com/?cid=17661979957214610675"
          },
          {
            "name": "Maskinverkstedet",
            "price": "$$",
            "desc": "옛 조선소 작업장을 고친 Vervet 해안가 비스트로",
            "hours": "월–토 점심 · 저녁 · 일 휴무 (확인 필요)",
            "addr": "Nordøstpassasjen 49",
            "map": "https://maps.google.com/?cid=7468916533296865478"
          },
          {
            "name": "Full Steam Tromsø",
            "price": "$$",
            "desc": "어업 역사가 담긴 항구 목조 건물, 생선 · 대구 요리 (해안 박물관 함께)",
            "hours": "월–토 11:00–22:00 · 일 11:00–18:00 (확인 필요)",
            "addr": "Søndre Tollbodgate 3",
            "map": "https://maps.google.com/?cid=3127136208423542837"
          },
          {
            "name": "Skarven Kro",
            "price": "$$",
            "desc": "항구 앞 캐주얼 펍 겸 식당 — 생선 수프 · 순록 버거 · 와플",
            "hours": "매일 11:00부터",
            "addr": "Strandtorget 1",
            "map": "https://maps.google.com/?cid=16022609803222577800"
          }
        ]
      },
      {
        "title": "캐주얼 · 피자 · 버거 · 아시안",
        "items": [
          {
            "name": "Burgr",
            "price": "$",
            "desc": "레트로 게임 콘셉트 가성비 수제버거 · 밀크셰이크 — 예약 안 받음 (선착순)",
            "hours": "매일 12:00–22:00",
            "addr": "Skippergata 6A",
            "map": "https://maps.google.com/?cid=13820675339499060405"
          },
          {
            "name": "Casa Inferno",
            "price": "$$",
            "desc": "화덕 피자 인기 맛집 — 해산물이 질릴 때. 예약은 일–목만 가능, 포장 가능",
            "hours": "일–화 16:00–22:00 · 수–토 16:00–23:00",
            "addr": "Vestregata 2",
            "map": "https://maps.google.com/?cid=2146077502820686340"
          },
          {
            "name": "Yonas Pizzeria",
            "price": "$$",
            "desc": "1974년부터 영업한 피자집, Radisson Blu 옆 · 북극 대성당이 보이는 바닷가",
            "hours": "매일 11:00–23:00",
            "addr": "Sjøgata 7",
            "map": "https://maps.google.com/?cid=8029326161991184215"
          },
          {
            "name": "Sumo Vervet",
            "price": "$$",
            "desc": "스시 · 따뜻한 아시안 요리",
            "note": "연휴 공식 시간표: 12/24–26 · 12/31 휴무 / 12/27 13:00–22:00 / 12/28–30 15:00–22:00 / 1/1 15:00–22:00",
            "hours": "평일 15:00–22:00 · 주말 13:00–22:00",
            "addr": "Nordøstpassasjen 43",
            "map": "https://maps.google.com/?cid=1412683388499850784"
          }
        ]
      },
      {
        "title": "카페",
        "items": [
          {
            "name": "Risø mat og kaffebar",
            "price": "$$",
            "desc": "트롬쇠 대표 스페셜티 커피 · 시나몬롤 · 가벼운 점심",
            "hours": "평일 08:00부터 · 토 09:00–17:00 · 일 휴무 (출처마다 마감 시간이 달라요)",
            "addr": "Strandgata 32",
            "map": "https://maps.google.com/?cid=10895374863184765445"
          },
          {
            "name": "Smørtorget",
            "price": "$$",
            "desc": "빈티지 소품샵 겸 아늑한 카페 — 따뜻한 점심 · 케이크 · 오트밀 죽",
            "hours": "월–금 08:00–18:00 · 토 10:00–18:00 · 일 11:00–18:00",
            "addr": "Sjøgata 11 (Fredrik Langes gate 쪽)",
            "map": "https://maps.google.com/?cid=3251428853782886088"
          },
          {
            "name": "Clarion Hotel The Edge",
            "price": "",
            "desc": "연휴용 대안 — 12/25 크리스마스 디너 뷔페 17:00–22:00, 12/31 새해 전야 뷔페 (사전 예약 · 선결제)",
            "hours": "행사별 예약",
            "addr": "Kaigata 6",
            "map": "https://maps.google.com/?cid=569256658187534540"
          }
        ]
      }
    ]
  },

  info: {
    draft: false,
    notice: "확인하면서 계속 업데이트 합니다",
    eyebrow: "LOCAL INFO",
    title: "추가 정보",
    original: "출발 직전에 한 번 더 확인하세요 · 영업시간은 매년 조금씩 달라요",
    warn: { title: "연휴 주의 — 도착일(12/25)은 마트 대부분 휴무", items: [
      "**12/24(목)** 상점 대부분 13시 전후 마감 (법적으로 16시까지) · 마트·주류점(Vinmonopolet) 15시 전후",
      "**12/25(금) · 12/26(토)** 공휴일 — 마트·상점 대부분 휴무. 소형 마트(100㎡ 이하)·주유소 편의점·일부 식당만 영업",
      "**12/31(목)** 마트·쇼핑몰 15시 전후 마감 · **1/1(금)** 공휴일 — 대부분 휴무",
      "**12/25 ~ 12/27**(공휴일·일요일)에는 마트에서 맥주도 팔지 않아요 · 상점은 대부분 **12/28(월)**부터 정상 영업"
    ]},
    sections: [
      {
        "h": "첫날 먹을거리 · 연휴 마트",
        "list": [
          "아래 영업시간은 **2025년 공식 사이트 정보 기준** — 2026년 시간은 출발 전 다시 확인",
          "**12/25(금) 문 여는 마트는 사실상 Joker Storgatbakken 1곳** · Storgata 132 (시내 북쪽 끝) · 12/25·12/26 **10:00–23:00**",
          "숙소 옆 **Joker Dramsveien** (Dramsvegen 153) · 12/24 09:00–15:00 · **12/25 휴무** · 12/26(토) 10:00부터 다시 영업",
          "물·커피·샌드위치 정도는 공항→숙소 길목 **Circle K Breivika** (Terminalgata 24, 주유소 편의점) · 평소 24시간, 연휴 시간은 따로 안내 없음 (+47 77 67 58 80)",
          "**12/25(금) ~ 12/27(일) 마트 맥주 판매 불가** (공휴일·일요일) · 주류점(Vinmonopolet)도 휴무 → 현지 주류 구매는 **12/28(월)부터**, 필요하면 출국 전 면세점에서",
          "12/25 저녁은 문 연 식당이 적으니 미리 확인하거나, 첫 끼 간단한 먹을거리를 챙겨가는 걸 추천"
        ],
        "maps": [
          {
            "label": "Joker Storgatbakken · 12/25 영업",
            "q": "Joker Storgatbakken, Storgata 132, 9008 Tromsø",
            "open": "https://maps.google.com/?cid=18336980429892421008"
          },
          {
            "label": "Joker Dramsveien · 숙소 옆",
            "q": "Joker Dramsveien, Dramsvegen 153, 9010 Tromsø"
          },
          {
            "label": "Circle K Breivika · 24시간",
            "q": "Circle K Breivika, Terminalgata 24, 9019 Tromsø",
            "open": "https://maps.google.com/?cid=11121943950085116745"
          }
        ]
      },
      { h: "극야 · 밝은 시간", list: [
        "이 기간 트롬쇠는 **해가 뜨지 않아요** (극야, 정오 무렵 태양 고도 약 -3°)",
        "밝은 시간(박명)은 **약 09:30 ~ 14:00**, 가장 밝은 때는 11:45 전후",
        "12/28 해안 드라이브 · 12/29 Sommarøy는 **10시 전후 출발**해야 밝을 때 경치를 볼 수 있어요 (12/28은 체크아웃을 앞당기는 것도 방법)",
        "오로라는 어두운 저녁~새벽, 구름이 관건 — yr.no 구름 예보와 함께 보세요"
      ]},
      { h: "12/31 새해맞이", list: [
        "**Arctic Cathedral 새해 콘서트 21:00** (2026년 기준)",
        "자정 불꽃놀이 감상 추천 장소: Fjellheisen 정상 · Strandtorget · 항구 쪽 (공식 시작 시간은 미발표)",
        "Fjellheisen 케이블카는 연휴에도 대체로 정상 운행, 강풍 시 갑자기 멈출 수 있어요"
      ]},
      { h: "겨울 운전 · 전기차", list: [
        "도로 상황: 노르웨이 번호로 **175** / 한국 번호로 **+47 221 75 175** · vegvesen.no",
        "차간 거리 넓게, 커브·교차로 전 감속, 미끄러운 길에선 크루즈 컨트롤 끄기",
        "갓길에 내릴 땐 반사 조끼 · 차에 방한복·물·손전등 두기",
        "전기차는 추위에 주행거리가 줄어요 → 시내 급속충전소(예: Traasdahl 급속충전, Jekta 쇼핑몰)에서 채우고 출발",
        "Kvaløya·Sommarøy 쪽 충전소는 확인하지 못했어요 → 현지 앱(PlugShare 등)으로 확인, 캐빈에 충전 가능 여부 문의 (post@lauklines.no)"
      ]},
      { h: "긴급 연락처", list: [
        "경찰 **112** · 구급차 **113** · 화재 **110**",
        "응급은 아닌 진료(당직 병원, legevakt) **116 117** · 경찰 비긴급 **02800**",
        "주노르웨이 대한민국 대사관 **+47 22 54 70 90** · 근무시간 외 긴급 **+47 902 63 544** (Inkognitogata 3, Oslo)",
        "외교부 영사콜센터 (24시간) **+82 2 3210 0404**"
      ]}
    ],
    links: [
      { k: "오로라 예보", v: "UiT 트롬쇠 오로라 예보", href: "https://site.uit.no/spaceweather/data-and-products/aurora/tromso/" },
      { k: "날씨 · 구름", v: "yr.no", href: "https://www.yr.no/en" },
      { k: "도로 상황", v: "Statens vegvesen", href: "https://www.vegvesen.no/en/?lang=en" },
      { k: "겨울 운전", v: "Visit Tromsø 도로 안내", href: "https://www.visittromso.no/travel/getting-around/road-conditions" },
      { k: "연휴 영업", v: "Tromsø 크리스마스·새해 안내", href: "https://www.tromsowinter.com/christmas/" }
    ]
  },

  /* ---------- 추천 (노션 · ChatGPT) ---------- */
  picks: {
    groups: [
      { stars: 5, title: "반드시 추천", items: [
        { name: "오로라 헌팅 투어", desc: "첫 방문이라면 가장 추천. 12/26 Wandering Owl로 예약 완료.", time: "반나절",
          imgs: ["Troms%C3%B8_Aurora,_Norway.jpg", "Nordlicht-hilles%C3%B8ya.jpg"],
          link: { label: "다니엘 투어 후기", href: "https://misdias.tistory.com/64" } },
        { name: "Fjellheisen 케이블카", desc: "트롬쇠 최고의 전망. 추천 시간 12:00 ~ 14:00 — 12~13시 설산·피오르가 가장 선명, 13~14시 블루아워에 시내 불빛까지.", time: "2~3시간",
          imgs: ["View_of_Troms%C3%B8_from_Fjelleisen_06.jpg", "Troms%C3%B8_Cable_cars_Fjellheisen_01.jpg", "Fjellheisen,_Tromsdalen,_and_Troms%C3%B8ysundet_-_Troms%C3%B8,_Norway_2023-07-08.jpg"] },
        { name: "Arctic Cathedral", desc: "케이블카와 함께 묶기 좋음. 12/31 새해 전야 오르간 콘서트로도 유명.", time: "30~60분",
          imgs: ["Tromsdalen_kirke_%28Ishavskatedralen%29_-_The_Arctic_Cathedral_%285557802765%29.jpg", "Arctic_Cathedral_in_Tromsoe.jpg", "Troms%C3%B8_Ishavskatedralen_Interior_01.jpg"] },
        { name: "Sommarøy · Kvaløya 드라이브", desc: "이미 일정에 포함 — 계획한 코스가 가장 좋음.", time: "하루",
          imgs: ["Sommar%C3%B8y1.jpg", "Sommaroy_panorama.jpg", "Sommar%C3%B8ybrua_depuis_l%27%C3%AEle_de_Sommar%C3%B8ya.jpg"] }
      ]},
      { stars: 4, title: "추천", items: [
        { name: "Polar Museum", desc: "북극 탐험 역사 — 아문센, 난센, 극지 생활.", time: "약 1시간",
          imgs: ["Polar_Museum_in_Troms%C3%B8_%28Jul_2019%29_1.jpg", "Polarmuseet.jpg"] },
        { name: "Polaria", desc: "북극 전시 · 수족관 · 물범 먹이주기. 날씨가 안 좋은 날 가기 좋은 실내 코스.", time: "1~2시간",
          imgs: ["Polaria_Troms%C3%B8.jpg"] },
        { name: "Mack Brewery · Ølhallen", desc: "1877년 시작된 트롬쇠 대표 양조장. 1928년 문을 연 펍 Ølhallen에서 시음.", time: "1~2시간" },
        { name: "Magic Ice Bar", desc: "관광객에게 인기 있는 얼음 바.", time: "30~40분" }
      ]},
      { stars: 4, title: "액티비티", items: [
        { name: "개썰매", desc: "트롬쇠 대표 액티비티. 다만 오로라 투어와 겹치면 피곤할 수 있음.", time: "반나절",
          imgs: ["White_huskies_dog_sledding.jpg"] },
        { name: "순록 체험", desc: "사미 문화 · 순록 먹이주기 · 전통 식사.", time: "반나절",
          imgs: ["A_man_holds_a_reindeer_with_a_sled._Winter,_Finnmarksvidda.jpg", "Sami_woman_with_white_reindeer.jpg", "Reindeer_herding.jpg"] },
        { name: "고래 투어", desc: "12월이면 가능성은 있으나 자연 드라이브 일정이 많아 우선순위 낮음." }
      ]}
    ],
    extras: [
      { k: "전망 카페", v: "Smørtorget · Risø · Raketten — 눈 오는 날 쉬기 좋음" },
      { k: "항구 산책", v: "저녁 · 블루아워 · 사진 촬영" },
      { k: "쇼핑", v: "네르스트란다 쇼핑센터 · Storgata" },
      { k: "음식", v: "Fiskekompaniet · Emma's Dream Kitchen · Bardus Bistro · Full Steam · Mathallen · 버거 Burgr · 피자 Yonas" },
      { k: "사진 포인트", v: "Tromsø Bridge · 항구 · Prestvannet · 케이블카 정상" },
      { k: "시간이 남으면", v: "Tromvik · Rekvik · Kaldfjord · Hillesøy · Brensholmen · Kattfjordeidet 드라이브" }
    ],
    summary: "현재 계획에 Fjellheisen + Arctic Cathedral + Polar Museum + Mack Brewery만 더해도 트롬쇠 핵심 볼거리는 거의 다 경험하는 일정이 됩니다."
  }
};
