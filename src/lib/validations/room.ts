import { z } from "zod";

export const roomSchema = z.object({
  name: z.string().min(1, "객실 이름을 입력해주세요."),
  description: z.string().min(10, "상세 설명은 최소 10자 이상이어야 합니다."),
  grade: z.enum(["STANDARD", "SUPERIOR", "DELUXE", "SUITE", "PRESIDENTIAL"]),
  pricePerNight: z.coerce
    .number()
    .min(10000, "최소 가격은 10,000원 이상이어야 합니다."),
  maxAdults: z.coerce.number().min(1).max(10),
  maxChildren: z.coerce.number().min(0).max(10),
  amenities: z.array(z.string()),
  status: z.enum(["AVAILABLE", "MAINTENANCE", "UNAVAILABLE"]).optional(),
});

export type RoomInput = z.infer<typeof roomSchema>;
