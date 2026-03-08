import { useState, useRef, type KeyboardEvent } from "react";
import { Send, ImagePlus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  onSend: (text: string, images: string[]) => void;
  isLoading: boolean;
}

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

  return (
    <div className="p-4 pb-6">
      {images.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {images.map((src, i) => (
            <div key={i} className="relative group">
              <img src={src} alt="" className="h-16 w-16 rounded-xl object-cover border border-border shadow-sm" />
              <button
                onClick={() => setImages((p) => p.filter((_, j) => j !== i))}
                className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 rounded-2xl border border-border/60 bg-card p-2 shadow-lg shadow-primary/5 focus-within:border-primary/40 focus-within:shadow-primary/10 transition-all duration-300">
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onFile} />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileRef.current?.click()}
          className="shrink-0 text-muted-foreground hover:text-primary hover:bg-accent rounded-xl h-10 w-10"
        >
          <ImagePlus className="h-5 w-5" />
        </Button>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKey}
          placeholder="Message BUJJI..."
          className="min-h-[44px] max-h-40 resize-none border-0 bg-transparent focus-visible:ring-0 shadow-none text-sm"
          rows={1}
        />

        <Button
          onClick={submit}
          disabled={isLoading || (!text.trim() && images.length === 0)}
          size="icon"
          className="shrink-0 rounded-xl h-10 w-10 bg-gradient-to-r from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] hover:opacity-90 shadow-md shadow-primary/20 transition-all duration-200 disabled:opacity-30"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>

      <p className="text-[10px] text-muted-foreground/50 text-center mt-2">
        BUJJI can make mistakes. Consider checking important info.
      </p>
    </div>
  );
}
