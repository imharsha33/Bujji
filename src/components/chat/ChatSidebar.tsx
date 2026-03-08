import { Plus, GraduationCap, Code2, Search, PenTool, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Conversation } from "@/lib/conversations";

interface Props {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

const capabilities = [
  { icon: GraduationCap, label: "Education", desc: "Learn anything", color: "text-emerald-400" },
  { icon: Code2, label: "Development", desc: "Code & debug", color: "text-blue-400" },
  { icon: Search, label: "Research", desc: "Deep analysis", color: "text-cyan-400" },
  { icon: PenTool, label: "Creative", desc: "Write & create", color: "text-amber-400" },
];

export function ChatSidebar({ conversations, activeId, onSelect, onNew, onDelete }: Props) {
  return (
    <div className="flex h-full w-[280px] flex-col bg-[hsl(var(--sidebar-background))] border-r border-border/40">
      {/* Logo — with safe area top */}
      <div className="p-4 sm:p-5 pb-3 sm:pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-3 mb-5 sm:mb-6">
          <div className="h-9 w-9 rounded-full border-2 border-[hsl(var(--cyan-glow))] flex items-center justify-center glow-cyan">
            <Sparkles className="h-4 w-4 text-[hsl(var(--cyan-glow))]" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold tracking-widest text-foreground">BUJJI</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">AI Assistant</p>
          </div>
        </div>

        <Button
          onClick={onNew}
          variant="outline"
          className="w-full justify-center gap-2 border-[hsl(var(--cyan-glow))]/30 text-[hsl(var(--cyan-glow))] hover:bg-[hsl(var(--cyan-glow))]/10 hover:border-[hsl(var(--cyan-glow))]/50 h-10 sm:h-11 font-medium tracking-wide transition-all duration-300 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          New Conversation
        </Button>
      </div>

      {/* Capabilities */}
      <div className="px-4 sm:px-5 pb-3">
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-semibold mb-2 sm:mb-3">Capabilities</p>
        <div className="space-y-0.5">
          {capabilities.map((cap) => (
            <div
              key={cap.label}
              className="flex items-center gap-2.5 sm:gap-3 rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 text-sm cursor-default hover:bg-secondary/50 transition-colors duration-200"
            >
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-secondary/80 flex items-center justify-center">
                <cap.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${cap.color}`} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-foreground">{cap.label}</p>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground">{cap.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conversation list */}
      <ScrollArea className="flex-1 px-2 sm:px-3 pt-1 sm:pt-2">
        <div className="space-y-0.5 pb-4">
          {conversations.map((c) => (
            <div
              key={c.id}
              className={`group flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm cursor-pointer transition-all duration-200 active:scale-[0.98] ${
                c.id === activeId
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
              onClick={() => onSelect(c.id)}
            >
              <span className="flex-1 truncate text-xs">{c.title}</span>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer — with safe area bottom */}
      <div className="border-t border-border/40 p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[hsl(var(--green-online))]" />
          <span className="text-[10px] sm:text-xs text-muted-foreground">BUJJI Local Engine</span>
        </div>
        <p className="text-[9px] sm:text-[10px] text-muted-foreground/50 mt-1 pl-4">
          {conversations.reduce((a, c) => a + c.messages.length, 0)} messages
        </p>
      </div>
    </div>
  );
}
