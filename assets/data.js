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

  /* ---------- 일자별 일정 ---------- */
  days: [
    { date: "2026-12-24", tag: "출국", tone: "blue", items: [
      { text: "한국 출발 · 트롬쇠로 이동" }
    ]},
    { date: "2026-12-25", tag: "도착", tone: "blue", items: [
      { time: "10:00", text: "트롬쇠 공항 Hertz 키오스크에서 **렌터카 픽업** (Peugeot e-3008 전기차)", tab: "car" },
      { text: "식사 · 짧은 드라이브" },
      { time: "17:00", text: "**Airbnb 셀프 체크인** (열쇠 보관함) · Dramsvegen 167 · 15:00로 앞당기기 요청 중", tab: "stay1" }
    ], maps: [{ label: "숙소 위치", q: "Dramsvegen 167, 9010 Tromsø", open: "https://maps.app.goo.gl/sdqMFhLAw8rqRB2V6?g_st=ic" }]},
    { date: "2026-12-26", tag: "오로라", tone: "violet", items: [
      { text: "트롬쇠 시내 관광 · 경우에 따라 드라이브" },
      { time: "17:20", text: "**Scandic Ishavshotel 앞 집합** (5~10분 전 밖에서 대기)", tab: "aurora" },
      { time: "17:30", text: "**Wandering Owl · Adults Only Aurora Hunt** (약 6시간)", tab: "aurora" }
    ], maps: [{ label: "오로라 투어 집결지", q: "Scandic Ishavshotel, Fredrik Langes gate 2, Tromsø" }]},
    { date: "2026-12-27", tag: "휴식", tone: "green", items: [
      { text: "야간 투어 후 늦은 오전까지 휴식" },
      { text: "가벼운 시내 관광 — Fjellheisen 케이블카 · Arctic Cathedral · 항구 산책 · Mack Brewery", tab: "picks" }
    ]},
    { date: "2026-12-28", tag: "이동", tone: "amber", items: [
      { time: "11:00", text: "Airbnb 체크아웃" },
      { text:  "☀️ 밝은 시간 약 09:30–14:00 · 경치를 보려면 **10시 전후 출발** (체크아웃을 앞당기는 것도 방법)" },
      { text: "Kvaløya 해안 드라이브" },
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
    contacts: []
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
      { h: "결제 내역", list: [
        "**총액 7,438 NOK (≈ ₩1,038,413) · 완납**",
        "공급가 6,641 NOK + VAT 12% 797 NOK (1박 3,719 NOK)",
        "2026-07-23 Visa 1,512 NOK · 2026-11-15 Visa 5,927 NOK — **잔액 0 NOK**",
        "확인 메일: nasong27@gmail.com"
      ]},
      { h: "포함 사항", chips: ["침대 시트(린넨)", "수건", "퇴실 청소", "냉동고", "전기", "난방", "와이파이", "온수 · 냉수"] },
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
        "캐빈 최대 정원 5+1명 · 싱글 침대 구성"
      ]}
    ],
    refs: [{ k: "예약처", v: "Lauklines Kystferie", href: "https://lauklines.no" }],
    contacts: ["post@lauklines.no"]
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
        { name: "Fjellheisen 케이블카", desc: "트롬쇠 최고의 전망. 낮 · 블루아워 모두 좋고 시내 전경을 한눈에.", time: "2~3시간",
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
