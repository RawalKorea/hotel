export const ROOM_GRADES = {
  STANDARD: "스탠다드",
  SUPERIOR: "슈피리어",
  DELUXE: "디럭스",
  SUITE: "스위트",
  PRESIDENTIAL: "프레지덴셜",
} as const;

export const ROOM_STATUS = {
  AVAILABLE: "이용 가능",
  MAINTENANCE: "점검 중",
  UNAVAILABLE: "이용 불가",
} as const;

export const BOOKING_STATUS = {
  PENDING: "대기",
  CONFIRMED: "확정",
  CHECKED_IN: "체크인",
  CHECKED_OUT: "체크아웃",
  CANCELLED: "취소",
} as const;

export const BOOKING_STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  CHECKED_IN: "bg-green-100 text-green-800",
  CHECKED_OUT: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export const AMENITIES_OPTIONS = [
  "WiFi",
  "TV",
  "에어컨",
  "미니바",
  "금고",
  "욕조",
  "자쿠지",
  "오션뷰",
  "시티뷰",
  "발코니",
  "테라스",
  "주방",
  "세탁기",
  "주차장",
  "수영장",
  "조식 포함",
  "헬스장",
  "스파",
  "반려동물 허용",
  "흡연 가능",
];

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("ko-KR").format(price);
