import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CommunityFeed } from "@/components/user/community-feed";

export const dynamic = "force-dynamic";

async function getReviews() {
  try {
    return await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, image: true } },
        room: { select: { id: true, name: true, grade: true } },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
      },
    });
  } catch {
    return [];
  }
}

export default async function CommunityPage() {
  const reviews = await getReviews();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">후기·커뮤니티</h1>
        <p className="text-muted-foreground">
          실 투숙객 후기와 댓글을 확인하세요.
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-20 border rounded-xl bg-muted/30">
          <p className="text-muted-foreground text-lg mb-2">아직 후기가 없습니다.</p>
          <p className="text-sm text-muted-foreground">
            첫 후기를 남겨 주시면 곧 여기에 표시됩니다.
          </p>
          <Link
            href="/rooms"
            className="inline-block mt-4 text-primary hover:underline font-medium"
          >
            객실 둘러보기 →
          </Link>
        </div>
      ) : (
        <CommunityFeed reviews={reviews} />
      )}
    </div>
  );
}
