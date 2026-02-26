"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerEmailSchema,
  registerStayNestSchema,
  type RegisterInput,
} from "@/lib/validations/auth";
import type { z } from "zod";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Hotel, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

type AccountType = "email" | "staynest";
type EmailRegisterInput = z.infer<typeof registerEmailSchema>;
type StayNestRegisterInput = z.infer<typeof registerStayNestSchema>;

const defaultEmailValues: Partial<EmailRegisterInput> = {
  accountType: "email",
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  agreeTerms: false as unknown as true,
  agreePrivacy: false as unknown as true,
};

const defaultStayNestValues: Partial<StayNestRegisterInput> = {
  accountType: "staynest",
  name: "",
  username: "",
  phone: "",
  password: "",
  confirmPassword: "",
  agreeTerms: false as unknown as true,
  agreePrivacy: false as unknown as true,
};

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>("email");

  const emailForm = useForm<EmailRegisterInput>({
    resolver: zodResolver(registerEmailSchema),
    defaultValues: defaultEmailValues,
  });

  const stayNestForm = useForm<StayNestRegisterInput>({
    resolver: zodResolver(registerStayNestSchema),
    defaultValues: defaultStayNestValues,
  });

  const onSubmit = async (
    data: EmailRegisterInput | StayNestRegisterInput
  ) => {
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
          <CardDescription>가입 방식을 선택해주세요</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={accountType}
            onValueChange={(v) => setAccountType(v as AccountType)}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">이메일로 가입</TabsTrigger>
              <TabsTrigger value="staynest">스테이네스트 계정</TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="mt-4">
              <div className="mb-4 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                <strong>이메일 가입:</strong> 이메일은 예약 확인, 알림 등에
                사용됩니다. 비밀번호는 이메일 계정 로그인에 사용할 비밀번호를
                설정해주세요.
              </div>
              <form
                onSubmit={emailForm.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    placeholder="홍길동"
                    {...emailForm.register("name")}
                  />
                  {emailForm.formState.errors.name && (
                    <p className="text-sm text-destructive">
                      {(emailForm.formState.errors as { name?: { message: string } }).name?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    {...emailForm.register("email")}
                  />
                  <p className="text-xs text-muted-foreground">
                    예약 확인, 알림 등에서 사용됩니다.
                  </p>
                  {emailForm.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {(emailForm.formState.errors as { email?: { message: string } }).email?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">전화번호 (선택)</Label>
                  <Input
                    id="phone"
                    placeholder="010-1234-5678"
                    {...emailForm.register("phone")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">비밀번호</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="영문+숫자 6자 이상"
                    {...emailForm.register("password")}
                  />
                  <p className="text-xs text-muted-foreground">
                    이메일 계정 로그인 시 사용할 비밀번호입니다.
                  </p>
                  {emailForm.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {(emailForm.formState.errors as { password?: { message: string } }).password?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="비밀번호를 다시 입력"
                    {...emailForm.register("confirmPassword")}
                  />
                  {emailForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {(emailForm.formState.errors as { confirmPassword?: { message: string } }).confirmPassword?.message}
                    </p>
                  )}
                </div>

                <AgreeCheckboxes form={emailForm} />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  회원가입
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="staynest" className="mt-4">
              <div className="mb-4 rounded-lg border border-amber-500/50 bg-amber-50/50 p-4 dark:bg-amber-950/20">
                <div className="flex gap-2">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-500" />
                  <div className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>주의:</strong> 스테이네스트 계정으로 가입하면 이메일
                    알림(예약 확인, 공지 등)을 받을 수 없습니다. 아이디와
                    비밀번호만으로 로그인할 수 있습니다.
                  </div>
                </div>
              </div>

              <form
                onSubmit={stayNestForm.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="staynest-name">이름</Label>
                  <Input
                    id="staynest-name"
                    placeholder="홍길동"
                    {...stayNestForm.register("name")}
                  />
                  {(stayNestForm.formState.errors as { name?: { message: string } }).name && (
                    <p className="text-sm text-destructive">
                      {(stayNestForm.formState.errors as { name?: { message: string } }).name?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">아이디</Label>
                  <Input
                    id="username"
                    placeholder="영문, 숫자 3~20자"
                    {...stayNestForm.register("username")}
                  />
                  <p className="text-xs text-muted-foreground">
                    로그인 시 사용할 아이디입니다. 영문, 숫자, 언더스코어만
                    사용 가능합니다.
                  </p>
                  {(stayNestForm.formState.errors as { username?: { message: string } }).username && (
                    <p className="text-sm text-destructive">
                      {(stayNestForm.formState.errors as { username?: { message: string } }).username?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staynest-phone">전화번호 (선택)</Label>
                  <Input
                    id="staynest-phone"
                    placeholder="010-1234-5678"
                    {...stayNestForm.register("phone")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staynest-password">비밀번호</Label>
                  <Input
                    id="staynest-password"
                    type="password"
                    placeholder="영문+숫자 6자 이상"
                    {...stayNestForm.register("password")}
                  />
                  {(stayNestForm.formState.errors as { password?: { message: string } }).password && (
                    <p className="text-sm text-destructive">
                      {(stayNestForm.formState.errors as { password?: { message: string } }).password?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staynest-confirmPassword">비밀번호 확인</Label>
                  <Input
                    id="staynest-confirmPassword"
                    type="password"
                    placeholder="비밀번호를 다시 입력"
                    {...stayNestForm.register("confirmPassword")}
                  />
                  {(stayNestForm.formState.errors as { confirmPassword?: { message: string } }).confirmPassword && (
                    <p className="text-sm text-destructive">
                      {(stayNestForm.formState.errors as { confirmPassword?: { message: string } }).confirmPassword?.message}
                    </p>
                  )}
                </div>

                <AgreeCheckboxes form={stayNestForm} />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  회원가입
                </Button>
              </form>
            </TabsContent>
          </Tabs>

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

function AgreeCheckboxes({
  form,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}) {
  const { setValue, watch, formState } = form;
  const errors = formState.errors;

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="agreeTerms"
          checked={!!watch("agreeTerms")}
          onCheckedChange={(checked) =>
            setValue("agreeTerms", checked === true, { shouldValidate: true })
          }
        />
        <Label htmlFor="agreeTerms" className="text-sm font-normal">
          [필수] 이용약관에 동의합니다
        </Label>
      </div>
      {errors.agreeTerms && (
        <p className="text-sm text-destructive">
          {String(
            typeof errors.agreeTerms === "object" && errors.agreeTerms !== null && "message" in errors.agreeTerms
              ? errors.agreeTerms.message
              : ""
          )}
        </p>
      )}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="agreePrivacy"
          checked={!!watch("agreePrivacy")}
          onCheckedChange={(checked) =>
            setValue("agreePrivacy", checked === true, { shouldValidate: true })
          }
        />
        <Label htmlFor="agreePrivacy" className="text-sm font-normal">
          [필수] 개인정보 처리방침에 동의합니다
        </Label>
      </div>
      {errors.agreePrivacy && (
        <p className="text-sm text-destructive">
          {String(
            typeof errors.agreePrivacy === "object" && errors.agreePrivacy !== null && "message" in errors.agreePrivacy
              ? errors.agreePrivacy.message
              : ""
          )}
        </p>
      )}
    </div>
  );
}
