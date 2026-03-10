import { Hotel } from "lucide-react";
import Link from "next/link";
import { getPublicSettings } from "@/lib/settings";

export async function SiteFooter() {
  const settings = await getPublicSettings();
  const siteName = settings.siteName || "StayNest";
  const description = settings.siteDescription || "최고의 휴식을 위한 특별한 공간.\nAI 기반 스마트 호텔 예약 시스템.";
  const contactPhone = settings.contactPhone || "02-1234-5678";
  const contactEmail = settings.contactEmail || "info@staynest.com";
  const address = settings.address || "서울특별시 강남구";
  const footerText = settings.footerText || `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`;

  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Hotel className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">{siteName}</span>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {description}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">서비스</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/rooms" className="hover:text-foreground">
                  객실 둘러보기
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-foreground">
                  호텔 소개
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground">
                  문의하기
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-foreground">
                  후기·커뮤니티
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">고객 지원</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/faq" className="hover:text-foreground">
                  자주 묻는 질문
                </Link>
              </li>
              <li>
                <Link href="/patchnotes" className="hover:text-foreground">
                  패치 노트
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground">
                  개인정보 처리방침
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">연락처</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>전화: {contactPhone}</li>
              <li>이메일: {contactEmail}</li>
              <li>주소: {address}</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          {footerText}
        </div>
      </div>
    </footer>
  );
}
