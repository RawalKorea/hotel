# StayNest - AI 기반 호텔 예약 및 통합 관리 시스템

## 기술 스택

| 구분 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma 6 |
| Authentication | Auth.js (NextAuth v5) |
| AI / Chatbot | OpenAI API (GPT-4o-mini) |
| Payments | Portone API |
| Storage | Supabase Storage |

## 시작하기

### 1. 환경변수 설정

`.env.example`을 참고하여 `.env` 파일을 작성하세요.

```bash
cp .env.example .env
```

### 2. 의존성 설치

```bash
npm install
```

### 3. DB 마이그레이션

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

## 프로젝트 구조

```
src/
├── app/
│   ├── (auth)/          # 로그인/회원가입
│   ├── (user)/          # 사용자 페이지 (홈, 객실, 마이페이지)
│   ├── admin/           # 관리자 대시보드
│   └── api/             # API 라우트
├── components/
│   ├── admin/           # 관리자 컴포넌트
│   ├── providers/       # 세션/테마 프로바이더
│   ├── ui/              # shadcn/ui 컴포넌트
│   └── user/            # 사용자 컴포넌트
├── lib/
│   ├── validations/     # Zod 스키마
│   ├── auth.ts          # Auth.js 설정
│   ├── constants.ts     # 상수 정의
│   ├── prisma.ts        # Prisma 클라이언트
│   └── utils.ts         # 유틸리티
└── types/               # TypeScript 타입 정의
```

## 주요 기능

### 사용자 (/user)
- 객실 검색 및 필터 (등급, 가격, 편의시설)
- 실시간 예약 프로세스
- 마이페이지 (예약 내역, 리뷰 작성)
- AI 챗봇 상담

### 관리자 (/admin)
- 대시보드 (매출, 가동률, 최근 예약)
- 객실 CRUD 관리
- 예약 관리 (리스트 + 캘린더 뷰)
- 매출/통계 차트
- AI 엔진 관리 (FAQ, 챗봇 설정)

## 사용자 역할

| 역할 | 설명 |
|------|------|
| USER | 일반 사용자 (예약, 리뷰) |
| STAFF | 운영 스태프 (객실/예약 관리) |
| SUPER_ADMIN | 최고 관리자 (모든 권한) |
