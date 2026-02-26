"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { roomSchema, type RoomInput } from "@/lib/validations/room";
import type { Resolver } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ROOM_GRADES, AMENITIES_OPTIONS } from "@/lib/constants";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type RoomItem = {
  id: string;
  name: string;
  grade: string;
  pricePerNight: number;
  maxAdults: number;
  maxChildren: number;
  status: string;
  amenities: string[];
};

export function RoomForm({
  room,
  onSuccess,
}: {
  room: RoomItem | null;
  onSuccess: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const isEdit = !!room;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RoomInput>({
    resolver: zodResolver(roomSchema) as Resolver<RoomInput>,
    defaultValues: room
      ? {
          name: room.name,
          description: "",
          grade: room.grade as RoomInput["grade"],
          pricePerNight: room.pricePerNight,
          maxAdults: room.maxAdults,
          maxChildren: room.maxChildren,
          amenities: room.amenities,
          status: room.status as RoomInput["status"],
        }
      : {
          grade: "STANDARD",
          pricePerNight: 100000,
          maxAdults: 2,
          maxChildren: 0,
          amenities: [],
        },
  });

  const amenities = watch("amenities") || [];

  const toggleAmenity = (amenity: string) => {
    const updated = amenities.includes(amenity)
      ? amenities.filter((a) => a !== amenity)
      : [...amenities, amenity];
    setValue("amenities", updated, { shouldValidate: true });
  };

  const onSubmit = async (data: RoomInput) => {
    setIsLoading(true);
    try {
      const url = isEdit ? `/api/admin/rooms/${room.id}` : "/api/admin/rooms";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      toast.success(isEdit ? "객실이 수정되었습니다." : "객실이 등록되었습니다.");
      onSuccess();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? "객실 수정" : "새 객실 등록"}</DialogTitle>
        <DialogDescription>
          객실 정보를 {isEdit ? "수정" : "입력"}해주세요.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">객실 이름</Label>
          <Input
            id="name"
            placeholder="로얄 오션 스위트"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">상세 설명</Label>
          <Textarea
            id="description"
            placeholder="객실에 대한 상세 설명을 입력해주세요..."
            rows={4}
            {...register("description")}
          />
          {errors.description && (
            <p className="text-sm text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>등급</Label>
            <Select
              defaultValue={watch("grade")}
              onValueChange={(v) =>
                setValue("grade", v as RoomInput["grade"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="등급 선택" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ROOM_GRADES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pricePerNight">1박 가격 (원)</Label>
            <Input
              id="pricePerNight"
              type="number"
              step={10000}
              {...register("pricePerNight")}
            />
            {errors.pricePerNight && (
              <p className="text-sm text-destructive">
                {errors.pricePerNight.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="maxAdults">최대 성인</Label>
            <Input
              id="maxAdults"
              type="number"
              min={1}
              max={10}
              {...register("maxAdults")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxChildren">최대 아동</Label>
            <Input
              id="maxChildren"
              type="number"
              min={0}
              max={10}
              {...register("maxChildren")}
            />
          </div>
        </div>

        {isEdit && (
          <div className="space-y-2">
            <Label>상태</Label>
            <Select
              defaultValue={watch("status") || "AVAILABLE"}
              onValueChange={(v) =>
                setValue("status", v as RoomInput["status"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AVAILABLE">이용 가능</SelectItem>
                <SelectItem value="MAINTENANCE">점검 중</SelectItem>
                <SelectItem value="UNAVAILABLE">이용 불가</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label>편의시설</Label>
          <div className="grid grid-cols-3 gap-2 rounded-lg border p-3">
            {AMENITIES_OPTIONS.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                  id={`amenity-${amenity}`}
                  checked={amenities.includes(amenity)}
                  onCheckedChange={() => toggleAmenity(amenity)}
                />
                <Label
                  htmlFor={`amenity-${amenity}`}
                  className="text-sm font-normal"
                >
                  {amenity}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? "수정하기" : "등록하기"}
        </Button>
      </form>
    </>
  );
}
