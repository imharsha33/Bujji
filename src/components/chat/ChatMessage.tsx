import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Sparkles, User, Copy, Check } from "lucide-react";
import { useState } from "react";
import type { Msg } from "@/lib/chat-stream";

export function ChatMessage({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";

  return (
    <div className={`flex gap-3 px-4 py-5 transition-colors ${isUser ? "" : "bg-secondary/20"}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
          isUser
            ? "bg-secondary text-secondary-foreground"
            : "bg-accent border border-[hsl(var(--cyan-glow))]/20"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Sparkles className="h-4 w-4 text-[hsl(var(--cyan-glow))]" />
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <span className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${
          isUser ? "text-muted-foreground" : "text-[hsl(var(--cyan-glow))]/70"
        }`}>
          {isUser ? "You" : "BUJJI"}
        </span>

        {msg.images?.map((src, i) => (
          <img key={i} src={src} alt="uploaded" className="max-h-60 rounded-xl border border-border" />
        ))}

        <div className="prose prose-sm prose-invert max-w-none break-words">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                const code = String(children).replace(/\n$/, "");
                if (match) {
                  return <CodeBlock language={match[1]} code={code} />;
                }
                return (
                  <code className="rounded-md bg-secondary px-1.5 py-0.5 text-sm font-mono text-accent-foreground" {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {msg.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-xl overflow-hidden my-3 border border-border/50">
      <div className="flex items-center justify-between bg-secondary px-4 py-2 text-xs text-muted-foreground">
        <span className="font-medium uppercase tracking-wider font-mono text-[10px]">{language}</span>
        <button onClick={copy} className="flex items-center gap-1 hover:text-foreground transition-colors">
          {copied ? <Check className="h-3 w-3 text-[hsl(var(--green-online))]" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{ margin: 0, borderRadius: 0, fontSize: "0.8rem", background: "hsl(222 44% 6%)" }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
