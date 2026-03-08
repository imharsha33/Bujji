import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Detect if a message needs live web search
function needsWebSearch(text: string): boolean {
  const lower = text.toLowerCase();
  const keywords = [
    "today", "yesterday", "latest", "current", "recent", "now",
    "news", "update", "score", "price", "weather", "stock",
    "who is the", "who won", "what happened", "breaking",
    "this week", "this month", "2025", "2026", "2027",
    "captain", "president", "minister", "ceo", "leader",
    "match", "game", "election", "results", "release",
    "trending", "live", "ongoing", "announced", "just",
  ];
  return keywords.some((k) => lower.includes(k));
}

// Call Firecrawl search
async function webSearch(query: string): Promise<string> {
  const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
  if (!apiKey) return "";

  try {
    const resp = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        limit: 5,
        scrapeOptions: { formats: ["markdown"] },
      }),
    });

    if (!resp.ok) {
      console.error("Firecrawl search failed:", resp.status);
      return "";
    }

    const data = await resp.json();
    const results = data.data || data.results || [];

    if (!results.length) return "";

    let context = "## Live Web Search Results\n\n";
    for (const r of results) {
      context += `### ${r.title || "Result"}\n`;
      context += `**URL:** ${r.url}\n`;
      if (r.description) context += `${r.description}\n`;
      if (r.markdown) context += `${r.markdown.slice(0, 1500)}\n`;
      context += "\n---\n\n";
    }
    return context;
  } catch (e) {
    console.error("Web search error:", e);
    return "";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const today = new Date().toISOString().split("T")[0];
    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user")?.content || "";

    // Search the web if the question seems time-sensitive
    let searchContext = "";
    if (needsWebSearch(lastUserMsg)) {
      console.log("Performing web search for:", lastUserMsg);
      searchContext = await webSearch(lastUserMsg);
      if (searchContext) {
        console.log("Got web search results, injecting into context");
      }
    }

    const systemPrompt = `You are BUJJI, a highly capable AI assistant. Today's date is ${today}.

Key behaviors:
- Format responses using markdown: headings, bold, lists, code blocks with language tags
- For code questions, provide complete, working examples with syntax highlighting
- Be concise but thorough
- Be friendly and conversational
- When citing information from web search results, mention the source URL
- If web search results are provided below, use them as your PRIMARY source of truth for answering the question. Do NOT rely on your training data for time-sensitive facts — always prefer the search results.
- If the search results don't contain a clear answer, say so honestly.

${searchContext ? `\n--- LIVE WEB SEARCH RESULTS (use these as primary source) ---\n\n${searchContext}` : ""}`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
