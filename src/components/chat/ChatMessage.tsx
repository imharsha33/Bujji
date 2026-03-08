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
    <div className={`flex gap-3 px-4 py-5 transition-colors ${isUser ? "" : "bg-accent/20"}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
          isUser
            ? "bg-secondary text-secondary-foreground"
            : "bg-gradient-to-br from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] shadow-sm shadow-primary/20"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4 text-primary-foreground" />}
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {isUser ? "You" : "BUJJI"}
        </span>

        {msg.images?.map((src, i) => (
          <img key={i} src={src} alt="uploaded" className="max-h-60 rounded-xl border border-border shadow-sm" />
        ))}

        <div className="prose prose-sm dark:prose-invert max-w-none break-words">
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
                  <code className="rounded-md bg-accent px-1.5 py-0.5 text-sm font-mono text-accent-foreground" {...props}>
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
    <div className="relative group rounded-xl overflow-hidden my-3 border border-border/50 shadow-sm">
      <div className="flex items-center justify-between bg-secondary px-4 py-2 text-xs text-muted-foreground">
        <span className="font-medium uppercase tracking-wider">{language}</span>
        <button onClick={copy} className="flex items-center gap-1 hover:text-foreground transition-colors">
          {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{ margin: 0, borderRadius: 0, fontSize: "0.8rem" }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
