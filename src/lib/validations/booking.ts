import { z } from "zod";

export const bookingSchema = z
  .object({
    roomId: z.string().min(1, "객실을 선택해주세요."),
    checkIn: z.coerce.date({ message: "체크인 날짜를 선택해주세요." }),
    checkOut: z.coerce.date({ message: "체크아웃 날짜를 선택해주세요." }),
    adults: z.coerce.number().min(1, "최소 1명의 성인이 필요합니다."),
    children: z.coerce.number().min(0).default(0),
    specialNote: z.string().optional(),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: "체크아웃 날짜는 체크인 이후여야 합니다.",
    path: ["checkOut"],
  });

export const reviewSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  content: z.string().min(10, "리뷰는 최소 10자 이상이어야 합니다."),
});

export type BookingInput = z.infer<typeof bookingSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
