import { useState, useEffect, useRef, useCallback } from "react";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { Button } from "@/components/ui/button";
import { Menu, Trash2, Diamond, Sparkles } from "lucide-react";
import { streamChat, type Msg } from "@/lib/chat-stream";
import {
  loadConversations,
  saveConversations,
  createConversation,
  type Conversation,
} from "@/lib/conversations";
import { useToast } from "@/hooks/use-toast";
import bujjiHero from "@/assets/bujji-hero.png";

const suggestions = [
  { emoji: "🧠", text: "Explain neural networks with an analogy" },
  { emoji: "💻", text: "Write a prime number sieve in Python" },
  { emoji: "💬", text: "REST vs GraphQL differences" },
  { emoji: "✨", text: "Sci-fi story: AI that dreams" },
];

const Index = () => {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const loaded = loadConversations();
    return loaded.length ? loaded : [createConversation()];
  });
  const [activeId, setActiveId] = useState(conversations[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const handleClearChat = () => {
    updateConvo(activeId, (c) => ({ ...c, messages: [], title: "New Chat" }));
  };

  return (
    <div className="flex h-[100dvh] bg-background overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — always overlay on mobile, inline on lg+ */}
      <div
        className={`fixed z-50 h-full lg:relative lg:z-auto transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${sidebarOpen ? "" : "lg:block hidden lg:!block"}`}
        style={{ display: sidebarOpen ? "block" : undefined }}
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
        {/* Header — safe area top for notch devices */}
        <header className="flex items-center justify-between border-b border-border/30 px-3 sm:px-4 py-2.5 bg-background/90 backdrop-blur-md sticky top-0 z-10 pt-[max(0.625rem,env(safe-area-inset-top))]">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="hover:bg-secondary text-muted-foreground h-9 w-9">
              <Menu className="h-5 w-5" />
            </Button>
            {/* Show logo on mobile when sidebar is hidden */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="h-7 w-7 rounded-full border border-[hsl(var(--cyan-glow))]/50 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--cyan-glow))]" />
              </div>
              <span className="font-display text-sm font-bold tracking-widest text-foreground">BUJJI</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--green-online))]" />
            <span className="text-xs text-muted-foreground hidden sm:inline">BUJJI is online</span>
          </div>

          <Button variant="ghost" size="icon" onClick={handleClearChat} className="hover:bg-secondary text-muted-foreground h-9 w-9">
            <Trash2 className="h-4 w-4" />
          </Button>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain">
          {active.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-full p-4 sm:p-8 relative overflow-hidden">
              {/* Hero image — hidden on small screens for performance */}
              <div className="absolute inset-0 items-center justify-center pointer-events-none opacity-20 hidden sm:flex">
                <img src={bujjiHero} alt="" className="w-full max-w-3xl object-contain float-animation" />
              </div>

              <div className="relative z-10 text-center space-y-4 sm:space-y-6 max-w-lg w-full animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
                {/* Diamond icon */}
                <div className="mx-auto w-14 h-14 sm:w-20 sm:h-20 rounded-full border-2 border-[hsl(var(--primary))]/40 flex items-center justify-center glow-blue diamond-pulse">
                  <Diamond className="h-6 w-6 sm:h-8 sm:w-8 text-[hsl(var(--primary))]" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold">
                    <span className="gradient-text-hero">Hello, I'm </span>
                    <span className="gradient-text-bujji font-display tracking-wider">BUJJI</span>
                  </h2>
                  <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted-foreground font-medium">
                    Your Intelligent AI Companion
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto px-2">
                  Ask me anything — from complex code to creative writing, research to calculations.
                </p>

                {/* Suggestion cards — stack on very small screens */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pt-2 sm:pt-4 max-w-xl mx-auto">
                  {suggestions.map((s) => (
                    <button
                      key={s.text}
                      onClick={() => handleSend(s.text, [])}
                      className="glass-card flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-left text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-all duration-300 group active:scale-[0.98]"
                    >
                      <span className="text-base sm:text-lg">{s.emoji}</span>
                      <span className="group-hover:translate-x-0.5 transition-transform duration-200">{s.text}</span>
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
                <div className="flex gap-3 px-3 sm:px-4 py-4 sm:py-5">
                  <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-accent">
                    <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[hsl(var(--cyan-glow))]" />
                  </div>
                  <div className="flex items-center gap-1.5 pt-1.5">
                    <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-[hsl(var(--cyan-glow))]/70 animate-bounce [animation-delay:0ms]" />
                    <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-[hsl(var(--cyan-glow))]/70 animate-bounce [animation-delay:150ms]" />
                    <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-[hsl(var(--cyan-glow))]/70 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input — safe area bottom for home indicator */}
        <div className="max-w-3xl mx-auto w-full pb-[env(safe-area-inset-bottom)]">
          <ChatInput onSend={handleSend} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default Index;
