import { useState, useEffect, useRef, useCallback } from "react";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Menu, Bot } from "lucide-react";
import { streamChat, type Msg } from "@/lib/chat-stream";
import {
  loadConversations,
  saveConversations,
  createConversation,
  type Conversation,
} from "@/lib/conversations";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const loaded = loadConversations();
    return loaded.length ? loaded : [createConversation()];
  });
  const [activeId, setActiveId] = useState(conversations[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const active = conversations.find((c) => c.id === activeId)!;

  // persist
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  // auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [active.messages]);

  const updateConvo = useCallback(
    (id: string, updater: (c: Conversation) => Conversation) => {
      setConversations((prev) => prev.map((c) => (c.id === id ? updater(c) : c)));
    },
    []
  );

  const handleSend = async (text: string, images: string[]) => {
    const userMsg: Msg = {
      role: "user",
      content: images.length
        ? `${text}\n\n[User attached ${images.length} image(s)]`
        : text,
      images,
    };

    const convoId = activeId;
    updateConvo(convoId, (c) => {
      const updated = { ...c, messages: [...c.messages, userMsg] };
      if (c.messages.length === 0) updated.title = text.slice(0, 40) || "Image chat";
      return updated;
    });

    setIsLoading(true);
    let assistantSoFar = "";

    const allMessages = [...active.messages, userMsg];

    try {
      await streamChat({
        messages: allMessages,
        onDelta: (chunk) => {
          assistantSoFar += chunk;
          const snapshot = assistantSoFar;
          updateConvo(convoId, (c) => {
            const msgs = [...c.messages];
            const last = msgs[msgs.length - 1];
            if (last?.role === "assistant") {
              msgs[msgs.length - 1] = { ...last, content: snapshot };
            } else {
              msgs.push({ role: "assistant", content: snapshot });
            }
            return { ...c, messages: msgs };
          });
        },
        onDone: () => setIsLoading(false),
        onError: (msg) => {
          toast({ title: "Error", description: msg, variant: "destructive" });
          setIsLoading(false);
        },
      });
    } catch {
      toast({ title: "Error", description: "Failed to connect", variant: "destructive" });
      setIsLoading(false);
    }
  };

  const handleNew = () => {
    const c = createConversation();
    setConversations((prev) => [c, ...prev]);
    setActiveId(c.id);
  };

  const handleDelete = (id: string) => {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (next.length === 0) {
        const fresh = createConversation();
        setActiveId(fresh.id);
        return [fresh];
      }
      if (activeId === id) setActiveId(next[0].id);
      return next;
    });
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed z-50 h-full md:relative md:z-auto transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:hidden"
        }`}
      >
        <ChatSidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={(id) => { setActiveId(id); setSidebarOpen(false); }}
          onNew={handleNew}
          onDelete={handleDelete}
        />
      </div>

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="h-5 w-5" />
          </Button>
          <Bot className="h-5 w-5 text-primary" />
          <h1 className="text-sm font-semibold truncate">{active.title}</h1>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {active.messages.length === 0 ? (
            <div className="flex h-full items-center justify-center p-8">
              <div className="text-center space-y-4 max-w-md">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">How can I help you?</h2>
                <p className="text-muted-foreground text-sm">
                  Ask me anything — coding, writing, analysis, or general questions. I support markdown, code blocks, and image uploads.
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {active.messages.map((m, i) => (
                <ChatMessage key={i} msg={m} />
              ))}
              {isLoading && active.messages[active.messages.length - 1]?.role === "user" && (
                <div className="flex gap-3 px-4 py-5 bg-muted/30">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                    <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                    <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="max-w-3xl mx-auto w-full">
          <ChatInput onSend={handleSend} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default Index;
