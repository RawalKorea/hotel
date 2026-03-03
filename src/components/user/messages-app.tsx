"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  MessageCircle,
  Send,
  Paperclip,
  Plus,
  ArrowLeft,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ConvItem = {
  id: string;
  type: string;
  name: string | null;
  participants: Array<{
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  }>;
  lastMessage?: { content: string; createdAt: string };
  updatedAt: string;
};

type MessageItem = {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: { id: string; name: string | null; image: string | null };
  attachments: Array<{ fileUrl: string; fileName: string }>;
};

export function MessagesApp() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<ConvItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [convLoading, setConvLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [fileInput, setFileInput] = useState<HTMLInputElement | null>(null);
  const [pendingFiles, setPendingFiles] = useState<
    Array<{ fileUrl: string; fileName: string; fileType?: string }>
  >([]);
  const [showNewConv, setShowNewConv] = useState(false);
  const [newConvSearch, setNewConvSearch] = useState("");
  const [searchUsers, setSearchUsers] = useState<
    Array<{ id: string; name: string | null; email: string | null }>
  >([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const fetchConvs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/messages/conversations");
      if (!res.ok) return;
      const data = await res.json();
      setConversations(data);
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (cid: string) => {
    setConvLoading(true);
    try {
      const res = await fetch(`/api/messages/conversations/${cid}/messages`);
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data);
    } catch {
      //
    } finally {
      setConvLoading(false);
    }
  };

  useEffect(() => {
    fetchConvs();
  }, []);

  useEffect(() => {
    if (selectedId) {
      fetchMessages(selectedId);
      pollRef.current = setInterval(() => fetchMessages(selectedId), 3000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [selectedId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleSend = async () => {
    if (
      (!input.trim() && pendingFiles.length === 0) ||
      !selectedId ||
      sending
    )
      return;

    setSending(true);
    try {
      const res = await fetch(
        `/api/messages/conversations/${selectedId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: input.trim(),
            attachmentUrls:
              pendingFiles.length > 0 ? pendingFiles : undefined,
          }),
        }
      );
      if (!res.ok) throw new Error();
      const newMsg = await res.json();
      setMessages((prev) => [...prev, newMsg]);
      setInput("");
      setPendingFiles([]);
      fetchConvs();
    } catch {
      //
    } finally {
      setSending(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/messages/upload", {
          method: "POST",
          body: fd,
        });
        if (!res.ok) continue;
        const data = await res.json();
        setPendingFiles((p) => [
          ...p,
          {
            fileUrl: data.fileUrl,
            fileName: data.fileName,
            fileType: data.fileType,
          },
        ]);
      } catch {
        //
      }
    }
    e.target.value = "";
  };

  const doSearchUsers = async () => {
    if (!newConvSearch.trim()) return;
    try {
      const res = await fetch(
        `/api/users/search?q=${encodeURIComponent(newConvSearch)}`
      );
      if (!res.ok) return;
      const data = await res.json();
      setSearchUsers(data);
    } catch {
      //
    }
  };

  const createNewConv = async (targetUserId?: string) => {
    try {
      const res = await fetch("/api/messages/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "direct",
          participantIds: targetUserId ? [targetUserId] : [],
        }),
      });
      if (!res.ok) throw new Error();
      const conv = await res.json();
      setConversations((p) => [
        {
          id: conv.id,
          type: conv.type,
          name: conv.name,
          participants:
            conv.participants?.map((p: { user: object }) => p.user) || [],
          lastMessage: undefined,
          updatedAt: conv.createdAt,
        },
        ...p,
      ]);
      setSelectedId(conv.id);
      setShowNewConv(false);
      setNewConvSearch("");
      setSearchUsers([]);
    } catch {
      //
    }
  };

  const selectedConv = conversations.find((c) => c.id === selectedId);
  const filteredConvs = searchQuery.trim()
    ? conversations.filter((c) => {
        const label =
          c.name ||
          c.participants
            ?.filter((p) => p.id !== session?.user?.id)
            .map((p) => p.name || p.email)
            .join(" ") ||
          "";
        return label
          .toLowerCase()
          .includes(searchQuery.trim().toLowerCase());
      })
    : conversations;

  return (
    <div className="flex flex-1 min-h-0 bg-muted/30">
      {/* 사이드바 - 대화 목록 (애플 스타일) */}
      <aside
        className={cn(
          "w-full md:w-80 lg:w-96 flex flex-col border-r border-border/60 bg-card/95 backdrop-apple shadow-apple",
          selectedId && "hidden md:flex"
        )}
      >
        <div className="p-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full"
              onClick={() => setSelectedId(null)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="대화 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-full bg-muted/50 border-border/80 h-9 text-sm"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNewConv(true)}
              title="새 대화"
              className="rounded-full"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-pulse text-muted-foreground text-sm">
                로딩 중...
              </div>
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery ? "검색 결과가 없습니다." : "대화가 없습니다."}
              </p>
              {!searchQuery && (
                <Button onClick={() => setShowNewConv(true)} className="rounded-full">
                  <Plus className="mr-2 h-4 w-4" />
                  새 대화 시작
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {filteredConvs.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={cn(
                    "w-full p-4 text-left flex items-center gap-3 hover:bg-muted/50 active:bg-muted/70 transition-colors",
                    selectedId === c.id && "bg-primary/8"
                  )}
                >
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarImage
                      src={
                        c.participants?.find(
                          (p) => p.id !== session?.user?.id
                        )?.image ?? undefined
                      }
                    />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {(
                        c.participants?.find(
                          (p) => p.id !== session?.user?.id
                        )?.name ||
                        c.name ||
                        "?"
                      )
                        ?.charAt(0)
                        .toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">
                      {c.name ||
                        c.participants
                          ?.filter((p) => p.id !== session?.user?.id)
                          .map((p) => p.name || p.email)
                          .join(", ") ||
                        "대화"}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {c.lastMessage?.content || "메시지 없음"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* 메인 - 채팅 영역 (전문 메시징 UI) */}
      <main
        className={cn(
          "flex-1 flex flex-col bg-background",
          !selectedId && "hidden md:flex"
        )}
      >
        {selectedId ? (
          <>
            {/* 채팅 헤더 */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60 bg-card/80 backdrop-apple">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-full"
                onClick={() => setSelectedId(null)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              {selectedConv && (
                <>
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={
                        selectedConv.participants?.find(
                          (p) => p.id !== session?.user?.id
                        )?.image ?? undefined
                      }
                    />
                    <AvatarFallback>
                      {(
                        selectedConv.participants?.find(
                          (p) => p.id !== session?.user?.id
                        )?.name || "?"
                      )
                        ?.charAt(0)
                        .toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {selectedConv.name ||
                        selectedConv.participants
                          ?.filter((p) => p.id !== session?.user?.id)
                          .map((p) => p.name || p.email)
                          .join(", ") ||
                        "대화"}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* 메시지 목록 */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {convLoading && messages.length === 0 ? (
                <div className="flex justify-center py-12">
                  <div className="animate-pulse text-muted-foreground">
                    로딩 중...
                  </div>
                </div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "flex gap-3",
                      m.senderId === session?.user?.id
                        ? "flex-row-reverse"
                        : "flex-row"
                    )}
                  >
                    {m.senderId !== session?.user?.id && (
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={m.sender.image ?? undefined} />
                        <AvatarFallback className="text-xs">
                          {m.sender.name?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-2.5 shadow-apple",
                        m.senderId === session?.user?.id
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-card border border-border/80 rounded-bl-md"
                      )}
                    >
                      {m.senderId !== session?.user?.id && (
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          {m.sender.name || "알 수 없음"}
                        </p>
                      )}
                      <p className="whitespace-pre-wrap text-sm">
                        {m.content}
                      </p>
                      {m.attachments?.map((a) => (
                        <a
                          key={a.fileUrl}
                          href={a.fileUrl}
                          target="_blank"
                          rel="noopener"
                          className="block text-xs mt-2 underline opacity-90"
                        >
                          📎 {a.fileName}
                        </a>
                      ))}
                      <p
                        className={cn(
                          "text-xs mt-1",
                          m.senderId === session?.user?.id
                            ? "opacity-80"
                            : "text-muted-foreground"
                        )}
                      >
                        {new Date(m.createdAt).toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 입력 영역 */}
            <div className="p-4 border-t border-border/60 bg-card/80 backdrop-apple">
              {pendingFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {pendingFiles.map((f, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded-lg text-xs"
                    >
                      {f.fileName}
                      <button
                        type="button"
                        onClick={() =>
                          setPendingFiles((p) => p.filter((_, j) => j !== i))
                        }
                        className="hover:text-destructive"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-end gap-2">
                <input
                  ref={setFileInput}
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleFileChange}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInput?.click()}
                  className="shrink-0"
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    (e.preventDefault(), handleSend())
                  }
                  placeholder="메시지를 입력하세요..."
                  className="flex-1 min-h-10 rounded-2xl border-border/80"
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={sending}
                  className="shrink-0 rounded-full shadow-apple"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
              <MessageCircle className="h-10 w-10 opacity-50" />
            </div>
            <p className="text-lg font-semibold text-foreground mb-2">메시지를 선택하세요</p>
            <p className="text-sm text-center max-w-sm mb-6">
              왼쪽에서 대화를 선택하거나 새 대화를 시작해보세요.
            </p>
            <Button
              className="mt-2 rounded-full px-6"
              onClick={() => setShowNewConv(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              새 대화
            </Button>
          </div>
        )}
      </main>

      <Dialog open={showNewConv} onOpenChange={setShowNewConv}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 대화</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="이름, 이메일, 아이디 검색"
              value={newConvSearch}
              onChange={(e) => setNewConvSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doSearchUsers()}
            />
            <Button variant="outline" onClick={doSearchUsers}>
              검색
            </Button>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {searchUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => createNewConv(u.id)}
                  className="w-full p-3 text-left rounded-xl hover:bg-muted transition-colors"
                >
                  {u.name || u.email || u.id}
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
