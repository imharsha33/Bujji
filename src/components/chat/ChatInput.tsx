import { useState, useRef, type KeyboardEvent } from "react";
import { Send, ImagePlus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  onSend: (text: string, images: string[]) => void;
  isLoading: boolean;
}

const MAX_CHARS = 4000;

export function ChatInput({ onSend, isLoading }: Props) {
  const [text, setText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed && images.length === 0) return;
    onSend(trimmed, images);
    setText("");
    setImages([]);
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((f) => {
      if (!f.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => setImages((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(f);
    });
    e.target.value = "";
  };

  const handleChange = (val: string) => {
    if (val.length <= MAX_CHARS) setText(val);
  };

  return (
    <div className="p-4 pb-5">
      {images.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {images.map((src, i) => (
            <div key={i} className="relative group">
              <img src={src} alt="" className="h-16 w-16 rounded-xl object-cover border border-border" />
              <button
                onClick={() => setImages((p) => p.filter((_, j) => j !== i))}
                className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="relative rounded-2xl border border-border/50 bg-card input-glow transition-all duration-300">
        {/* Char count */}
        <div className="absolute top-3 right-4 text-[10px] text-muted-foreground/50 tabular-nums">
          {text.length}/{MAX_CHARS}
        </div>

        <div className="pt-3 pb-2 px-4">
          <Textarea
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={onKey}
            placeholder="Ask BUJJI anything..."
            className="min-h-[60px] max-h-40 resize-none border-0 bg-transparent focus-visible:ring-0 shadow-none text-sm p-0 placeholder:text-muted-foreground/40"
            rows={2}
          />
        </div>

        <div className="flex items-center justify-between px-3 pb-3">
          <div className="flex items-center gap-1">
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onFile} />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileRef.current?.click()}
              className="text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl h-8 w-8"
            >
              <ImagePlus className="h-4 w-4" />
            </Button>
          </div>

          <Button
            onClick={submit}
            disabled={isLoading || (!text.trim() && images.length === 0)}
            size="icon"
            className="rounded-xl h-9 w-9 bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/30 border border-[hsl(var(--primary))]/30 disabled:opacity-20 transition-all duration-200"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Keyboard shortcuts */}
      <div className="flex items-center justify-center gap-3 mt-2.5 text-[10px] text-muted-foreground/40">
        <span>Press <kbd className="px-1.5 py-0.5 rounded bg-secondary text-muted-foreground text-[9px] font-mono">Enter</kbd> to send,</span>
        <span><kbd className="px-1.5 py-0.5 rounded bg-secondary text-muted-foreground text-[9px] font-mono">Shift+Enter</kbd> for new line,</span>
        <span><kbd className="px-1.5 py-0.5 rounded bg-secondary text-muted-foreground text-[9px] font-mono">Esc</kbd> to stop</span>
      </div>
    </div>
  );
}
