"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

export function DangerPermissionsForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-destructive" />
          관리자 일방 설정
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          친구, 가족, 파트너스, 밴, 정지, 삭제 등은 고객 관리에서 각 사용자별로 설정합니다.
          사용자 상세를 열면 &quot;관계 설정&quot;과 &quot;밴/정지/삭제&quot; 버튼이 있습니다.
        </p>
      </CardHeader>
      <CardContent>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>• 친구/가족/파트너스: 고객 관리 → 사용자 클릭 → 관계 설정</li>
          <li>• 사용자 밴/정지: 고객 관리 테이블의 밴/정지 버튼</li>
          <li>• 계정 삭제: 고객 관리 테이블의 삭제 버튼</li>
          <li>• 권한 부여: 고객 관리 테이블의 역할 드롭다운</li>
        </ul>
      </CardContent>
    </Card>
  );
}
