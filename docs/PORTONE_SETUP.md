# Portone 결제 연동 설정

## 1. 포트원 가입 및 키 발급

1. [포트원 관리자콘솔](https://admin.portone.io/) 회원가입
2. **시스템 설정** > **REST API 키** 메뉴에서 확인:
   - 가맹점 식별코드 (Store ID)
   - REST API Key
   - REST API Secret

## 2. 환경 변수 설정 (.env)

```env
# Portone
NEXT_PUBLIC_PORTONE_STORE_ID="가맹점 식별코드"   # 클라이언트 IMP.init용
PORTONE_IMP_KEY="REST API Key"                 # 서버 API용 (없으면 STORE_ID 사용)
PORTONE_IMP_SECRET="REST API Secret"            # 서버 API용
# 구버전 호환
PORTONE_API_SECRET="REST API Secret"            # PORTONE_IMP_SECRET와 동일
```

## 3. PG사 설정

- 포트원 콘솔에서 **결제 연동** > **실 연동** 설정
- 나이스페이먼츠, 이니시스 등 PG사 계약 및 연동 정보 입력

## 4. 동작 방식

- **즉시 결제**: 결제창 → imp_uid 수신 → 서버 검증 → DB 저장
- **빌링키(빠른 결제)**: 카드 등록 시 amount: 0으로 customer_uid 발급 → 저장 → 결제 시 subscribe/payments/again API 호출
