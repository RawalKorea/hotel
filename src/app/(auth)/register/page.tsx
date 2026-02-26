"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Hotel, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      agreeTerms: false as unknown as true,
      agreePrivacy: false as unknown as true,
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error);
        return;
      }

      toast.success("회원가입이 완료되었습니다! 로그인해주세요.");
      router.push("/login");
    } catch {
      toast.error("회원가입 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <Hotel className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">회원가입</CardTitle>
          <CardDescription>StayNest 계정을 만들어보세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input id="name" placeholder="홍길동" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">전화번호 (선택)</Label>
              <Input
                id="phone"
                placeholder="010-1234-5678"
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="영문+숫자 6자 이상"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="비밀번호를 다시 입력"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agreeTerms"
                  checked={!!watch("agreeTerms")}
                  onCheckedChange={(checked) =>
                    setValue("agreeTerms", checked as true, {
                      shouldValidate: true,
                    })
                  }
                />
                <Label htmlFor="agreeTerms" className="text-sm font-normal">
                  [필수] 이용약관에 동의합니다
                </Label>
              </div>
              {errors.agreeTerms && (
                <p className="text-sm text-destructive">
                  {errors.agreeTerms.message}
                </p>
              )}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agreePrivacy"
                  checked={!!watch("agreePrivacy")}
                  onCheckedChange={(checked) =>
                    setValue("agreePrivacy", checked as true, {
                      shouldValidate: true,
                    })
                  }
                />
                <Label htmlFor="agreePrivacy" className="text-sm font-normal">
                  [필수] 개인정보 처리방침에 동의합니다
                </Label>
              </div>
              {errors.agreePrivacy && (
                <p className="text-sm text-destructive">
                  {errors.agreePrivacy.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              회원가입
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            이미 계정이 있으신가요?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              로그인
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
