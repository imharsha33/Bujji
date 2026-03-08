import { useState, useEffect, useRef, useCallback } from "react";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { Button } from "@/components/ui/button";
import { Menu, Sparkles } from "lucide-react";
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

  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

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
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed z-50 h-full md:relative md:z-auto transition-all duration-300 ease-in-out ${
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
        <header className="flex items-center gap-3 border-b border-border/50 px-4 py-3 backdrop-blur-md bg-background/80 sticky top-0 z-10">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="hover:bg-accent">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-sm font-semibold truncate">{active.title}</h1>
          </div>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {active.messages.length === 0 ? (
            <div className="flex h-full items-center justify-center p-8">
              <div className="text-center space-y-6 max-w-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] shadow-lg shadow-primary/25">
                  <Sparkles className="h-10 w-10 text-primary-foreground" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold gradient-text">Hey, I'm BUJJI</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
                    Your AI assistant — ready to help with coding, writing, analysis, or anything else. Try asking me something!
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  {["Write a poem", "Explain React hooks", "Debug my code"].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSend(s, [])}
                      className="px-4 py-2 rounded-full text-xs font-medium border border-border hover:border-primary/50 hover:bg-accent text-muted-foreground hover:text-foreground transition-all duration-200"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto pb-4">
              {active.messages.map((m, i) => (
                <ChatMessage key={i} msg={m} />
              ))}
              {isLoading && active.messages[active.messages.length - 1]?.role === "user" && (
                <div className="flex gap-3 px-4 py-5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))]">
                    <Sparkles className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="flex items-center gap-1.5 pt-2">
                    <div className="h-2 w-2 rounded-full bg-primary/70 animate-bounce [animation-delay:0ms]" />
                    <div className="h-2 w-2 rounded-full bg-primary/70 animate-bounce [animation-delay:150ms]" />
                    <div className="h-2 w-2 rounded-full bg-primary/70 animate-bounce [animation-delay:300ms]" />
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
