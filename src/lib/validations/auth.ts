import { z } from "zod";

const passwordSchema = z
  .string()
  .min(6, "비밀번호는 최소 6자 이상이어야 합니다.")
  .regex(
    /^(?=.*[a-zA-Z])(?=.*\d)/,
    "비밀번호는 영문과 숫자를 포함해야 합니다."
  );

export const loginSchema = z.object({
  loginId: z.string().min(1, "이메일 또는 아이디를 입력해주세요."),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다."),
});

export const registerEmailSchema = z
  .object({
    accountType: z.literal("email"),
    name: z.string().min(2, "이름은 최소 2자 이상이어야 합니다."),
    email: z.string().email("유효한 이메일을 입력해주세요."),
    phone: z
      .string()
      .regex(/^01[0-9]-?\d{3,4}-?\d{4}$/, "유효한 전화번호를 입력해주세요.")
      .optional()
      .or(z.literal("")),
    password: passwordSchema,
    confirmPassword: z.string(),
    agreeTerms: z.literal(true, {
      message: "이용약관에 동의해주세요.",
    }),
    agreePrivacy: z.literal(true, {
      message: "개인정보 처리방침에 동의해주세요.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  });

export const registerStayNestSchema = z
  .object({
    accountType: z.literal("staynest"),
    name: z.string().min(2, "이름은 최소 2자 이상이어야 합니다."),
    username: z
      .string()
      .min(3, "아이디는 최소 3자 이상이어야 합니다.")
      .max(20, "아이디는 20자 이하여야 합니다.")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "아이디는 영문, 숫자, 언더스코어만 사용할 수 있습니다."
      ),
    phone: z
      .string()
      .regex(/^01[0-9]-?\d{3,4}-?\d{4}$/, "유효한 전화번호를 입력해주세요.")
      .optional()
      .or(z.literal("")),
    password: passwordSchema,
    confirmPassword: z.string(),
    agreeTerms: z.literal(true, {
      message: "이용약관에 동의해주세요.",
    }),
    agreePrivacy: z.literal(true, {
      message: "개인정보 처리방침에 동의해주세요.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  });

export const registerSchema = z.discriminatedUnion("accountType", [
  registerEmailSchema,
  registerStayNestSchema,
]);

export const adminRegisterSchema = z
  .object({
    name: z.string().min(2, "이름은 최소 2자 이상이어야 합니다."),
    email: z.string().email("유효한 이메일을 입력해주세요."),
    phone: z
      .string()
      .regex(/^01[0-9]-?\d{3,4}-?\d{4}$/, "유효한 전화번호를 입력해주세요.")
      .optional()
      .or(z.literal("")),
    password: passwordSchema,
    confirmPassword: z.string(),
    agreeTerms: z.literal(true, {
      message: "이용약관에 동의해주세요.",
    }),
    agreePrivacy: z.literal(true, {
      message: "개인정보 처리방침에 동의해주세요.",
    }),
    securityCode: z.string().min(1, "보안 코드를 입력해주세요."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type AdminRegisterInput = z.infer<typeof adminRegisterSchema>;
