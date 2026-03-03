"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { MessageCircle, X, Send, Paperclip, Users, Plus } from "lucide-react";
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
  participants: Array<{ id: string; name: string | null; email: string | null; image: string | null }>;
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

export function MessagePanel() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<ConvItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fileInput, setFileInput] = useState<HTMLInputElement | null>(null);
  const [pendingFiles, setPendingFiles] = useState<Array<{ fileUrl: string; fileName: string; fileType?: string }>>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const fetchConvs = async () => {
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
    try {
      const res = await fetch(`/api/messages/conversations/${cid}/messages`);
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data);
    } catch {
      //
    }
  };

  useEffect(() => {
    if (status === "authenticated" && isOpen) {
      fetchConvs();
    }
  }, [status, isOpen]);

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
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if ((!input.trim() && pendingFiles.length === 0) || !selectedId || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/messages/conversations/${selectedId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: input.trim(),
          attachmentUrls: pendingFiles.length ? pendingFiles : undefined,
        }),
      });
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
        const res = await fetch("/api/messages/upload", { method: "POST", body: fd });
        if (!res.ok) continue;
        const data = await res.json();
        setPendingFiles((p) => [...p, { fileUrl: data.fileUrl, fileName: data.fileName, fileType: data.fileType }]);
      } catch {
        //
      }
    }
    e.target.value = "";
  };

  const [showNewConv, setShowNewConv] = useState(false);
  const [newConvSearch, setNewConvSearch] = useState("");
  const [searchUsers, setSearchUsers] = useState<Array<{ id: string; name: string | null; email: string | null }>>([]);
  const [selectedNewUserId, setSelectedNewUserId] = useState<string | null>(null);

  const doSearchUsers = async () => {
    if (!newConvSearch.trim()) return;
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(newConvSearch)}`);
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
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      const conv = await res.json();
      setConversations((p) => [{
        id: conv.id,
        type: conv.type,
        name: conv.name,
        participants: conv.participants?.map((p: { user: object }) => p.user) || [],
        lastMessage: undefined,
        updatedAt: conv.createdAt,
      }, ...p]);
      setSelectedId(conv.id);
      setShowNewConv(false);
      setNewConvSearch("");
      setSearchUsers([]);
      setSelectedNewUserId(null);
    } catch {
      //
    }
  };

  if (status !== "authenticated") return null;

  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-24 z-50 h-14 w-14 rounded-full shadow-lg",
          isOpen && "bg-destructive hover:bg-destructive/90"
        )}
        size="icon"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      <div
        className={cn(
          "fixed bottom-24 right-6 z-50 w-[400px] h-[500px] rounded-2xl border bg-card shadow-2xl overflow-hidden flex flex-col transition-[opacity,visibility,transform] duration-75",
          isOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-2 pointer-events-none"
        )}
      >
        <div className="bg-primary px-4 py-3 text-primary-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span className="font-semibold">메시지</span>
          </div>
          <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-white/20" onClick={() => setShowNewConv(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-1/3 border-r overflow-y-auto">
            {loading ? (
              <div className="p-4 text-sm text-muted-foreground">로딩 중...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">대화가 없습니다.</div>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={cn(
                    "w-full p-3 text-left hover:bg-muted/50 border-b",
                    selectedId === c.id && "bg-muted"
                  )}
                >
                  <p className="font-medium text-sm truncate">
                    {c.name || c.participants?.filter((p) => p.id !== session?.user?.id).map((p) => p.name || p.email).join(", ") || "대화"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {c.lastMessage?.content || "메시지 없음"}
                  </p>
                </button>
              ))
            )}
          </div>

          <div className="flex-1 flex flex-col">
            {selectedId ? (
              <>
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        "flex gap-2",
                        m.senderId === session?.user?.id ? "justify-end" : "justify-start"
                      )}
                    >
                      {m.senderId !== session?.user?.id && (
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={m.sender.image ?? undefined} />
                          <AvatarFallback className="text-xs">{m.sender.name?.[0] || "?"}</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                          m.senderId === session?.user?.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        <p className="whitespace-pre-wrap">{m.content}</p>
                        {m.attachments?.map((a) => (
                          <a key={a.fileUrl} href={a.fileUrl} target="_blank" rel="noopener" className="block text-xs mt-1 underline">
                            {a.fileName}
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t p-2 space-y-2">
                  {pendingFiles.length > 0 && (
                    <div className="flex flex-wrap gap-1 text-xs">
                      {pendingFiles.map((f, i) => (
                        <span key={i} className="bg-muted px-2 py-1 rounded">
                          {f.fileName}
                          <button type="button" onClick={() => setPendingFiles((p) => p.filter((_, j) => j !== i))} className="ml-1">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      ref={setFileInput}
                      type="file"
                      className="hidden"
                      multiple
                      onChange={handleFileChange}
                    />
                    <Button variant="ghost" size="icon" onClick={() => fileInput?.click()}>
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                      placeholder="메시지..."
                      className="flex-1"
                    />
                    <Button size="icon" onClick={handleSend} disabled={sending}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                대화를 선택하세요
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showNewConv} onOpenChange={setShowNewConv}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 대화</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Input
              placeholder="이름, 이메일, 아이디 검색"
              value={newConvSearch}
              onChange={(e) => setNewConvSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doSearchUsers()}
            />
            <Button variant="outline" size="sm" onClick={doSearchUsers}>검색</Button>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {searchUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => createNewConv(u.id)}
                  className="w-full p-2 text-left rounded hover:bg-muted"
                >
                  {u.name || u.email || u.id}
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
