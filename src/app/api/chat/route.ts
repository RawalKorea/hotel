import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { message, sessionId } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "메시지를 입력해주세요." },
        { status: 400 }
      );
    }

    let chatSession;
    if (sessionId) {
      chatSession = await prisma.chatSession.findUnique({
        where: { id: sessionId },
      });
    }

    if (!chatSession) {
      chatSession = await prisma.chatSession.create({ data: {} });
    }

    await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: "user",
        content: message,
      },
    });

    // FAQ 기반 매칭
    const faqEntries = await prisma.fAQEntry.findMany({
      where: { isActive: true },
    });

    let aiResponse = "";
    const lowerMessage = message.toLowerCase();

    const matchedFaq = faqEntries.find((faq) =>
      faq.question.toLowerCase().includes(lowerMessage) ||
      lowerMessage.includes(faq.question.toLowerCase().substring(0, 10))
    );

    if (matchedFaq) {
      aiResponse = matchedFaq.answer;
    } else {
      // 기본 키워드 기반 응답
      const settings = await prisma.chatbotSettings.findFirst();
      const greeting = settings?.greeting || "안녕하세요! StayNest 호텔입니다.";

      if (
        lowerMessage.includes("안녕") ||
        lowerMessage.includes("hello")
      ) {
        aiResponse = greeting;
      } else if (
        lowerMessage.includes("예약") ||
        lowerMessage.includes("booking")
      ) {
        aiResponse =
          "예약은 객실 상세 페이지에서 원하시는 날짜와 인원을 선택하여 진행하실 수 있습니다. 더 도움이 필요하시면 말씀해주세요!";
      } else if (
        lowerMessage.includes("취소") ||
        lowerMessage.includes("cancel")
      ) {
        aiResponse =
          "예약 취소는 마이페이지 > 예약 내역에서 가능합니다. 체크인 3일 전까지 무료 취소가 가능하며, 이후에는 취소 수수료가 발생할 수 있습니다.";
      } else if (
        lowerMessage.includes("체크인") ||
        lowerMessage.includes("check-in")
      ) {
        aiResponse =
          "체크인은 오후 3시부터 가능하며, 체크아웃은 오전 11시까지입니다. 얼리 체크인이나 레이트 체크아웃을 원하시면 미리 문의해주세요.";
      } else if (
        lowerMessage.includes("주차") ||
        lowerMessage.includes("parking")
      ) {
        aiResponse =
          "투숙객 전용 주차장을 운영하고 있으며, 1박당 무료 주차가 제공됩니다. 발렛 파킹 서비스도 이용 가능합니다.";
      } else if (
        lowerMessage.includes("조식") ||
        lowerMessage.includes("breakfast")
      ) {
        aiResponse =
          "조식은 오전 7시부터 10시까지 1층 레스토랑에서 제공됩니다. 한식, 양식 뷔페를 즐기실 수 있으며, 투숙객 할인이 적용됩니다.";
      } else if (
        lowerMessage.includes("가격") ||
        lowerMessage.includes("price") ||
        lowerMessage.includes("요금")
      ) {
        aiResponse =
          "객실 요금은 등급과 시즌에 따라 다릅니다. 스탠다드룸은 1박 10만원~, 스위트룸은 1박 45만원~입니다. 자세한 가격은 객실 페이지에서 확인해주세요.";
      } else {
        aiResponse = `${greeting} 문의하신 내용을 확인하고 있습니다. 구체적인 질문을 해주시면 더 정확한 답변을 드릴 수 있습니다. 예약, 체크인/아웃, 시설, 가격 등에 대해 물어보세요!`;
      }
    }

    // OpenAI API 연동 (환경변수 설정 시)
    if (process.env.OPENAI_API_KEY && !matchedFaq) {
      try {
        const history = await prisma.chatMessage.findMany({
          where: { sessionId: chatSession.id },
          orderBy: { createdAt: "asc" },
          take: 10,
        });

        const settings = await prisma.chatbotSettings.findFirst();
        const systemPrompt =
          settings?.systemPrompt ||
          "당신은 StayNest 호텔의 AI 컨시어지입니다. 친절하고 전문적으로 고객의 질문에 답변해주세요.";

        const messages = [
          { role: "system" as const, content: systemPrompt },
          ...history.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        ];

        const openaiRes = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages,
              max_tokens: 500,
              temperature: 0.7,
            }),
          }
        );

        if (openaiRes.ok) {
          const data = await openaiRes.json();
          aiResponse = data.choices[0].message.content;
        }
      } catch {
        // OpenAI 실패 시 기본 응답 사용
      }
    }

    await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: "assistant",
        content: aiResponse,
      },
    });

    return NextResponse.json({
      message: aiResponse,
      sessionId: chatSession.id,
    });
  } catch {
    return NextResponse.json(
      { error: "챗봇 응답 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
