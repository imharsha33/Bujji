import { Plus, MessageSquare, Trash2, Sparkles } from "lucide-react";
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

export function ChatSidebar({ conversations, activeId, onSelect, onNew, onDelete }: Props) {
  return (
    <div className="flex h-full w-72 flex-col bg-card/50 backdrop-blur-xl border-r border-border/50">
      {/* Logo */}
      <div className="p-4 pb-2">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] flex items-center justify-center shadow-md shadow-primary/20">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold gradient-text tracking-tight">BUJJI</span>
        </div>
        <Button
          onClick={onNew}
          className="w-full justify-start gap-2 bg-gradient-to-r from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] text-primary-foreground hover:opacity-90 shadow-md shadow-primary/20 transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2 pt-2">
        <div className="space-y-0.5 pb-4">
          {conversations.map((c) => (
            <div
              key={c.id}
              className={`group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm cursor-pointer transition-all duration-200 ${
                c.id === activeId
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              }`}
              onClick={() => onSelect(c.id)}
            >
              <MessageSquare className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate">{c.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(c.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-muted-foreground hover:text-destructive p-0.5 rounded-md hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t border-border/50 p-4">
        <p className="text-[11px] text-muted-foreground/60 text-center tracking-wide uppercase">
          Powered by BUJJI AI
        </p>
      </div>
    </div>
  );
}
